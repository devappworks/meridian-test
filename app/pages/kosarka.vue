<script setup>
import BasketballPage from "@/views/BasketballPage.vue";

useHead({
  title: "Košarka | Meridian Sport",
  script: [
    {
      key: 'ldjson-breadcrumb-kosarka',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
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
            name: 'Košarka',
            item: 'https://meridiansport.rs/kosarka/',
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <BasketballPage />
</template>
