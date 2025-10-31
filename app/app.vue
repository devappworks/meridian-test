<script setup>
// Preload critical fonts to eliminate FOUT (font "jumping")
useHead({
  link: [
    {
      rel: 'preload',
      href: '/_nuxt/roboto-latin-400-normal-CNwBRw8h.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    },
    {
      rel: 'preload',
      href: '/_nuxt/barlow-condensed-latin-700-normal-v1xN8_Wq.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    },
    {
      rel: 'preload',
      href: '/_nuxt/source-sans-pro-latin-400-normal-tpsLXCSJ.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    }
  ]
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

