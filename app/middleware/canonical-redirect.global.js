export default defineNuxtRouteMiddleware((to) => {
  // This middleware now only handles basic routing validation
  // Canonical redirects are handled in the page component for better reliability

  const path = to.path

  // Check if the path has exactly 2 segments (like /something/slug)
  const pathMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/i)
  if (!pathMatch) return

  // Let the page component handle the canonical redirect logic
  // This ensures we have the article data and avoids duplicate API calls
})