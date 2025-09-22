<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Set favicon
useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: 'https://meridian.mpanel.app/image/cache/original/files/images/meridian-logo.png?crop=true' }
  ]
})
</script>
