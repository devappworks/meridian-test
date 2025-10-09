<script setup>
const { articleId } = useRoute().params;
useHead({
  title: "Komentari | Meridian Sport",
  meta: [
    { name: "description", content: "Komentari i diskusije o sportske vesti na Meridian Sport portalu. Podelite svoje mišljenje i diskutujte sa drugim ljubiteljima sporta." },
    { name: "robots", content: "noindex, follow" }, // Comments pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Komentari | Meridian Sport" },
    { property: "og:description", content: "Komentari i diskusije o sportske vesti na Meridian Sport portalu." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Komentari | Meridian Sport" },
    { name: "twitter:description", content: "Komentari i diskusije o sportske vesti." }
  ]
});
import CommentsPage from "@/views/CommentsPage.vue";
</script>

<template>
  <CommentsPage />
</template>
