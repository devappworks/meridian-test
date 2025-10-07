<script setup>
import TennisPage from "@/views/TennisPage.vue";

// Use category SEO composable for consistent metadata
const seoData = useCategorySEO('tenis')
if (seoData) {
  useHead(seoData)
}
</script>

<template>
  <TennisPage />
</template>
