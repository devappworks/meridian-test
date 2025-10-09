<script setup>
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/homepage-og.jpg`;

useHead({
  title: "Registracija | Meridian Sport",
  meta: [
    { name: "description", content: "Registrujte se na Meridian Sport portal i pristupite najnovijim sportske vesti, komentarisanje, personalizovane kategorije i ekskluzivnim sadržajima." },
    { name: "robots", content: "noindex, follow" }, // Registration pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: "Registracija | Meridian Sport" },
    { property: "og:description", content: "Registrujte se na Meridian Sport portal i pristupite najnovijim sportske vesti i ekskluzivnim sadržajima." },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Registracija | Meridian Sport" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Registracija | Meridian Sport" },
    { name: "twitter:description", content: "Registrujte se na Meridian Sport portal i pristupite najnovijim sportske vesti." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Registracija | Meridian Sport" }
  ]
});
import RegistrationPage from "@/views/RegistrationPage.vue";
</script>

<template>
  <RegistrationPage />
</template>
