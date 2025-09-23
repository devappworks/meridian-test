<template>
  <div>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NCRSG3GB"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: 'https://meridian.mpanel.app/image/cache/original/files/images/meridian-favicon-1758622126.png?crop=true' }
  ]
})
</script>
