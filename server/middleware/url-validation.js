/**
 * URL Validation Middleware
 * Blocks malformed/malicious URLs from bot attacks and scrapers
 */
export default defineEventHandler((event) => {
  const url = event.node.req.url || ''
  
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

