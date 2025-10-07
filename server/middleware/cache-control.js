/**
 * Server middleware to add cache-control headers for various resources
 * Improves performance by ensuring proper caching strategies
 */
export default defineEventHandler((event) => {
  const path = event.node.req.url || '';
  
  // Set cache headers based on resource type
  if (path.includes('/_nuxt/')) {
    // Nuxt build assets - immutable, cache forever
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
  } else if (path.match(/\.(woff2|woff|ttf|otf)$/)) {
    // Font files - cache for 1 year
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
  } else if (path.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico)$/)) {
    // Image files - cache for 30 days
    setResponseHeader(event, 'Cache-Control', 'public, max-age=2592000');
  } else if (path.match(/\.(js|css)$/)) {
    // JS and CSS files - cache for 1 year if versioned
    if (path.includes('?v=') || path.includes('.min.')) {
      setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      setResponseHeader(event, 'Cache-Control', 'public, max-age=86400');
    }
  }
  
  // Add security headers
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff');
  setResponseHeader(event, 'X-Frame-Options', 'SAMEORIGIN');
});

