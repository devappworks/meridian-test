<script setup>
useHead({
  title: "Live Blog | Meridian Sport",
  meta: [
    { name: "description", content: "Pratite najnovije sportske događaje uživo na Meridian Sport Live Blog. Rezultati, komentari i analize u realnom vremenu." },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Live Blog | Meridian Sport" },
    { property: "og:description", content: "Pratite najnovije sportske događaje uživo na Meridian Sport Live Blog. Rezultati i komentari u realnom vremenu." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Live Blog | Meridian Sport" },
    { name: "twitter:description", content: "Pratite najnovije sportske događaje uživo na Meridian Sport Live Blog." }
  ]
});
import LiveBlog from "@/views/LiveBlog.vue";
</script>

<template>
  <LiveBlog />
</template>
