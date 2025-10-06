<script setup>
import TennisPage from "@/views/TennisPage.vue";

useHead({
  title: "Tenis",
  script: [
    {
      key: 'ldjson-breadcrumb-tenis',
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
            name: 'Tenis',
            item: 'https://meridiansport.rs/tenis/',
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <TennisPage />
</template>
