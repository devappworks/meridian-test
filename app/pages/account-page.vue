<script setup>
useHead({
  title: "Moj nalog | Meridian Sport",
  meta: [
    { name: "description", content: "Upravljajte svojim nalogom na Meridian Sport portalu. Pristupite postavkama, istoriji komentara i personalizovanim kategorijama vesti." },
    { name: "robots", content: "noindex, follow" }, // User account pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Moj nalog | Meridian Sport" },
    { property: "og:description", content: "Upravljajte svojim nalogom na Meridian Sport portalu. Pristupite postavkama i personalizovanim kategorijama." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Moj nalog | Meridian Sport" },
    { name: "twitter:description", content: "Upravljajte svojim nalogom na Meridian Sport portalu." }
  ]
});
import AccountPage from "@/views/AccountPage.vue";
</script>

<template>
  <AccountPage />
</template>
