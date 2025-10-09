<script setup>
import { fetchFromApi } from '~/services/api';

const route = useRoute();
const { tagName } = route.params;

console.log(`\n🔵 ============ TAG PAGE ROUTE HIT ============`);
console.log(`🔵 Tag name from params: "${tagName}"`);
console.log(`🔵 Full route path: "${route.path}"`);
console.log(`🔵 Is server-side: ${process.server}`);
console.log(`🔵 Environment: ${process.env.NODE_ENV}`);
console.log(`🔵 ============================================\n`);

// Validate that the tag exists - with better error handling for SSR
const { data: tagValidation } = await useAsyncData(
  `tag-validation-${tagName}`,
  async () => {
    console.log(`🟡 [TAG VALIDATION] Starting validation for: "${tagName}"`);

    try {
      console.log(`🟡 [TAG VALIDATION] Calling fetchFromApi("/getHelperNav")...`);
      
      // Add timeout to prevent hanging during SSR
      const response = await Promise.race([
        fetchFromApi("/getHelperNav"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 10000)
        )
      ]);

      console.log(`🟡 [TAG VALIDATION] API Response:`, {
        success: response?.success,
        hasResult: !!response?.result,
        hasLanguages: !!response?.result?.languages,
        languagesLength: response?.result?.languages?.length
      });

      if (response?.success && response?.result?.languages?.length > 0) {
        const webMenu = response.result.languages[0].web_menu;
        console.log(`🟡 [TAG VALIDATION] webMenu length:`, webMenu?.length);

        const helpNavItem = webMenu?.find(item => item.title === "help-nav");
        console.log(`🟡 [TAG VALIDATION] Found help-nav item:`, !!helpNavItem);
        console.log(`🟡 [TAG VALIDATION] help-nav sub_menu length:`, helpNavItem?.sub_menu?.length);

        if (helpNavItem && helpNavItem.sub_menu) {
          let tagCount = 0;
          let matchFound = false;

          for (const item of helpNavItem.sub_menu) {
            const isTag = item.content && Array.isArray(item.content) && item.content.length > 0;

            if (isTag) {
              tagCount++;
              const itemSlug = item.title
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/š/g, 's')
                .replace(/č/g, 'c')
                .replace(/ć/g, 'c')
                .replace(/ž/g, 'z')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

              console.log(`🟡 [TAG VALIDATION] Tag #${tagCount}: "${item.title}" → slug: "${itemSlug}" (looking for: "${tagName}")`);

              if (itemSlug === tagName) {
                matchFound = true;
                console.log(`✅ [TAG VALIDATION] MATCH FOUND! Tag "${tagName}" exists!`);
                return { exists: true };
              }
            }
          }

          console.log(`🟡 [TAG VALIDATION] Checked ${tagCount} tags, no match found for "${tagName}"`);
          console.log(`❌ [TAG VALIDATION] Tag "${tagName}" does NOT exist`);
          return { exists: false };
        }
      }

      console.log(`❌ [TAG VALIDATION] API response structure invalid`);
      return { exists: false };
    } catch (err) {
      console.error(`❌ [TAG VALIDATION] ERROR validating tag "${tagName}":`, err);
      console.error(`❌ [TAG VALIDATION] Error message:`, err?.message);
      console.error(`❌ [TAG VALIDATION] Error stack:`, err?.stack);
      
      // On error, assume tag exists to avoid false 404s and ensure meta tags render
      console.log(`⚠️ [TAG VALIDATION] Assuming tag exists due to error - meta tags will still render`);
      return { exists: true };
    }
  },
  {
    // Cache the validation result
    getCachedData: (key) => useNuxtApp().static.data[key],
    // Add default value to prevent SSR blocking
    default: () => ({ exists: true })
  }
);

console.log(`🔵 [TAG PAGE] Validation result:`, tagValidation.value);

// Show 404 if tag doesn't exist
if (tagValidation.value && !tagValidation.value.exists) {
  console.log(`❌ [TAG PAGE] Tag "${tagName}" doesn't exist, throwing 404 error`);
  throw createError({
    statusCode: 404,
    statusMessage: 'Tag Not Found',
    fatal: true
  });
}

console.log(`✅ [TAG PAGE] Tag "${tagName}" validated successfully, rendering page\n`);

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
