<script setup>
import LatestNewsPage from "@/views/LatestNewsPage.vue";

// Use category SEO composable for consistent metadata
const seoData = useCategorySEO('najnovije-vesti')
if (seoData) {
  useHead(seoData)
}
</script>

<template>
  <LatestNewsPage />
</template>
