export default defineEventHandler((event) => {
  const url = event.node.req.url

  // Only redirect on GET requests
  if (event.node.req.method !== 'GET') {
    return
  }

  // Skip if already has trailing slash or is root
  if (url === '/' || url.endsWith('/')) {
    return
  }

  // Skip for files (extensions)
  if (/\.[a-z0-9]+(\?.*)?$/i.test(url)) {
    return
  }

  // Skip API routes and assets
  if (url.startsWith('/api/') || url.startsWith('/_nuxt/') || url.startsWith('/__nuxt')) {
    return
  }

  console.log(`[TRAILING SLASH] Redirecting: ${url} -> ${url}/`)

  // Add trailing slash and preserve query string
  const [path, query] = url.split('?')
  const redirectUrl = path + '/' + (query ? '?' + query : '')

  return sendRedirect(event, redirectUrl, 301)
})
