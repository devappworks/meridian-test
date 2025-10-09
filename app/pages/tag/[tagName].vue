<script setup>
import { fetchFromApi } from '~/services/api';

const route = useRoute();
const { tagName } = route.params;

// Validate that the tag exists - only on actual request, not during build
const { data: tagValidation } = await useAsyncData(
  `tag-validation-${tagName}`,
  async () => {
    try {
      const response = await fetchFromApi("/getHelperNav");

      if (response?.success && response?.result?.languages?.length > 0) {
        const webMenu = response.result.languages[0].web_menu;
        const helpNavItem = webMenu?.find(item => item.title === "help-nav");

        if (helpNavItem && helpNavItem.sub_menu) {
          for (const item of helpNavItem.sub_menu) {
            const isTag = item.content && Array.isArray(item.content) && item.content.length > 0;

            if (isTag) {
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

              if (itemSlug === tagName) {
                return { exists: true };
              }
            }
          }
        }
      }
      return { exists: false };
    } catch (err) {
      console.error('Error validating tag:', err);
      // On error, assume tag exists to avoid false 404s
      return { exists: true };
    }
  },
  {
    // Cache the validation result
    getCachedData: (key) => useNuxtApp().static.data[key],
  }
);

// Show 404 if tag doesn't exist
if (tagValidation.value && !tagValidation.value.exists) {
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
