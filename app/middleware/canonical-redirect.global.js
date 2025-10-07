export default defineNuxtRouteMiddleware(async (to) => {
  // Client-side middleware: Only handles client-side navigation between pages
  // Server middleware handles all initial URL access and page refreshes
  // This middleware now only validates that we're on the correct URL during client navigation

  const path = to.path

  console.log(`[CLIENT MW] Processing route: ${path}`)

  // Skip API routes
  if (path.startsWith('/api/')) {
    console.log(`[CLIENT MW] Skipping API route: ${path}`)
    return
  }

  // Only run on client-side - server middleware handles SSR
  if (process.server) {
    console.log(`[CLIENT MW] Skipping on server - server middleware handles this`)
    return
  }

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) {
    console.log(`[CLIENT MW] Path doesn't match pattern: ${path}`)
    return
  }

  const [, category, slug] = pathMatch

  // Quick subcategory check only - server middleware already handled the redirect
  // This is just for client-side navigation validation
  const { getCanonicalCategoryFromSlug } = await import('~/utils/canonicalCategory')
  const canonicalCategory = getCanonicalCategoryFromSlug(category)

  // If category doesn't match canonical, the server middleware will handle redirect on page load
  // For client-side navigation, we just log but don't redirect to avoid double redirects
  if (canonicalCategory !== category) {
    console.log(`[CLIENT MW] Note: ${category} maps to ${canonicalCategory} - server will handle redirect if needed`)
  }

  // No client-side redirects - let server middleware handle all redirects
  // This prevents double redirects and keeps redirect logic in one place
  console.log(`[CLIENT MW] Allowing navigation to proceed - server middleware handles redirects`)
})