/**
 * Google Analytics 4 (GA4) Plugin
 * Handles page view tracking for SPA navigation
 *
 * This plugin tracks ALL page views including the initial page load
 * and subsequent page changes during client-side navigation
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const config = useRuntimeConfig()

  // Get GA4 Measurement ID from runtime config (fallback to hardcoded value)
  const gaId = config.public.GA_MEASUREMENT_ID || 'G-D36YF7TZJF'

  // Only run on client side
  if (process.server) return

  // Track a page view
  const trackPageView = (route) => {
    if (typeof window === 'undefined' || !window.gtag) {
      return
    }

    try {
      // Track page view with GA4 using 'event' method
      window.gtag('event', 'page_view', {
        page_path: route.fullPath,
        page_title: document.title,
        page_location: window.location.href,
        send_to: gaId
      })
    } catch (error) {
      // Silently fail
    }
  }

  // Track page views on route change (not initial load - gtag config handles that with send_page_view)
  router.afterEach((to, from) => {
    // Only track if this is an actual navigation (not initial page load)
    if (from.name !== undefined) {
      // Small delay to ensure DOM and title are updated
      setTimeout(() => {
        trackPageView(to)
      }, 100)
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
