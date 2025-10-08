<script setup>
// Catch-all route for 404 errors
// This catches any route that doesn't match existing pages

const route = useRoute()
const path = route.path

console.log('404 Catch-all route triggered for:', path)

// Throw a 404 error to show the error page
throw createError({
  statusCode: 404,
  statusMessage: 'Page Not Found',
  fatal: true
})
</script>

<template>
  <!-- This template will never render because we throw an error immediately -->
  <div></div>
</template>
