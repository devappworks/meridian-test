<script setup>
import BasketballPage from "@/views/BasketballPage.vue";

// Use category SEO composable for consistent metadata
const seoData = useCategorySEO('kosarka')
if (seoData) {
  useHead(seoData)
}
</script>

<template>
  <BasketballPage />
</template>
