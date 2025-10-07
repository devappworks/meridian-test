/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to all responses
 */
export default defineEventHandler((event) => {
  const headers = event.node.res

  // Strict-Transport-Security (HSTS)
  // Ensures all traffic uses HTTPS for 1 year
  headers.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // X-Frame-Options
  // Prevents clickjacking attacks
  headers.setHeader('X-Frame-Options', 'SAMEORIGIN')

  // X-XSS-Protection
  // Enables XSS filter in older browsers
  headers.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer-Policy
  // Controls referrer information sent with requests
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy
  // Controls browser features and APIs
  headers.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
})
