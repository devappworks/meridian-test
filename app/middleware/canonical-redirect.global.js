export default defineNuxtRouteMiddleware(async (to) => {
  // Handle canonical redirects for client-side navigation
  // Server middleware handles direct URL access and page refreshes

  const path = to.path

  console.log(`[CLIENT MW] Processing route: ${path}`)

  // Skip API routes to avoid infinite loops
  if (path.startsWith('/api/')) {
    console.log(`[CLIENT MW] Skipping API route: ${path}`)
    return
  }

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) {
    console.log(`[CLIENT MW] Path doesn't match pattern: ${path}`)
    return
  }

  const [, category, slug] = pathMatch

  // We'll validate all categories against article data, including main categories

  // Only run on client-side to avoid conflicts with server middleware
  if (process.server) return

  // Check if this is a subcategory that should be redirected immediately
  const { getCanonicalCategoryFromSlug } = await import('~/utils/canonicalCategory')
  const canonicalCategory = getCanonicalCategoryFromSlug(category)
  
  // If the category maps to a different canonical category, redirect immediately
  if (canonicalCategory !== category) {
    // Preserve trailing slash
    const redirectUrl = `/${canonicalCategory}/${slug}/`
    console.log(`[CLIENT MW] Subcategory redirect: ${path} -> ${redirectUrl}`)
    
    // Preserve query string if present
    const queryString = to.fullPath.includes('?') ? to.fullPath.substring(to.fullPath.indexOf('?')) : ''
    const finalRedirectUrl = redirectUrl + queryString
    
    return navigateTo(finalRedirectUrl, { redirectCode: 301 })
  }

  // For main categories, we still need to validate against article data
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']
  const isMainCategory = mainCategories.includes(category.toLowerCase())
  
  if (isMainCategory) {
    console.log(`[CLIENT MW] Main category detected: ${category}, will validate against article data`)
  }

  try {
    console.log(`[CLIENT MIDDLEWARE] Fetching article data for: ${path}`)
    
    // Fetch article data to determine canonical category
    const response = await $fetch(`/api/articles/resolve`, {
      query: { category, slug }
    })

    console.log(`[CLIENT MIDDLEWARE] API response type:`, typeof response)

    // If response is HTML (redirect response), parse the redirect URL
    if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
      const redirectMatch = response.match(/url=([^"]+)/)
      if (redirectMatch) {
        const redirectUrl = redirectMatch[1]
        console.log(`[CLIENT MIDDLEWARE] HTML redirect detected: ${path} -> ${redirectUrl}`)
        return navigateTo(redirectUrl, { redirectCode: 301 })
      }
    }

    // If response is JSON with article data
    if (response && response.article && response.article.categories) {
      const article = response.article

      if (!Array.isArray(article.categories)) {
        console.log(`[CLIENT MIDDLEWARE] Article has no valid categories array`)
        return
      }

      // Extract category slugs from the article (consistent with API resolve logic)
      const articleCategories = article.categories
        .map(cat => cat.slug || cat.name || cat)
        .filter(Boolean)
        .map(name => name.toLowerCase())

      console.log(`[CLIENT MIDDLEWARE] Article categories:`, articleCategories)

      // Find if any main category exists in the article categories
      const foundMainCategory = mainCategories.find(mainCat =>
        articleCategories.includes(mainCat)
      )

      let canonicalCategory
      if (foundMainCategory) {
        // Use the main category as canonical
        canonicalCategory = foundMainCategory
        console.log(`[CLIENT MIDDLEWARE] Found main category: ${canonicalCategory}`)
      } else {
        // Use the first category as canonical if no main category found
        canonicalCategory = articleCategories[0]
        console.log(`[CLIENT MIDDLEWARE] Using first category: ${canonicalCategory}`)
      }

      // If the current URL doesn't use the canonical category, redirect
      if (canonicalCategory && category.toLowerCase() !== canonicalCategory.toLowerCase()) {
        // Preserve trailing slash
        const redirectUrl = `/${canonicalCategory}/${slug}/`
        console.log(`[CLIENT MIDDLEWARE] Category mismatch detected: ${path} -> ${redirectUrl}`)
        
        // Preserve query string if present
        const queryString = to.fullPath.includes('?') ? to.fullPath.substring(to.fullPath.indexOf('?')) : ''
        const finalRedirectUrl = redirectUrl + queryString
        
        return navigateTo(finalRedirectUrl, { redirectCode: 301 })
      } else {
        console.log(`[CLIENT MIDDLEWARE] Category is correct, no redirect needed`)
      }
    } else {
      console.log(`[CLIENT MIDDLEWARE] No valid article data found in response`)
    }

  } catch (error) {
    // If API call fails, let the request proceed normally
    console.warn('[CLIENT MIDDLEWARE] API call failed:', error.message)
    return
  }

  // No redirect needed, let the request continue
})