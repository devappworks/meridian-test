// Category Redirect Middleware
// Redirects child category pages to parent category pages
// e.g., /liga-evrope/ → /fudbal/
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
  const normalizedPath = pathname.replace(/\/+$/, '') // Remove trailing slashes

  // Match single-segment paths (category pages): /category or /category/
  const categoryMatch = normalizedPath.match(/^\/([^\/]+)$/i)

  if (!categoryMatch) {
    return // Not a single-segment path
  }

  const [, categorySlug] = categoryMatch

  // Skip main pages that already exist
  const mainPages = [
    'fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi',
    'najnovije-vesti', 'moje-vesti', 'prijava', 'registracija',
    'account-page', 'live-blog', 'tag', 'article', 'comments'
  ]

  if (mainPages.includes(categorySlug.toLowerCase())) {
    return // Let the main page handle it
  }

  // Map of child categories to parent categories
  const categoryMap = {
    // Football subcategories
    'domaci-fudbal': 'fudbal',
    'reprezentacije': 'fudbal',
    'evropska-takmicenja': 'fudbal',
    'liga-sampiona': 'fudbal',
    'liga-evrope': 'fudbal',
    'liga-europa': 'fudbal',
    'liga-konferencija': 'fudbal',
    'liga-konferencije': 'fudbal',
    'superligasrbije': 'fudbal',
    'super-liga-srbije': 'fudbal',
    // Basketball subcategories
    'domaca-kosarka': 'kosarka',
    'aba-liga': 'kosarka',
    'evroliga': 'kosarka',
    'nba': 'kosarka',
    'eurobasket': 'kosarka',
    // Tennis subcategories
    'atp': 'tenis',
    'wta': 'tenis',
    'grand-slam': 'tenis',
    'masters': 'tenis',
    'davis-cup': 'tenis',
    // Volleyball subcategories
    'domaca-odbojka': 'odbojka',
    'liga-sampiona-odbojka': 'odbojka',
  }

  const parentCategory = categoryMap[categorySlug.toLowerCase()]

  if (parentCategory) {
    // Child category found - redirect to parent
    const redirectUrl = `/${parentCategory}/` + (queryString ? '?' + queryString : '')
    console.log(`[CATEGORY REDIRECT] Redirecting child category: ${normalizedPath} → ${redirectUrl}`)
    return sendRedirect(event, redirectUrl, 301)
  }

  // If not in map, check if it's in the API (dynamic check)
  try {
    const config = useRuntimeConfig()
    const backendUrl = config.public.BACKEND_URL
    const apiKey = config.public.API_KEY

    if (!backendUrl) {
      return
    }

    // Fetch categories from API to check parent_id dynamically
    const categoriesUrl = `${backendUrl}/getCategories`

    const response = await $fetch(categoriesUrl, {
      headers: apiKey ? { 'Authorization': apiKey } : {},
      timeout: 3000,
      retry: 1
    }).catch(err => {
      console.warn('[CATEGORY REDIRECT] Failed to fetch categories:', err.message)
      return null
    })

    if (response?.result?.categories) {
      const categories = response.result.categories

      // Find the category by slug
      const currentCategory = categories.find(cat =>
        cat.slug?.toLowerCase() === categorySlug.toLowerCase()
      )

      if (currentCategory?.parent_id) {
        // Find the parent category
        const parentCat = categories.find(cat => cat.id === currentCategory.parent_id)

        if (parentCat?.slug) {
          const redirectUrl = `/${parentCat.slug}/` + (queryString ? '?' + queryString : '')
          console.log(`[CATEGORY REDIRECT] Dynamic redirect: ${normalizedPath} → ${redirectUrl} (parent_id: ${currentCategory.parent_id})`)
          return sendRedirect(event, redirectUrl, 301)
        }
      }
    }
  } catch (error) {
    console.warn('[CATEGORY REDIRECT] Error checking dynamic categories:', error.message)
  }

  // Not a child category - let it continue to page component
})
