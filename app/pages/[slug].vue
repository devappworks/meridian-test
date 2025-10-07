<script setup>
const route = useRoute();
const { slug } = route.params;

// Get title from query if available
const displayTitle = computed(() => {
  return route.query.title || slug.split('-').map(word => capitalize(word)).join(' ');
});
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

useHead(() => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://meridiansport.rs/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: displayTitle.value,
        item: `https://meridiansport.rs/${slug}/`,
      },
    ],
  };

  return {
    title: `${displayTitle.value} | Meridian Sport`,
    script: [
      {
        key: 'ldjson-breadcrumb-category',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbSchema),
      },
    ],
  };
});

import CategoryPage from "@/views/CategoryPage.vue";
</script>

<template>
  <CategoryPage :slug="slug" />
</template>
