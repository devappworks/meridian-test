<script setup>
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/homepage-og.jpg`;

useHead({
  title: "Prijava | Meridian Sport",
  meta: [
    { name: "description", content: "Prijavite se na Meridian Sport portal za pristup ekskluzivnim sadržajima, komentarisanje vesti i personalizovane sportske vesti." },
    { name: "robots", content: "noindex, follow" }, // Login pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: "Prijava | Meridian Sport" },
    { property: "og:description", content: "Prijavite se na Meridian Sport portal za pristup ekskluzivnim sadržajima i personalizovane vesti." },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Prijava | Meridian Sport" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Prijava | Meridian Sport" },
    { name: "twitter:description", content: "Prijavite se na Meridian Sport portal za pristup ekskluzivnim sadržajima." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Prijava | Meridian Sport" }
  ]
});
import LoginPage from "@/views/LoginPage.vue";
</script>

<template>
  <LoginPage />
</template>
