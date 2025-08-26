<script setup>
const route = useRoute();
const id = route.params.id;

const { data: article, error } = await useAsyncData(`article-${id}`, () =>
  $fetch(`/api/articles/${id}`)
);
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: "Article not found" });
}

useHead(() => ({
  title: article.value?.title || "Article",
  meta: [{ name: "description", content: article.value?.excerpt || "" }],
}));
import ArticlePage from "@/views/ArticlePage.vue";
</script>

<template>
  <ArticlePage :id="id" />
</template>
