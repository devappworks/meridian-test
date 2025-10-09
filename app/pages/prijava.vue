<script setup>
useHead({
  title: "Prijava | Meridian Sport",
  meta: [
    { name: "description", content: "Prijavite se na Meridian Sport portal za pristup ekskluzivnim sadržajima, komentarisanje vesti i personalizovane sportske vesti." },
    { name: "robots", content: "noindex, follow" }, // Login pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Prijava | Meridian Sport" },
    { property: "og:description", content: "Prijavite se na Meridian Sport portal za pristup ekskluzivnim sadržajima i personalizovane vesti." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Prijava | Meridian Sport" },
    { name: "twitter:description", content: "Prijavite se na Meridian Sport portal za pristup ekskluzivnim sadržajima." }
  ]
});
import LoginPage from "@/views/LoginPage.vue";
</script>

<template>
  <LoginPage />
</template>
