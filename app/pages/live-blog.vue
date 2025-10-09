<script setup>
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/homepage-og.jpg`;

useHead({
  title: "Live Blog | Meridian Sport",
  meta: [
    { name: "description", content: "Pratite najnovije sportske događaje uživo na Meridian Sport Live Blog. Rezultati, komentari i analize u realnom vremenu." },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: "Live Blog | Meridian Sport" },
    { property: "og:description", content: "Pratite najnovije sportske događaje uživo na Meridian Sport Live Blog. Rezultati i komentari u realnom vremenu." },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Live Blog | Meridian Sport" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Live Blog | Meridian Sport" },
    { name: "twitter:description", content: "Pratite najnovije sportske događaje uživo na Meridian Sport Live Blog." },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: "Live Blog | Meridian Sport" }
  ]
});
import LiveBlog from "@/views/LiveBlog.vue";
</script>

<template>
  <LiveBlog />
</template>
