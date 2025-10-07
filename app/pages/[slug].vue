<script setup>
const route = useRoute();
const { slug } = route.params;

// Import API function
import { fetchFromApi } from '~/services/api';

// Validate category exists before rendering
const { data: categoryData, error: categoryError } = await useAsyncData(
  `category-${slug}`,
  async () => {
    try {
      // Fetch both helper nav and web settings to validate category exists
      const [helperNavRes, webSettingsRes] = await Promise.all([
        fetchFromApi("getHelperNav"),
        fetchFromApi("getWebSettings"),
      ]);

      // Helper nav: locate the 'help-nav' container and search its sub_menu
      let helperItems = [];
      if (
        helperNavRes?.success &&
        helperNavRes.result?.languages &&
        helperNavRes.result.languages.length > 0
      ) {
        const helpMenu = helperNavRes.result.languages[0].web_menu?.find(
          (it) => it.title === "help-nav"
        );
        if (helpMenu && Array.isArray(helpMenu.sub_menu)) {
          helperItems = helpMenu.sub_menu;
        }
      }

      // Main web settings menu items
      let webMenuItems = [];
      if (
        webSettingsRes?.success &&
        webSettingsRes.result?.languages &&
        webSettingsRes.result.languages.length > 0
      ) {
        webMenuItems = webSettingsRes.result.languages[0].web_menu || [];
      }

      // Search for category by slug
      const findItemBySlug = (items, targetSlug) => {
        for (const item of items) {
          if (item.slug?.toLowerCase() === targetSlug.toLowerCase()) {
            return item;
          }
          if (Array.isArray(item.sub_menu)) {
            const found = findItemBySlug(item.sub_menu, targetSlug);
            if (found) return found;
          }
        }
        return null;
      };

      const candidate =
        findItemBySlug(helperItems, slug) ||
        findItemBySlug(webMenuItems, slug);

      if (!candidate) {
        // Category doesn't exist - return null to trigger 404
        return null;
      }

      // Category exists, return some basic info
      return {
        exists: true,
        title: candidate.title,
        slug: slug
      };
    } catch (err) {
      console.error('Error validating category:', err);
      return null;
    }
  }
);

// If category doesn't exist, show 404 page
if (!categoryData.value || categoryError.value) {
  console.log(`Category "${slug}" not found, showing 404 page`);
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true
  });
}

// Get title from query if available
const displayTitle = computed(() => {
  return route.query.title || categoryData.value?.title || slug.split('-').map(word => capitalize(word)).join(' ');
});
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

useHead(() => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://meridiansport.rs/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: displayTitle.value,
        item: `https://meridiansport.rs/${slug}/`,
      },
    ],
  };

  return {
    title: `${displayTitle.value} | Meridian Sport`,
    script: [
      {
        key: 'ldjson-breadcrumb-category',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbSchema),
      },
    ],
  };
});

import CategoryPage from "@/views/CategoryPage.vue";
</script>

<template>
  <CategoryPage :slug="slug" />
</template>
