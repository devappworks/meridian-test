/**
 * URL Normalization Plugin
 * Ensures all internal links use trailing slashes for consistency
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const normalizeLinks = () => {
    const links = document.querySelectorAll('a[href]')

    links.forEach(link => {
      const href = link.getAttribute('href')

      // Skip if not a string or empty
      if (!href || typeof href !== 'string') return

      // Skip external links, anchors, mailto, tel, javascript, etc.
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.includes('?') || // Skip if has query string (handle separately)
        href.endsWith('.pdf') ||
        href.endsWith('.jpg') ||
        href.endsWith('.png') ||
        href.endsWith('.xml')
      ) {
        return
      }

      // Normalize internal links to have trailing slash
      if (href.startsWith('/') && !href.endsWith('/')) {
        // Check if it looks like a file (has extension)
        const hasExtension = /\.[a-z0-9]+$/i.test(href)
        if (!hasExtension) {
          link.setAttribute('href', href + '/')
        }
      }
    })
  }

  // Run on page load
  nuxtApp.hook('page:finish', () => {
    normalizeLinks()

    // Also run after short delay for dynamically loaded content
    setTimeout(normalizeLinks, 500)
  })

  // Also normalize when navigating via router
  const router = useRouter()
  router.afterEach(() => {
    setTimeout(normalizeLinks, 100)
  })

  // Observe DOM mutations
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      let hasNewLinks = false

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'A') {
              hasNewLinks = true
            } else if (node.querySelectorAll) {
              const links = node.querySelectorAll('a[href]')
              if (links.length > 0) {
                hasNewLinks = true
              }
            }
          }
        })
      })

      if (hasNewLinks) {
        normalizeLinks()
      }
    })

    nuxtApp.hook('app:mounted', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }
})
