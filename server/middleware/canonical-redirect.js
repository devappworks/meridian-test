export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  console.log(`[SERVER MW] Processing request: ${getMethod(event)} ${path}`)

  // Only handle GET and HEAD requests
  if (!['GET', 'HEAD'].includes(getMethod(event))) {
    console.log(`[SERVER MW] Skipping non-GET/HEAD request: ${getMethod(event)}`)
    return
  }

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) {
    console.log(`[SERVER MW] Path doesn't match pattern: ${path}`)
    return
  }

  const [, category, slug] = pathMatch

  // Skip if it's already a main category or API route
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']
  if (mainCategories.includes(category.toLowerCase()) || path.startsWith('/api/')) {
    return
  }

  try {
    // Get runtime config for API URL
    const config = useRuntimeConfig()
    const backendUrl = config.public.BACKEND_URL
    const apiKey = config.public.API_KEY

    // Fetch article data to determine canonical category (use same endpoint as page component)
    const apiUrl = `${backendUrl}/getArticlesBySlug/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`

    const response = await $fetch(apiUrl, {
      headers: apiKey ? { 'X-API-Key': apiKey } : {}
    })

    // If response is HTML (redirect response), parse the redirect URL
    if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
      const redirectMatch = response.match(/url=([^"]+)/)
      if (redirectMatch) {
        const redirectUrl = redirectMatch[1]
        console.log(`[SERVER MIDDLEWARE] HTML redirect detected: ${path} -> ${redirectUrl}`)

        // Send 301 redirect
        await sendRedirect(event, redirectUrl, 301)
        return
      }
    }

    // If response is JSON with article data
    if (response && response.article && response.article.categories) {
      const article = response.article

      if (!Array.isArray(article.categories)) {
        return
      }

      // Extract category names from the article
      const articleCategories = article.categories
        .map(cat => cat.name || cat.slug || cat)
        .filter(Boolean)
        .map(name => name.toLowerCase())

      // Find if any main category exists in the article categories
      const foundMainCategory = mainCategories.find(mainCat =>
        articleCategories.includes(mainCat)
      )

      let canonicalCategory
      if (foundMainCategory) {
        // Use the main category as canonical
        canonicalCategory = foundMainCategory
      } else {
        // Use the first category as canonical if no main category found
        canonicalCategory = articleCategories[0]
      }

      // If the current URL doesn't use the canonical category, redirect
      if (canonicalCategory && category.toLowerCase() !== canonicalCategory.toLowerCase()) {
        const redirectUrl = `/${canonicalCategory}/${slug}`
        console.log(`[SERVER MIDDLEWARE] Dynamic redirect: ${path} -> ${redirectUrl}`)

        // Send 301 redirect
        await sendRedirect(event, redirectUrl, 301)
        return
      }
    }

  } catch (error) {
    // If API call fails, let the request proceed normally
    console.warn('[SERVER MIDDLEWARE] API call failed:', error.message)
    return
  }

  // No redirect needed, let the request continue
})