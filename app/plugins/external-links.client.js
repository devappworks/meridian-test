/**
 * External Links Plugin
 * Automatically adds rel="noopener noreferrer" to all external links with target="_blank"
 * Improves security and performance
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  // Wait for DOM to be ready
  nuxtApp.hook('page:finish', () => {
    // Add rel attributes to all external links
    const addRelToExternalLinks = () => {
      const links = document.querySelectorAll('a[target="_blank"]')

      links.forEach(link => {
        const href = link.getAttribute('href')

        // Skip if no href or it's a javascript: link
        if (!href || href.startsWith('javascript:')) return

        const currentRel = link.getAttribute('rel') || ''
        const relValues = currentRel.split(' ').filter(Boolean)

        // Add noopener and noreferrer if not present
        if (!relValues.includes('noopener')) {
          relValues.push('noopener')
        }
        if (!relValues.includes('noreferrer')) {
          relValues.push('noreferrer')
        }

        link.setAttribute('rel', relValues.join(' '))
      })
    }

    // Run on initial page load
    addRelToExternalLinks()

    // Also run after short delay to catch dynamically added links
    setTimeout(addRelToExternalLinks, 1000)
  })

  // Also observe DOM mutations for dynamically added links
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
              const currentRel = node.getAttribute('rel') || ''
              const relValues = currentRel.split(' ').filter(Boolean)

              if (!relValues.includes('noopener')) {
                relValues.push('noopener')
              }
              if (!relValues.includes('noreferrer')) {
                relValues.push('noreferrer')
              }

              node.setAttribute('rel', relValues.join(' '))
            }

            // Check children
            const childLinks = node.querySelectorAll?.('a[target="_blank"]')
            childLinks?.forEach(link => {
              const currentRel = link.getAttribute('rel') || ''
              const relValues = currentRel.split(' ').filter(Boolean)

              if (!relValues.includes('noopener')) {
                relValues.push('noopener')
              }
              if (!relValues.includes('noreferrer')) {
                relValues.push('noreferrer')
              }

              link.setAttribute('rel', relValues.join(' '))
            })
          }
        })
      })
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
