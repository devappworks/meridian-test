// URL Normalization Middleware
// Runs FIRST (00. prefix) to normalize URLs before other middlewares process them
// Handles: tracking params, double slashes, canonical category redirects, trailing slash enforcement
export default defineEventHandler(async (event) => {
  const url = event.node.req.url

  // Only handle GET and HEAD requests
  if (!['GET', 'HEAD'].includes(event.node.req.method)) {
    return
  }

  // Skip API routes, assets, and internal Nuxt routes
  if (url.startsWith('/api/') ||
      url.startsWith('/_nuxt/') ||
      url.startsWith('/__nuxt') ||
      url.startsWith('/_ipx/')) {
    return
  }

  // Skip files with extensions
  const hasExtension = /\.[a-z0-9]+(\?.*)?$/i.test(url)
  if (hasExtension) {
    return
  }

  // Parse the URL
  const [pathname, queryString] = url.split('?')
  let normalizedPath = pathname
  let normalizedQuery = queryString || ''

  let needsRedirect = false
  let canonicalCategoryRedirect = null

  // 1. Normalize double (or multiple) slashes to single slash
  // e.g., /category/slug// → /category/slug/
  // e.g., /category//slug/ → /category/slug/
  const hasMultipleSlashes = /\/\/+/.test(normalizedPath)
  if (hasMultipleSlashes) {
    normalizedPath = normalizedPath.replace(/\/\/+/g, '/')
    needsRedirect = true
    console.log(`[URL NORMALIZE] Fixed multiple slashes: ${pathname} → ${normalizedPath}`)
  }

  // 2. Strip tracking query parameters (fbclid, utm_*, gclid, etc.)
  if (normalizedQuery) {
    const params = new URLSearchParams(normalizedQuery)
    const trackingParams = ['fbclid', 'gclid', 'msclkid', 'mc_eid', '_ga', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

    let paramsRemoved = false
    trackingParams.forEach(param => {
      if (params.has(param)) {
        params.delete(param)
        paramsRemoved = true
      }
    })

    if (paramsRemoved) {
      normalizedQuery = params.toString()
      needsRedirect = true
      console.log(`[URL NORMALIZE] Stripped tracking params from: ${url}`)
    }
  }

  // 3. Check for canonical category redirect BEFORE adding trailing slash
  // This prevents double redirects: one for trailing slash, one for category
  const pathMatch = normalizedPath.replace(/\/$/, '').match(/^\/([^\/]+)\/([^\/]+)$/i)
  if (pathMatch) {
    const [, category, slug] = pathMatch

    // SKIP canonical category check for /tag/ and /article/ routes
    // These are handled by their own route handlers
    if (category === 'tag' || category === 'article') {
      console.log(`[URL NORMALIZE] Skipping canonical check for /${category}/ route: ${normalizedPath}`)
    } else {
      const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']

    try {
      const config = useRuntimeConfig()
      const backendUrl = config.public.BACKEND_URL
      const apiKey = config.public.API_KEY

      if (backendUrl) {
        const apiUrl = `${backendUrl}/getArticlesBySlug/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`

        const response = await $fetch(apiUrl, {
          headers: apiKey ? { 'Authorization': apiKey } : {},
          timeout: 5000,
          retry: 1
        }).catch(err => {
          if (err.response?.status === 404 || err.statusCode === 404) {
            throw createError({
              statusCode: 404,
              statusMessage: 'Page Not Found',
              fatal: true
            })
          }
          return null
        })

        if (response?.article?.categories && Array.isArray(response.article.categories) && response.article.categories.length > 0) {
          const articleCategories = response.article.categories
            .map(cat => cat.slug || cat.name || cat)
            .filter(Boolean)
            .map(name => name.toLowerCase())

          const foundMainCategory = mainCategories.find(mainCat => articleCategories.includes(mainCat))
          const canonicalCategory = foundMainCategory || articleCategories[0]

          if (canonicalCategory && category.toLowerCase() !== canonicalCategory.toLowerCase()) {
            canonicalCategoryRedirect = `/${canonicalCategory}/${slug}`
            console.log(`[URL NORMALIZE] Canonical category redirect needed: ${normalizedPath} → ${canonicalCategoryRedirect}`)
          }
        }
      }
      } catch (error) {
        // If API fails, continue with normal processing
        console.warn('[URL NORMALIZE] Error checking canonical category:', error.message)
      }
    }
  }

  // If we need a canonical category redirect, use that path instead
  if (canonicalCategoryRedirect) {
    normalizedPath = canonicalCategoryRedirect
    needsRedirect = true
  }

  // 4. Enforce trailing slash policy (add trailing slash if missing)
  // Skip root path
  if (normalizedPath !== '/' && !normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath + '/'
    needsRedirect = true
    console.log(`[URL NORMALIZE] Added trailing slash: ${pathname} → ${normalizedPath}`)
  }

  // 5. Remove trailing slash if path ends with multiple slashes (after normalization)
  // e.g., /category/slug/// → /category/slug/
  if (normalizedPath !== '/' && normalizedPath.endsWith('//')) {
    normalizedPath = normalizedPath.replace(/\/+$/, '/')
    needsRedirect = true
    console.log(`[URL NORMALIZE] Normalized trailing slashes: ${pathname} → ${normalizedPath}`)
  }

  // If normalization is needed, perform 301 redirect
  if (needsRedirect) {
    const redirectUrl = normalizedPath + (normalizedQuery ? '?' + normalizedQuery : '')
    console.log(`[URL NORMALIZE] Redirecting: ${url} → ${redirectUrl}`)
    
    // Prevent redirect loops: if redirectUrl is the same as original, don't redirect
    if (redirectUrl === url) {
      console.log(`[URL NORMALIZE] Redirect URL same as original, skipping to prevent loop`)
      return
    }
    
    return sendRedirect(event, redirectUrl, 301)
  }

  // URL is already normalized, continue
})

