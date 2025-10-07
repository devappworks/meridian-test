// This middleware is now deprecated in favor of 00.url-normalization.js
// Keeping it as a safety fallback, but url-normalization should handle all cases
export default defineEventHandler((event) => {
  // URL normalization is now handled by 00.url-normalization.js
  // This middleware is kept as a fallback but should rarely trigger
  
  const url = event.node.req.url

  // Only redirect on GET requests
  if (event.node.req.method !== 'GET') {
    return
  }

  // Skip API routes and assets
  if (url.startsWith('/api/') || url.startsWith('/_nuxt/') || url.startsWith('/__nuxt') || url.startsWith('/_ipx/')) {
    return
  }

  // Skip for files (extensions)
  if (/\.[a-z0-9]+(\?.*)?$/i.test(url)) {
    return
  }

  // Parse URL to check path before query string
  const [path, query] = url.split('?')
  
  // Skip if path already has trailing slash or is root
  if (path === '/' || path.endsWith('/')) {
    return
  }

  console.log(`[TRAILING SLASH FALLBACK] This should be handled by url-normalization: ${url}`)

  // Add trailing slash and preserve query string
  const redirectUrl = path + '/' + (query ? '?' + query : '')

  return sendRedirect(event, redirectUrl, 301)
})
