export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on server side to avoid client-side issues
  if (!process.server) return

  const path = to.path

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) return

  const [, category, slug] = pathMatch

  try {
    // Use the runtime config to get the correct backend URL
    const config = useRuntimeConfig()
    const backendUrl = config.public.BACKEND_URL

    // Fetch article data to determine canonical category
    const article = await $fetch(`${backendUrl}/articles/resolve`, {
      query: { category, slug },
      headers: {
        'X-API-Key': config.public.API_KEY
      }
    })

    if (!article || !article.categories || !Array.isArray(article.categories)) {
      return
    }

    const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka']

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
      return navigateTo(`/${canonicalCategory}/${slug}`, { redirectCode: 301 })
    }

  } catch (error) {
    // If API call fails, let the route proceed normally
    console.warn('Article canonical middleware API call failed:', error.message)
    return
  }
})