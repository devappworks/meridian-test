<script setup>
import { fetchFromApi } from '~/services/api';

const route = useRoute();
const { tagName } = route.params;

// Validate that the tag exists before rendering the page
const { data: tagValidation, error: tagError } = await useAsyncData(
  `tag-${tagName}`,
  async () => {
    try {
      // Fetch helper navigation which contains tags
      const response = await fetchFromApi("/getHelperNav");

      if (response?.success && response?.result?.languages?.length > 0) {
        const webMenu = response.result.languages[0].web_menu;

        // Find the help-nav menu item which contains the sub_menu items
        const helpNavItem = webMenu?.find(item => item.title === "help-nav");

        if (helpNavItem && helpNavItem.sub_menu) {
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
                // Tag found, return validation success
                return { exists: true, tagName };
              }
            }
          }
        }
      }

      // Tag not found
      return null;
    } catch (err) {
      console.error('Error validating tag:', err);
      return null;
    }
  }
);

// If tag doesn't exist, show 404 page
if (!tagValidation.value || tagError.value) {
  console.log(`Tag "${tagName}" not found, showing 404 page`);
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
