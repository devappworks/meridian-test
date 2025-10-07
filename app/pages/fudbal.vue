<script setup>
import FootballPage from "@/views/FootballPage.vue";

// Use category SEO composable for consistent metadata
const seoData = useCategorySEO('fudbal')
if (seoData) {
  useHead(seoData)
}
</script>

<template>
  <FootballPage />
</template>
