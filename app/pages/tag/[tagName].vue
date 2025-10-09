<script setup>
import { fetchFromApi } from '~/services/api';

const route = useRoute();
const { tagName } = route.params;
const tagIdFromQuery = route.query.tagId;

console.log(`\n🔵 ============ TAG PAGE ROUTE HIT ============`);
console.log(`🔵 Tag name from params: "${tagName}"`);
console.log(`🔵 Tag ID from query: "${tagIdFromQuery}"`);
console.log(`🔵 Full route path: "${route.path}"`);
console.log(`🔵 Is server-side: ${process.server}`);
console.log(`🔵 Environment: ${process.env.NODE_ENV}`);
console.log(`🔵 ============================================\n`);

// Skip validation - allow all tags to render
// The TagPage component will handle showing "no articles" if the tag doesn't exist
// This prevents 404 errors for valid tags that aren't in the helper navigation menu
console.log(`✅ [TAG PAGE] Tag "${tagName}" - skipping validation, allowing page to render\n`);

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
  <TagPage :tagName="tagName" :tagId="tagIdFromQuery" />
</template>
