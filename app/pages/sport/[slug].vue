<script setup>
const { slug } = useRoute().params;
useHead(() => ({ title: `Sport – ${slug}` }));
import CategoryPage from "@/views/CategoryPage.vue";
</script>

<template>
  <CategoryPage />
</template>
