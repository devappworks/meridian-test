<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
/* function disableConsoleLog() {
  console.log = function () {};
} */

// Isključivanje console.log poziva prilikom učitavanja aplikacije
//disableConsoleLog();
</script>