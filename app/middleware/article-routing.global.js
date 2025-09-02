export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on server-side rendering initial load
  if (process.server) return

  const path = to.path
  
  // If we're accessing /article/[id] but the ID contains non-numeric characters,
  // it might be a misrouted category/slug URL
  const articleMatch = path.match(/^\/article\/([^\/]+)$/i)
  if (articleMatch) {
    const possibleId = articleMatch[1]
    
    // If the "ID" contains hyphens or non-numeric characters, 
    // it's likely a misrouted category/slug
    if (!/^\d+$/.test(possibleId)) {
      // This looks like it should be a category/slug route
      console.warn(`Misrouted article URL detected: ${path}`)
      return
    }
  }

  // If we have a two-segment path that's not /article/*, 
  // ensure it goes to the category/slug handler
  const categorySlugMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (categorySlugMatch && !path.startsWith('/article/')) {
    const [, category, slug] = categorySlugMatch
    
    // Known sports categories that should always use category/slug routing
    const validCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']
    
    if (validCategories.includes(category.toLowerCase())) {
      // This should definitely be handled by [category]/[slug].vue
      return
    }
  }
})
