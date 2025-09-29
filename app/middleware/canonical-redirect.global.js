export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) return

  const [, category, slug] = pathMatch

  // Define the main categories
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka']

  try {
    // Fetch article data to get all its categories
    const article = await $fetch('/api/articles/resolve', {
      query: { category, slug }
    })

    if (!article || !article.categories || !Array.isArray(article.categories)) {
      // If no article found or no categories, let it proceed (will likely 404)
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
    if (category.toLowerCase() !== canonicalCategory.toLowerCase()) {
      return navigateTo(`/${canonicalCategory}/${slug}`, { redirectCode: 301 })
    }

  } catch (error) {
    // If API call fails, let the route proceed normally
    // The page component will handle the error
    console.warn('Middleware API call failed:', error.message)
    return
  }
})