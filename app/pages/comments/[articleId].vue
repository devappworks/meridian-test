<script setup>
const { articleId } = useRoute().params;
useHead({ title: "Comments" });
import CommentsPage from "@/views/CommentsPage.vue";
</script>

<template>
  <CommentsPage />
</template>
