/**
 * URL Validation Middleware
 * Blocks malformed/malicious URLs from bot attacks and scrapers
 * Note: Only blocks in production to avoid interfering with dev experience
 */
export default defineEventHandler((event) => {
  // Skip this middleware entirely in development mode
  if (process.dev || process.env.NODE_ENV === 'development') {
    return
  }

  const url = event.node.req.url || ''

  // Skip API routes and assets
  if (url.startsWith('/api/') ||
      url.startsWith('/_nuxt/') ||
      url.startsWith('/__nuxt') ||
      url.startsWith('/_ipx/')) {
    return
  }

  // BLOCK ALL /page/ REQUESTS (all are malicious bot attacks)
  if (/\/page\//i.test(url)) {
    console.log(`[Security] Blocked /page/ path: ${url}`)
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  }

  // Block malformed URL patterns (based on actual attack patterns from GSC)
  const malformedPatterns = [
    /\?=\?/,                    // ?=? pattern attack
    /page\/\d+=\?/,             // page/123=? pattern
    /[A-Z]{2,}[a-z]+[A-Z]/,     // CamelCase spam (LIvestEmai)
    /viteBooking/i,             // Specific attack string
    /iframe/i,                  // Iframe injection attempts
    /=E:/,                      // =E: parameter pattern
    /[&=]{3,}/,                 // Multiple & or = in a row (3+)
    /%[0-9A-F]{2}%[0-9A-F]{2}%[0-9A-F]{2}/, // Triple URL encoding (attack)
    /\.\./,                     // Directory traversal attempts
    /<script/i,                 // Script injection attempts
    /\?.*%2F.*%2F/i,            // URL-encoded slashes in query params (path injection)
    /cms_records/i,             // CMS exploitation attempts
    /sortby=.*&sortdirection=/i, // Complex sorting parameter attacks
  ]

  // Check if URL matches attack pattern
  for (const pattern of malformedPatterns) {
    if (pattern.test(url)) {
      console.log(`[Security] Blocked malformed URL: ${url}`)

      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }
  }
})

