/**
 * Image Optimization Plugin
 * - Adds lazy loading to images
 * - Validates and improves alt text
 * - Adds loading="lazy" attribute
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const { observeImages } = useLazyImage()

  // Function to optimize images
  const optimizeImages = () => {
    const images = document.querySelectorAll('img')

    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        // Don't lazy load above-the-fold images (first 2 images)
        const rect = img.getBoundingClientRect()
        const isAboveFold = rect.top < window.innerHeight

        if (!isAboveFold) {
          img.setAttribute('loading', 'lazy')
        }
      }

      // Validate alt text
      const alt = img.getAttribute('alt')
      if (!alt || alt.trim() === '' || alt === 'image' || alt === 'img') {
        // Try to get better alt text from parent context
        const parent = img.closest('a, article, div[class*="card"]')
        if (parent) {
          const title = parent.querySelector('h1, h2, h3, h4, .title, [class*="title"]')
          if (title) {
            img.setAttribute('alt', title.textContent.trim())
          } else {
            // Fallback to generic but descriptive alt
            img.setAttribute('alt', 'Meridian Sport slika')
          }
        } else {
          img.setAttribute('alt', 'Meridian Sport slika')
        }
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async')
      }
    })
  }

  // Run on initial page load
  nuxtApp.hook('page:finish', () => {
    optimizeImages()
    observeImages()

    // Also run after a short delay to catch dynamically loaded images
    setTimeout(() => {
      optimizeImages()
      observeImages()
    }, 500)
  })

  // Observe DOM mutations for dynamically added images
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      let hasNewImages = false

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IMG') {
              hasNewImages = true
            } else if (node.querySelectorAll) {
              const imgs = node.querySelectorAll('img')
              if (imgs.length > 0) {
                hasNewImages = true
              }
            }
          }
        })
      })

      if (hasNewImages) {
        optimizeImages()
        observeImages()
      }
    })

    // Start observing
    nuxtApp.hook('app:mounted', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }
})
