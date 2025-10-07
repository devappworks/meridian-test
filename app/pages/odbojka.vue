<script setup>
import VolleyballPage from "@/views/VolleyballPage.vue";

// Use category SEO composable for consistent metadata
const seoData = useCategorySEO('odbojka')
if (seoData) {
  useHead(seoData)
}
</script>

<template>
  <VolleyballPage />
</template>
