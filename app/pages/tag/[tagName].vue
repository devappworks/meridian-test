<script setup>
const route = useRoute();
const { tagName } = route.params;

// Note: Tag validation is handled client-side in TagPage.vue component
// We don't validate during build to avoid issues when API is unavailable
// Invalid tags will show "no articles" message instead of 404

useHead(() => ({ title: `${tagName} | Meridian Sport` }));
import TagPage from "@/views/TagPage.vue";
</script>

<template>
  <TagPage :tagName="tagName" />
</template>
