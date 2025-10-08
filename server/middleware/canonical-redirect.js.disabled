export default defineEventHandler(async (event) => {
  // Server middleware: Handles canonical category redirects for article URLs
  // Ensures articles are accessed via their main category URL

  const url = getRequestURL(event)
  const path = url.pathname

  console.log(`[SERVER MW] Processing request: ${getMethod(event)} ${path}`)

  // Only handle GET and HEAD requests
  if (!['GET', 'HEAD'].includes(getMethod(event))) {
    console.log(`[SERVER MW] Skipping non-GET/HEAD request: ${getMethod(event)}`)
    return
  }

  // Skip API routes to avoid infinite loops
  if (path.startsWith('/api/')) {
    console.log(`[SERVER MW] Skipping API route: ${path}`)
    return
  }

  // Redirect loop protection: check if we've already processed this URL
  // This prevents infinite redirect loops
  const redirectCount = event.node.req.headers['x-redirect-count']
  if (redirectCount && parseInt(redirectCount) > 3) {
    console.error(`[SERVER MW] Redirect loop detected! Already redirected ${redirectCount} times for: ${path}`)
    return
  }

  // Check if the path has exactly 2 segments (like /something/slug/)
  // After url-normalization, all URLs should have trailing slash
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) {
    console.log(`[SERVER MW] Path doesn't match pattern: ${path}`)
    return
  }

  const [, category, slug] = pathMatch

  // Skip API routes to avoid infinite loops
  if (path.startsWith('/api/')) {
    console.log(`[SERVER MW] Skipping API route: ${path}`)
    return
  }

  // REMOVED: Don't redirect based on URL mapping alone
  // We need to check the actual article categories first to avoid loops
  // The subcategory URLs (like /domaci-fudbal/) are valid if the article belongs to them

  // Validate ALL categories against article data (not just main categories)
  // This ensures we redirect to the correct canonical category based on actual article data
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']

  console.log(`[SERVER MW] Checking category: ${category}, will validate against article data`)

  try {
    // Get runtime config for API URL
    const config = useRuntimeConfig()
    const backendUrl = config.public.BACKEND_URL
    const apiKey = config.public.API_KEY

    if (!backendUrl) {
      console.warn(`[SERVER MW] No BACKEND_URL configured, skipping redirect`)
      return
    }

    // Fetch article data to determine canonical category (use same endpoint as page component)
    const apiUrl = `${backendUrl}/getArticlesBySlug/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`

    console.log(`[SERVER MW] Fetching article data from: ${apiUrl}`)

    const response = await $fetch(apiUrl, {
      headers: apiKey ? { 'Authorization': apiKey } : {},
      // Add timeout to prevent hanging
      timeout: 5000,
      // Retry once on failure
      retry: 1
    }).catch(err => {
      // If it's a 404, throw an error to show the error page
      if (err.response?.status === 404 || err.statusCode === 404) {
        console.log(`[SERVER MW] Article not found (404), will show error page`)
        throw createError({
          statusCode: 404,
          statusMessage: 'Page Not Found',
          fatal: true
        })
      }
      
      // For other errors, log and return null (let page handle it)
      console.warn(`[SERVER MW] Failed to fetch article data:`, err.message)
      return null
    })

    console.log(`[SERVER MW] API response received:`, response ? 'has data' : 'no data')

    // API now only returns article data (no redirects)
    // Validate response structure
    if (!response || !response.article || !response.article.categories) {
      console.log(`[SERVER MW] Invalid response or no article data, skipping redirect`)
      return
    }

    const article = response.article

    if (!Array.isArray(article.categories) || article.categories.length === 0) {
      console.log(`[SERVER MW] Article has no valid categories array`)
      return
    }

    // Extract category slugs from the article (consistent with API resolve logic)
    const articleCategories = article.categories
      .map(cat => cat.slug || cat.name || cat)
      .filter(Boolean)
      .map(name => name.toLowerCase())

    console.log(`[SERVER MW] Article categories:`, articleCategories)

    // Find if any main category exists in the article categories
    const foundMainCategory = mainCategories.find(mainCat =>
      articleCategories.includes(mainCat)
    )

    let canonicalCategory
    if (foundMainCategory) {
      // Use the main category as canonical
      canonicalCategory = foundMainCategory
      console.log(`[SERVER MW] Found main category: ${canonicalCategory}`)
    } else {
      // Use the first category as canonical if no main category found
      canonicalCategory = articleCategories[0]
      console.log(`[SERVER MW] Using first category: ${canonicalCategory}`)
    }

    // If the current URL doesn't use the canonical category, redirect
    if (canonicalCategory && category.toLowerCase() !== canonicalCategory.toLowerCase()) {
      // Preserve trailing slash (url-normalization ensures it exists)
      const redirectUrl = `/${canonicalCategory}/${slug}/`

      // Prevent redirect loop: don't redirect if target URL is the same as current
      if (redirectUrl === path || redirectUrl + '/' === path || redirectUrl === path + '/') {
        console.log(`[SERVER MW] Skipping redirect - target URL same as current: ${path}`)
        return
      }

      console.log(`[SERVER MW] Category mismatch detected: ${path} -> ${redirectUrl}`)

      // Preserve query string if present
      const queryString = url.search || ''
      const finalRedirectUrl = redirectUrl + queryString

      // Send 301 redirect
      await sendRedirect(event, finalRedirectUrl, 301)
      return
    } else {
      console.log(`[SERVER MW] Category is correct, no redirect needed`)
    }

  } catch (error) {
    // If API call fails, let the request proceed normally (don't block the page)
    console.warn('[SERVER MW] Unexpected error:', error.message)
    return
  }

  // No redirect needed, let the request continue
})