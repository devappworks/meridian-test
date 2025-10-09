<script setup>
useHead({
  title: "Registracija | Meridian Sport",
  meta: [
    { name: "description", content: "Registrujte se na Meridian Sport portal i pristupite najnovijim sportske vesti, komentarisanje, personalizovane kategorije i ekskluzivnim sadržajima." },
    { name: "robots", content: "noindex, follow" }, // Registration pages shouldn't be indexed
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Registracija | Meridian Sport" },
    { property: "og:description", content: "Registrujte se na Meridian Sport portal i pristupite najnovijim sportske vesti i ekskluzivnim sadržajima." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Registracija | Meridian Sport" },
    { name: "twitter:description", content: "Registrujte se na Meridian Sport portal i pristupite najnovijim sportske vesti." }
  ]
});
import RegistrationPage from "@/views/RegistrationPage.vue";
</script>

<template>
  <RegistrationPage />
</template>
