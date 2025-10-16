<script setup>
const route = useRoute();
let { tagName } = route.params;

console.log(`\n🔵 ============ TAG PAGE ROUTE HIT ============`);
console.log(`🔵 Tag name from params: "${tagName}"`);
console.log(`🔵 Full route path: "${route.path}"`);
console.log(`🔵 Is server-side: ${process.server}`);
console.log(`🔵 Environment: ${process.env.NODE_ENV}`);
console.log(`🔵 ============================================\n`);

// Redirect map for specific old tag URLs to new ones
const tagRedirects = {
  'kosarkaski-klub-kk-partizan': 'kk-partizan',
  'fudbalski-klub-partizan': 'fk-partizan',
  'kk-crvena-zvezda-2': 'kk-crvena-zvezda',
  'merid': 'meridian'
};

// Check if current tag needs to be redirected - DO THIS BEFORE SETTING META TAGS
if (tagRedirects[tagName]) {
  const newTagName = tagRedirects[tagName];
  console.log(`🔄 Redirecting from /tag/${tagName}/ to /tag/${newTagName}/`);

  // Perform redirect immediately - this stops execution here
  // Search engines will only see the 301 redirect, not the meta tags below
  await navigateTo(`/tag/${newTagName}/`, {
    redirectCode: 301, // Permanent redirect for SEO
    external: false
  });

  // This code below won't execute after redirect, but just in case:
  throw createError({ statusCode: 301, message: 'Redirecting', fatal: false });
}

// Process tag name for display: replace hyphens with spaces and capitalize
const formattedTagName = tagName
  .replace(/-/g, ' ')
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

// ALWAYS set meta tags immediately - don't wait for API validation
// This ensures meta tags are rendered even if API calls fail
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || 'https://meridiansport.rs').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';
const ogImageUrl = `${siteUrl}/images/default-category-og.jpg`;

useHead({
  title: `${formattedTagName} | Meridian Sport`,
  meta: [
    { name: "description", content: `Najnovije vesti o ${formattedTagName.toLowerCase()} na Meridian Sport portalu. Pratite sve aktuelne događaje, rezultate i analize.` },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: `${formattedTagName} | Meridian Sport` },
    { property: "og:description", content: `Najnovije vesti o ${formattedTagName.toLowerCase()} na Meridian Sport portalu.` },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: `${formattedTagName} | Meridian Sport` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${formattedTagName} | Meridian Sport` },
    { name: "twitter:description", content: `Najnovije vesti o ${formattedTagName.toLowerCase()} na Meridian Sport portalu.` },
    { name: "twitter:image", content: ogImageUrl },
    { name: "twitter:image:alt", content: `${formattedTagName} | Meridian Sport` }
  ]
});
import TagPage from "@/views/TagPage.vue";
</script>

<template>
  <TagPage :tagName="tagName" />
</template>
