// Invalid Categories Middleware
// Runs after URL normalization to block access to invalid/deprecated categories
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
  const [pathname] = url.split('?')
  const normalizedPath = pathname.replace(/\/+$/, '') // Remove trailing slashes for matching

  // List of invalid/deprecated category slugs that should return 404
  const invalidCategories = [
    '/meridian-tipovi',
    '/specijali',
  ]

  // Check if the path matches any invalid category
  if (invalidCategories.includes(normalizedPath)) {
    console.log(`[INVALID CATEGORIES] Blocking invalid category: ${normalizedPath}`)
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    })
  }

  // Continue processing
})
