<script setup>
import { fetchFromApi } from '~/services/api';

const route = useRoute();
const { tagName } = route.params;

// Validate that the tag exists before rendering the page
// Only run validation on server-side to avoid issues during build
const { data: tagValidation, error: tagError } = await useAsyncData(
  `tag-${tagName}`,
  async () => {
    try {
      console.log(`[TAG VALIDATION] Validating tag: ${tagName}`);

      // Fetch helper navigation which contains tags
      const response = await fetchFromApi("/getHelperNav");

      console.log(`[TAG VALIDATION] API response received:`, response?.success);

      if (response?.success && response?.result?.languages?.length > 0) {
        const webMenu = response.result.languages[0].web_menu;

        // Find the help-nav menu item which contains the sub_menu items
        const helpNavItem = webMenu?.find(item => item.title === "help-nav");

        if (helpNavItem && helpNavItem.sub_menu) {
          console.log(`[TAG VALIDATION] Found ${helpNavItem.sub_menu.length} helper nav items`);

          // Search through sub_menu items for tags (items with non-empty content array)
          for (const item of helpNavItem.sub_menu) {
            // Check if this is a tag (has content)
            const isTag = item.content && Array.isArray(item.content) && item.content.length > 0;

            if (isTag) {
              // Generate slug from the item title
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

              // Check if this matches our tag name
              if (itemSlug === tagName) {
                console.log(`[TAG VALIDATION] ✅ Tag found: ${tagName}`);
                // Tag found, return validation success
                return { exists: true, tagName };
              }
            }
          }
        }
      }

      console.error(`[TAG VALIDATION] ❌ Tag not found: ${tagName}`);
      // Tag not found
      return null;
    } catch (err) {
      console.error('[TAG VALIDATION] ❌ Error validating tag:', err);
      // On error, allow the page to render and let client-side handle it
      // This prevents build failures when API is unreachable
      if (process.server) {
        return { exists: true, tagName }; // Assume valid during SSR if API fails
      }
      return null;
    }
  },
  {
    // Only fetch on server-side during initial render
    server: true,
    lazy: false,
  }
);

// If tag doesn't exist, show 404 page (but only if we're confident it doesn't exist)
if (!tagValidation.value || tagError.value) {
  console.log(`[TAG VALIDATION] Tag "${tagName}" validation failed, showing 404 page`);
  throw createError({
    statusCode: 404,
    statusMessage: 'Tag Not Found',
    fatal: true
  });
}

useHead(() => ({ title: `#${tagName}` }));
import TagPage from "@/views/TagPage.vue";
</script>

<template>
  <TagPage :tagName="tagName" />
</template>
