<script setup>
import FootballPage from "@/views/FootballPage.vue";

useHead({
  title: "Fudbal | Meridian Sport",
  script: [
    {
      key: 'ldjson-breadcrumb-fudbal',
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
            name: 'Fudbal',
            item: 'https://meridiansport.rs/fudbal/',
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <FootballPage />
</template>
