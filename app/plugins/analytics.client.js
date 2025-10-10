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

  // Queue to store page views before gtag is ready
  let pageViewQueue = []
  let gtagReady = false

  // Check if gtag is ready
  const checkGtagReady = () => {
    if (typeof window !== 'undefined' && window.gtag && window.dataLayer) {
      gtagReady = true
      // Process queued page views
      while (pageViewQueue.length > 0) {
        const queuedRoute = pageViewQueue.shift()
        sendPageView(queuedRoute)
      }
      return true
    }
    return false
  }

  // Send page view to GA
  const sendPageView = (route) => {
    try {
      window.gtag('event', 'page_view', {
        page_path: route.fullPath,
        page_title: document.title,
        page_location: window.location.href,
        send_to: gaId
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('[GA] Page view tracked:', route.fullPath)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[GA] Error tracking page view:', error)
      }
    }
  }

  // Track a page view (queue if gtag not ready)
  const trackPageView = (route) => {
    if (checkGtagReady()) {
      sendPageView(route)
    } else {
      // Queue for later
      pageViewQueue.push(route)

      if (process.env.NODE_ENV === 'development') {
        console.log('[GA] Queued page view (gtag not ready):', route.fullPath)
      }
    }
  }

  // Periodically check if gtag becomes ready
  const gtagCheckInterval = setInterval(() => {
    if (checkGtagReady()) {
      clearInterval(gtagCheckInterval)
    }
  }, 100)

  // Clear interval after 15 seconds
  setTimeout(() => {
    clearInterval(gtagCheckInterval)
    if (!gtagReady && process.env.NODE_ENV === 'development') {
      console.warn('[GA] gtag not ready after 15 seconds')
    }
  }, 15000)

  // Track page views on route change (not initial load - gtag config handles that)
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
        }
      }
    }
  }
})
