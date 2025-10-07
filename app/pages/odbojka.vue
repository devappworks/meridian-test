<script setup>
import VolleyballPage from "@/views/VolleyballPage.vue";

useHead({
  title: "Odbojka | Meridian Sport",
  script: [
    {
      key: 'ldjson-breadcrumb-odbojka',
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
            name: 'Odbojka',
            item: 'https://meridiansport.rs/odbojka/',
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <VolleyballPage />
</template>
