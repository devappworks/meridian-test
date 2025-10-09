<script setup>
const { articleId } = useRoute().params;
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/homepage-og.jpg`;

useHead({
  title: "Komentari | Meridian Sport",
  meta: [
    { name: "description", content: "Komentari i diskusije o sportske vesti na Meridian Sport portalu. Podelite svoje mišljenje i diskutujte sa drugim ljubiteljima sporta." },
    { name: "robots", content: "noindex, follow" }, // Comments pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: "Komentari | Meridian Sport" },
    { property: "og:description", content: "Komentari i diskusije o sportske vesti na Meridian Sport portalu." },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Komentari | Meridian Sport" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Komentari | Meridian Sport" },
    { name: "twitter:description", content: "Komentari i diskusije o sportske vesti." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Komentari | Meridian Sport" }
  ]
});
import CommentsPage from "@/views/CommentsPage.vue";
</script>

<template>
  <CommentsPage />
</template>
