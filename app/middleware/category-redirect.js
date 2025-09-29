export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only apply to category/slug routes
  if (!to.params.category || !to.params.slug) {
    return
  }

  const category = to.params.category
  const slug = to.params.slug

  try {
    // Check if this category/slug combination needs a redirect
    const response = await $fetch(`/api/articles/resolve`, {
      query: { category, slug },
      method: 'HEAD' // Use HEAD to avoid loading full article data
    })
  } catch (error) {
    if (error.statusCode === 301) {
      // Extract redirect location from error or construct it
      const location = error.headers?.Location || error.data?.redirectTo
      if (location) {
        return navigateTo(location, { redirectCode: 301 })
      }
    }
  }
})