<script setup>
const route = useRoute();
const { slug } = route.params;

console.log(`\n🟣 ============ [SLUG] ROUTE HIT ============`);
console.log(`🟣 Slug from params: "${slug}"`);
console.log(`🟣 Full route path: "${route.path}"`);
console.log(`🟣 Is server-side: ${process.server}`);
console.log(`🟣 ============================================\n`);

// Skip this route if it's actually a tag page (handled by /tag/[tagName])
// This prevents conflicts when navigating to /tag/something
if (slug === 'tag') {
  console.log(`⛔ [SLUG] Slug is "tag", throwing 404 to let /tag/[tagName] handle it`);
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true
  });
}

// Import API function
import { fetchFromApi } from '~/services/api';

// Validate category exists before rendering - with better error handling for SSR
const { data: categoryData, error: categoryError } = await useAsyncData(
  `category-${slug}`,
  async () => {
    try {
      // Fetch both helper nav and web settings to validate category exists
      // Add timeout to prevent hanging during SSR
      const [helperNavRes, webSettingsRes] = await Promise.all([
        Promise.race([
          fetchFromApi("getHelperNav"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 10000)
          )
        ]),
        Promise.race([
          fetchFromApi("getWebSettings"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 10000)
          )
        ])
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

      // Helper function to generate slug from title (matches Header.vue logic)
      const slugifyTitle = (title) => {
        return title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/š/g, "s")
          .replace(/č/g, "c")
          .replace(/ć/g, "c")
          .replace(/ž/g, "z")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      };

      // Search for category by slug
      const findItemBySlug = (items, targetSlug) => {
        for (const item of items) {
          // Check both item.slug and generated slug from title
          const itemSlug = item.slug?.toLowerCase() || (item.title ? slugifyTitle(item.title) : null);
          if (itemSlug === targetSlug.toLowerCase()) {
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
      // On error, return null but don't block SSR - meta tags will still render
      return null;
    }
  },
  {
    // Add default value to prevent SSR blocking
    default: () => null
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

// Get title from query if available - create fallback title immediately
const fallbackTitle = slug.split('-').map(word => capitalize(word)).join(' ');
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ALWAYS set meta tags immediately - don't wait for API validation
// This ensures meta tags are rendered even if API calls fail
const title = `${fallbackTitle} | Meridian Sport`;
const description = `Najnovije vesti iz kategorije ${fallbackTitle} na Meridian Sport portalu. Pratite sve aktuelne događaje, rezultate i analize.`;

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
      name: fallbackTitle,
      item: `https://meridiansport.rs/${slug}/`,
    },
  ],
};

// Use static object for server-side rendering
useHead({
  title,
  meta: [
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description }
  ],
  script: [
    {
      key: 'ldjson-breadcrumb-category',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbSchema),
    },
  ],
});

// Get title from query if available (for dynamic updates)
const displayTitle = computed(() => {
  return route.query.title || categoryData.value?.title || fallbackTitle;
});

import CategoryPage from "@/views/CategoryPage.vue";
</script>

<template>
  <CategoryPage :slug="slug" />
</template>
