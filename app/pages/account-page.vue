<script setup>
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/homepage-og.jpg`;

useHead({
  title: "Moj nalog | Meridian Sport",
  meta: [
    { name: "description", content: "Upravljajte svojim nalogom na Meridian Sport portalu. Pristupite postavkama, istoriji komentara i personalizovanim kategorijama vesti." },
    { name: "robots", content: "noindex, follow" }, // User account pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: "Moj nalog | Meridian Sport" },
    { property: "og:description", content: "Upravljajte svojim nalogom na Meridian Sport portalu. Pristupite postavkama i personalizovanim kategorijama." },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Moj nalog | Meridian Sport" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Moj nalog | Meridian Sport" },
    { name: "twitter:description", content: "Upravljajte svojim nalogom na Meridian Sport portalu." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Moj nalog | Meridian Sport" }
  ]
});
import AccountPage from "@/views/AccountPage.vue";
</script>

<template>
  <AccountPage />
</template>
