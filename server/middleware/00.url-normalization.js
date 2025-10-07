// URL Normalization Middleware
// Runs FIRST (00. prefix) to normalize URLs before other middlewares process them
// Handles: tracking params, double slashes, trailing slash enforcement
export default defineEventHandler((event) => {
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
  const [pathname, queryString] = url.split('?')
  let normalizedPath = pathname
  let normalizedQuery = queryString || ''

  let needsRedirect = false

  // 1. Normalize double (or multiple) slashes to single slash
  // e.g., /category/slug// → /category/slug/
  // e.g., /category//slug/ → /category/slug/
  const hasMultipleSlashes = /\/\/+/.test(normalizedPath)
  if (hasMultipleSlashes) {
    normalizedPath = normalizedPath.replace(/\/\/+/g, '/')
    needsRedirect = true
    console.log(`[URL NORMALIZE] Fixed multiple slashes: ${pathname} → ${normalizedPath}`)
  }

  // 2. Strip tracking query parameters (fbclid, utm_*, gclid, etc.)
  if (normalizedQuery) {
    const params = new URLSearchParams(normalizedQuery)
    const trackingParams = ['fbclid', 'gclid', 'msclkid', 'mc_eid', '_ga', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    
    let paramsRemoved = false
    trackingParams.forEach(param => {
      if (params.has(param)) {
        params.delete(param)
        paramsRemoved = true
      }
    })

    if (paramsRemoved) {
      normalizedQuery = params.toString()
      needsRedirect = true
      console.log(`[URL NORMALIZE] Stripped tracking params from: ${url}`)
    }
  }

  // 3. Enforce trailing slash policy (add trailing slash if missing)
  // Skip root path
  if (normalizedPath !== '/' && !normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath + '/'
    needsRedirect = true
    console.log(`[URL NORMALIZE] Added trailing slash: ${pathname} → ${normalizedPath}`)
  }

  // 4. Remove trailing slash if path ends with multiple slashes (after normalization)
  // e.g., /category/slug/// → /category/slug/
  if (normalizedPath !== '/' && normalizedPath.endsWith('//')) {
    normalizedPath = normalizedPath.replace(/\/+$/, '/')
    needsRedirect = true
    console.log(`[URL NORMALIZE] Normalized trailing slashes: ${pathname} → ${normalizedPath}`)
  }

  // If normalization is needed, perform 301 redirect
  if (needsRedirect) {
    const redirectUrl = normalizedPath + (normalizedQuery ? '?' + normalizedQuery : '')
    console.log(`[URL NORMALIZE] Redirecting: ${url} → ${redirectUrl}`)
    
    // Prevent redirect loops: if redirectUrl is the same as original, don't redirect
    if (redirectUrl === url) {
      console.log(`[URL NORMALIZE] Redirect URL same as original, skipping to prevent loop`)
      return
    }
    
    return sendRedirect(event, redirectUrl, 301)
  }

  // URL is already normalized, continue
})

