export default defineNuxtRouteMiddleware(async (to) => {
  // Handle canonical redirects for client-side navigation
  // Server middleware handles direct URL access and page refreshes

  const path = to.path

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) return

  const [, category, slug] = pathMatch

  // Skip if it's already a main category or API route
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']
  if (mainCategories.includes(category.toLowerCase()) || path.startsWith('/api/')) {
    return
  }

  // Only run on client-side to avoid conflicts with server middleware
  if (process.server) return

  // Check if this is a subcategory that should be redirected immediately
  const { getCanonicalCategoryFromSlug } = await import('~/utils/canonicalCategory')
  const canonicalCategory = getCanonicalCategoryFromSlug(category)
  
  // If the category maps to a different canonical category, redirect immediately
  if (canonicalCategory !== category) {
    const redirectUrl = `/${canonicalCategory}/${slug}`
    console.log(`[CLIENT MW] Subcategory redirect: ${path} -> ${redirectUrl}`)
    return navigateTo(redirectUrl, { redirectCode: 301 })
  }

  try {
    // Fetch article data to determine canonical category
    const response = await $fetch(`/api/articles/resolve`, {
      query: { category, slug }
    })

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
        return
      }

      // Extract category slugs from the article (consistent with API resolve logic)
      const articleCategories = article.categories
        .map(cat => cat.slug || cat.name || cat)
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
        console.log(`[CLIENT MIDDLEWARE] Dynamic redirect: ${path} -> ${redirectUrl}`)
        return navigateTo(redirectUrl, { redirectCode: 301 })
      }
    }

  } catch (error) {
    // If API call fails, let the request proceed normally
    console.warn('[CLIENT MIDDLEWARE] API call failed:', error.message)
    return
  }

  // No redirect needed, let the request continue
})