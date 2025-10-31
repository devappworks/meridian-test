/**
 * Speculation Rules API Plugin
 *
 * Adds speculation rules for instant page navigation in Chrome/Edge browsers.
 * This enables near-instant navigation by prerendering pages when users show intent (hover 200ms).
 *
 * Browser Support: Chrome 109+, Edge 109+
 * Spec: https://developer.chrome.com/docs/web-platform/prerender-pages
 */

export default defineNuxtPlugin(() => {
  if (process.server) return

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpeculationRules)
  } else {
    initSpeculationRules()
  }
})

function initSpeculationRules() {
  console.log('[Speculation Rules] Initializing...')

  // Check browser support using the correct API
  // Reference: https://developer.chrome.com/docs/web-platform/prerender-pages#feature-detection
  if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) {
    console.warn('[Speculation Rules] Not supported by this browser (need Chrome 109+ or Edge 109+)')
    return
  }

  console.log('[Speculation Rules] ✅ Browser supports API')

  // Create speculation rules script
  const script = document.createElement('script')
  script.type = 'speculationrules'

  const rules = {
    prerender: [{
      where: {
        and: [
          { href_matches: "/*" },  // Match all URLs
          {
            not: {
              href_matches: [
                "/prijava/*",        // Exclude: Login (has side effects)
                "/registracija/*",   // Exclude: Registration (has side effects)
                "/account-page/*",   // Exclude: User account (personalized)
                "/moje-vesti/*"      // Exclude: Personalized news (requires auth)
              ]
            }
          }
        ]
      },
      eagerness: "moderate"  // Trigger on 200ms hover or pointerdown
    }]
  }

  script.textContent = JSON.stringify(rules)
  document.head.appendChild(script)

  console.log('[Speculation Rules] ✅ Script injected into <head>')
  console.log('[Speculation Rules] Script element:', document.querySelector('script[type="speculationrules"]'))

  // Verify it was added
  const added = document.querySelector('script[type="speculationrules"]')
  if (added) {
    console.log('[Speculation Rules] ✅ Verified in DOM')
  } else {
    console.error('[Speculation Rules] ❌ Failed to add to DOM')
  }
}
