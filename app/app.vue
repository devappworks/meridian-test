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
// Inject the script tag directly into the DOM on client-side
onMounted(() => {
  // Check if browser supports Speculation Rules API
  if (typeof HTMLScriptElement === 'undefined' || !('speculation' in HTMLScriptElement)) {
    return // Browser doesn't support it, skip
  }

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
})
</script>
