<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// Speculation Rules API for instant page navigation
// Inject the script tag directly into the DOM on client-side
onMounted(() => {
  console.log('🔍 onMounted called')
  console.log('🔍 HTMLScriptElement:', typeof HTMLScriptElement)
  console.log('🔍 speculation in HTMLScriptElement:', typeof HTMLScriptElement !== 'undefined' && 'speculation' in HTMLScriptElement.prototype)

  // Check if browser supports Speculation Rules API
  if (typeof HTMLScriptElement === 'undefined' || !('speculation' in HTMLScriptElement.prototype)) {
    console.warn('⚠️ Speculation Rules API not supported by this browser')
    return // Browser doesn't support it, skip
  }

  console.log('🔍 Creating speculation rules script...')

  // Create the speculation rules script
  const script = document.createElement('script')
  script.type = 'speculationrules'

  const rules = {
    prerender: [{
      where: {
        href_matches: "/*",
        // Exclude personalized and authenticated pages
        not: {
          href_matches: [
            "/prijava/*",        // Login (has side effects)
            "/registracija/*",   // Registration (has side effects)
            "/account-page/*",   // User account (personalized)
            "/moje-vesti/*"      // Personalized news (requires auth)
          ]
        }
      },
      eagerness: "moderate"  // Trigger on 200ms hover or pointerdown
    }]
  }

  script.textContent = JSON.stringify(rules)
  document.head.appendChild(script)

  console.log('✅ Speculation Rules API activated')
  console.log('✅ Script added to head:', document.querySelector('script[type="speculationrules"]'))
})
</script>
