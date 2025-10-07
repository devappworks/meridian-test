/**
 * Google Analytics 4 (GA4) Plugin
 * Handles page view tracking for client-side navigation (SPA)
 *
 * The initial page load is tracked by gtag.js automatically via nuxt.config.ts
 * This plugin tracks subsequent page changes during client-side navigation
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const config = useRuntimeConfig()

  // Get GA4 Measurement ID from runtime config (fallback to hardcoded value)
  const gaId = config.public.GA_MEASUREMENT_ID || 'G-D36YF7TZJF'

  // Only run on client side
  if (process.server) return

  // Wait for gtag to be available
  const waitForGtag = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.gtag) {
        resolve()
      } else {
        const checkInterval = setInterval(() => {
          if (typeof window !== 'undefined' && window.gtag) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          console.warn('[Analytics] gtag not available after 5s timeout')
          resolve()
        }, 5000)
      }
    })
  }

  // Track page views on route change
  router.afterEach(async (to, from) => {
    // Skip tracking on initial load (gtag already tracks this)
    if (!from.name) return

    // Wait for gtag to be available
    await waitForGtag()

    // Check if gtag is available
    if (typeof window === 'undefined' || !window.gtag) {
      console.warn('[Analytics] gtag is not available, skipping page view tracking')
      return
    }

    try {
      // Get the full URL for tracking
      const url = window.location.origin + to.fullPath
      const title = document.title

      // Track page view with GA4
      window.gtag('config', gaId, {
        page_path: to.fullPath,
        page_title: title,
        page_location: url
      })

      console.log('[Analytics] Page view tracked:', {
        path: to.fullPath,
        title: title
      })
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error)
    }
  })

  // Provide gtag globally for custom event tracking
  return {
    provide: {
      gtag: (...args) => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag(...args)
        } else {
          console.warn('[Analytics] gtag not available for custom event:', args)
        }
      }
    }
  }
})
