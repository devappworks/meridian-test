/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to all responses
 */
export default defineEventHandler((event) => {
  const headers = event.node.res

  // Content-Security-Policy (CSP)
  // CRITICAL: Allow Google Analytics to function properly
  // This was MISSING and causing GA tracking requests to fail
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://ajax.googleapis.com https://ssl.google-analytics.com https://tagmanager.google.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://meridian.mpanel.app wss://meridian.mpanel.app",
    "img-src 'self' data: https: http:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  headers.setHeader('Content-Security-Policy', cspDirectives)

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
