export default defineEventHandler(async (event) => {
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

  // Check if this is a subcategory that should be redirected immediately
  // Import and use the canonical category utility function
  const { getCanonicalCategoryFromSlug } = await import('~/utils/canonicalCategory')
  const canonicalCategory = getCanonicalCategoryFromSlug(category)
  
  // If the category maps to a different canonical category, redirect immediately
  if (canonicalCategory !== category) {
    // Preserve trailing slash (url-normalization ensures it exists)
    const redirectUrl = `/${canonicalCategory}/${slug}/`
    console.log(`[SERVER MW] Subcategory redirect: ${path} -> ${redirectUrl}`)
    
    // Preserve query string if present
    const queryString = url.search || ''
    const finalRedirectUrl = redirectUrl + queryString
    
    await sendRedirect(event, finalRedirectUrl, 301)
    return
  }

  // For main categories, we still need to validate against article data
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']
  const isMainCategory = mainCategories.includes(category.toLowerCase())
  
  if (isMainCategory) {
    console.log(`[SERVER MW] Main category detected: ${category}, will validate against article data`)
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
        console.log(`[SERVER MIDDLEWARE] Article has no valid categories array`)
        return
      }

      // Extract category slugs from the article (consistent with API resolve logic)
      const articleCategories = article.categories
        .map(cat => cat.slug || cat.name || cat)
        .filter(Boolean)
        .map(name => name.toLowerCase())

      console.log(`[SERVER MIDDLEWARE] Article categories:`, articleCategories)

      // Find if any main category exists in the article categories
      const foundMainCategory = mainCategories.find(mainCat =>
        articleCategories.includes(mainCat)
      )

      let canonicalCategory
      if (foundMainCategory) {
        // Use the main category as canonical
        canonicalCategory = foundMainCategory
        console.log(`[SERVER MIDDLEWARE] Found main category: ${canonicalCategory}`)
      } else {
        // Use the first category as canonical if no main category found
        canonicalCategory = articleCategories[0]
        console.log(`[SERVER MIDDLEWARE] Using first category: ${canonicalCategory}`)
      }

      // If the current URL doesn't use the canonical category, redirect
      if (canonicalCategory && category.toLowerCase() !== canonicalCategory.toLowerCase()) {
        // Preserve trailing slash (url-normalization ensures it exists)
        const redirectUrl = `/${canonicalCategory}/${slug}/`
        console.log(`[SERVER MIDDLEWARE] Category mismatch detected: ${path} -> ${redirectUrl}`)

        // Preserve query string if present
        const queryString = url.search || ''
        const finalRedirectUrl = redirectUrl + queryString

        // Send 301 redirect
        await sendRedirect(event, finalRedirectUrl, 301)
        return
      } else {
        console.log(`[SERVER MIDDLEWARE] Category is correct, no redirect needed`)
      }
    } else {
      console.log(`[SERVER MIDDLEWARE] No valid article data found in response`)
    }

  } catch (error) {
    // If API call fails, let the request proceed normally
    console.warn('[SERVER MIDDLEWARE] API call failed:', error.message)
    return
  }

  // No redirect needed, let the request continue
})