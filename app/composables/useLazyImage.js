/**
 * Composable for lazy loading images
 * Uses Intersection Observer for performance
 */
export function useLazyImage() {
  const loadImage = (img) => {
    if (!img) return

    // If image has data-src, load it
    const dataSrc = img.getAttribute('data-src')
    if (dataSrc) {
      img.src = dataSrc
      img.removeAttribute('data-src')
    }

    // If image has data-srcset, load it
    const dataSrcset = img.getAttribute('data-srcset')
    if (dataSrcset) {
      img.srcset = dataSrcset
      img.removeAttribute('data-srcset')
    }

    // Add loaded class
    img.classList.add('loaded')
  }

  const observeImages = () => {
    if (typeof window === 'undefined') return

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      const images = document.querySelectorAll('img[data-src]')
      images.forEach(loadImage)
      return
    }

    // Create intersection observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          loadImage(img)
          observer.unobserve(img)
        }
      })
    }, {
      rootMargin: '50px 0px', // Start loading 50px before image enters viewport
      threshold: 0.01
    })

    // Observe all images with data-src
    const images = document.querySelectorAll('img[data-src]')
    images.forEach(img => imageObserver.observe(img))

    return imageObserver
  }

  return {
    loadImage,
    observeImages
  }
}
