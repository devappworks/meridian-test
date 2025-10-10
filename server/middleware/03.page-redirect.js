// Page Path Redirect Middleware
// Redirects any URLs starting with /page to the home page
// e.g., /page → /, /page/123 → /
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

  // Parse the URL to separate pathname and query string
  const [pathname, queryString] = url.split('?')
  
  // Check if the path starts with /page (with or without trailing content)
  if (pathname.startsWith('/page')) {
    const redirectUrl = '/' + (queryString ? '?' + queryString : '')
    console.log(`[PAGE REDIRECT] Redirecting: ${pathname} → ${redirectUrl}`)
    
    // 301 permanent redirect to home page
    return sendRedirect(event, redirectUrl, 301)
  }
})

