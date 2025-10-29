<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Speculation Rules API for instant page navigation
// Prerenders pages when user shows intent (200ms hover or pointerdown)
// Chrome/Edge only - other browsers gracefully ignore this
if (process.client && 'speculation' in HTMLScriptElement) {
  useHead({
    script: [{
      type: 'speculationrules',
      innerHTML: JSON.stringify({
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
      })
    }]
  })
}
</script>
