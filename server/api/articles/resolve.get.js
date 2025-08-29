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

    const matched = candidates.find((a) => normalizePath(a?.url) === requestedPath)

    if (!matched || !matched.id) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Fetch full article details by ID to ensure contents are included
    const full = await $fetch(`${config.public.BACKEND_URL}/getOneArticle/${matched.id}`, {
      headers,
    })
    const article = full?.result?.article
    if (!article || typeof article !== 'object') {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    return article
  } catch (err) {
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to resolve article' })
  }
})


