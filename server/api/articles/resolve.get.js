export default defineEventHandler(async (event) => {
  const query = getQuery(event) || {}
  const category = String(query.category || '').trim()
  const slug = String(query.slug || '').trim()

  if (!category || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category or slug' })
  }

  const config = useRuntimeConfig()
  const headers = {}
  if (config.API_KEY) headers.Authorization = config.API_KEY
  else if (config.public.API_KEY) headers.Authorization = config.public.API_KEY

  const requestedPath = `/${category}/${slug}`.toLowerCase()

  try {
    // First try finding the article via search
    const searchResponse = await $fetch(`${config.public.BACKEND_URL}/search`, {
      query: {
        searchText: slug,
        searchLimit: 10,
        page: 1,
      },
      headers,
    })

    const candidates = Array.isArray(searchResponse?.result?.articles)
      ? searchResponse.result.articles
      : []

    const normalizePath = (url) => {
      if (!url || typeof url !== 'string') return ''
      // If absolute URL, take only the pathname; else ensure it starts with '/'
      try {
        const u = new URL(url)
        return (u.pathname || '').toLowerCase()
      } catch {
        return (url.startsWith('/') ? url : `/${url}`).toLowerCase()
      }
    }

    // Helper to safely extract last segment (slug) and numeric id from a URL-like value
    const getLastSegment = (url) => {
      const p = normalizePath(url)
      if (!p) return ''
      const parts = p.replace(/\/$/, '').split('/')
      return parts[parts.length - 1] || ''
    }
    const getIdFromUrl = (url) => {
      const p = normalizePath(url)
      const m = p.match(/\/article\/(\d+)/)
      return m ? m[1] : null
    }

    const targetSlug = slug.toLowerCase()

    // Prefer exact slug matches (either explicit field or last URL segment)
    let matched = candidates.find((a) => {
      const s1 = (a?.slug || '').toLowerCase()
      const s2 = getLastSegment(a?.url)
      return s1 === targetSlug || s2 === targetSlug
    })

    // Fallback: if still not found, try any candidate whose URL contains the slug
    if (!matched) {
      matched = candidates.find((a) => normalizePath(a?.url).includes(`/${targetSlug}`))
    }

    if (!matched) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Determine id for full fetch
    const candidateId = matched.id || getIdFromUrl(matched.url)
    if (!candidateId) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Fetch full article details by ID to ensure contents are included
    const full = await $fetch(`${config.public.BACKEND_URL}/getOneArticle/${candidateId}`, {
      headers,
    })
    const article = full?.result?.article
    if (!article || typeof article !== 'object') {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Ensure requested category fits the article categories if available
    const categorySlugs = Array.isArray(article.categories)
      ? article.categories.map((c) => String(c?.slug || '').toLowerCase()).filter(Boolean)
      : []

    if (categorySlugs.length && !categorySlugs.includes(String(category).toLowerCase())) {
      // Category mismatch: keep returning article (allows redirect to canonical), but signal via header
      // Alternatively, throw 404 to enforce strict matching.
      // For flexibility, return the article so the page can render and decide.
    }

    return article
  } catch (err) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to resolve article' })
  }
})


