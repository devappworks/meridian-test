/**
 * GTM Router Plugin
 * Tracks page views on route changes in SPA mode
 *
 * This fixes the issue where GTM only fires on initial page load
 * but not when navigating between pages (client-side routing)
 */

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const config = useRuntimeConfig()

  console.log('🔧 GTM Router Plugin Initialized')

  // Wait for GTM to load before tracking
  const waitForGTM = () => {
    return new Promise((resolve) => {
      if (window.dataLayer) {
        console.log('✅ GTM dataLayer already available')
        resolve()
      } else {
        console.log('⏳ Waiting for GTM dataLayer to load...')
        // Check every 100ms for up to 10 seconds
        let attempts = 0
        const interval = setInterval(() => {
          attempts++
          if (window.dataLayer) {
            console.log(`✅ GTM dataLayer loaded after ${attempts * 100}ms`)
            clearInterval(interval)
            resolve()
          } else if (attempts > 100) {
            console.warn('⚠️ GTM dataLayer not loaded after 10 seconds')
            clearInterval(interval)
            resolve()
          }
        }, 100)
      }
    })
  }

  // Track if this is the first page load
  let isFirstLoad = true

  // Store the last tracked path to use as referrer
  let lastPath = null

  // Track page view
  const trackPageView = async (to, isInitial = false) => {
    // Wait for GTM on first load
    if (isInitial) {
      await waitForGTM()
    }

    if (!window.dataLayer) {
      console.warn('⚠️ GTM dataLayer not available yet')
      return
    }

    const pageData = {
      event: 'nuxt-route-change',
      page: {
        path: to.fullPath,
        title: document.title,
        url: window.location.href,
        // Only set referrer for subsequent page views (not initial load)
        ...(lastPath && !isInitial && {
          referrer: lastPath
        })
      }
    }

    // Push page view event to GTM
    window.dataLayer.push(pageData)

    console.log('📊 GTM Page View Tracked:', pageData)

    // Update last path for next navigation
    lastPath = window.location.href
  }

  // Track ALL navigation (including initial page load and route changes)
  router.afterEach(async (to, from) => {
    console.log('🔄 Route change detected:', {
      from: from.path,
      to: to.path,
      isFirstLoad
    })

    // Don't track if it's the same route (e.g., hash changes only)
    if (to.path === from.path && !isFirstLoad) {
      console.log('⏭️ Same path, skipping tracking')
      return
    }

    // Small delay to ensure page title is updated
    setTimeout(async () => {
      await trackPageView(to, isFirstLoad)
      isFirstLoad = false
    }, 100)
  })

  console.log('✅ GTM Router Plugin setup complete')
})
