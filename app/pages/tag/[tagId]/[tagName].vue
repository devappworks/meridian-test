<script setup>
const route = useRoute();
const { tagId, tagName } = route.params;
useHead(() => ({ title: `#${tagName}` }));
import TagPage from "@/views/TagPage.vue";
</script>

<template>
  <TagPage :tagId="tagId" :tagName="tagName" />
</template>
