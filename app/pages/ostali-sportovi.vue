<script setup>
import OtherNewsPage from "@/views/OtherNewsPage.vue";

// Use category SEO composable for consistent metadata
const seoData = useCategorySEO('ostali-sportovi')
if (seoData) {
  useHead(seoData)
}
</script>

<template>
  <OtherNewsPage />
</template>
