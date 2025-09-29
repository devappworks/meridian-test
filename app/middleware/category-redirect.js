export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only apply to category/slug routes
  if (!to.params.category || !to.params.slug) {
    return
  }

  const category = to.params.category
  const slug = to.params.slug

  // Validate parameters
  if (typeof category !== 'string' || typeof slug !== 'string') {
    console.error('🔴 Category redirect middleware: Invalid parameters', { category, slug })
    return
  }

  try {
    // Check if this category/slug combination needs a redirect
    const response = await $fetch(`/api/articles/resolve`, {
      query: { category, slug },
      method: 'HEAD' // Use HEAD to avoid loading full article data
    })
    // If no error, the route is valid
  } catch (error) {
    console.log('🔴 Category redirect middleware error:', error.statusCode, error.statusMessage)

    if (error.statusCode === 301) {
      // Extract redirect location from error headers or data
      let location = error.headers?.Location || error.data?.redirectTo

      // If no location in error, try to construct it from the error message
      if (!location && error.data?.message) {
        const redirectMatch = error.data.message.match(/Redirect to: (.+)/);
        if (redirectMatch) {
          location = redirectMatch[1];
        }
      }

      if (location) {
        console.log('🔴 Category redirect middleware: Redirecting to', location)
        return navigateTo(location, { redirectCode: 301 })
      } else {
        console.error('🔴 Category redirect middleware: No redirect location found in 301 error')
      }
    } else if (error.statusCode === 404) {
      // Don't handle 404s in middleware, let the page handle it
      console.log('🔴 Category redirect middleware: Article not found, letting page handle')
    } else {
      // For other errors, log but don't interfere
      console.error('🔴 Category redirect middleware: Unexpected error', error)
    }
  }
})