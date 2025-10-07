<script setup>
// The article canonical middleware is now global

const route = useRoute();
const config = useRuntimeConfig();
const category = route.params.category;
const slug = route.params.slug;


// Import the canonical category utility function instead of duplicating logic
import { getCanonicalCategory } from '~/utils/canonicalCategory';
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema';

function stripHtml(input) {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input, max = 160) {
  if (!input) return "";
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + "…";
}

console.log('\n🟢 ============ PAGE COMPONENT START ============')
console.log('🟢 [category]/[slug].vue loading:', { 
  category, 
  slug,
  fullPath: route.fullPath,
  timestamp: new Date().toISOString()
})

const { data: article, error: fetchError } = await useAsyncData(
  `article-slug-${category}-${slug}`,
  async () => {
    console.log('🟢 useAsyncData executing for:', { category, slug })
    
    try {
      const result = await $fetch(`/api/articles/resolve`, {
        query: { category, slug }
      })
      
      console.log('🟢 useAsyncData received result:', {
        hasResult: !!result,
        resultType: typeof result,
        hasId: !!result?.id,
        hasTitle: !!result?.title,
        title: result?.title?.substring(0, 50)
      })
      
      return result
    } catch (err) {
      console.error('🟢 useAsyncData ERROR:', {
        message: err.message,
        statusCode: err.statusCode,
        statusMessage: err.statusMessage,
        data: err.data
      })
      throw err
    }
  }
)

console.log('🟢 useAsyncData completed:', {
  hasArticle: !!article.value,
  hasError: !!fetchError.value,
  articleId: article.value?.id,
  errorMessage: fetchError.value?.message
})

if (fetchError.value) {
  console.error('🟢 Fetch error details:', fetchError.value)
  
  // If the article fetch failed with a 404, show the error page
  const statusCode = fetchError.value.statusCode || fetchError.value.response?.status || 500
  
  if (statusCode === 404) {
    console.log('🟢 Article not found (404), showing error page')
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    })
  } else {
    // For other errors, throw with the actual status code
    console.log(`🟢 Error fetching article (${statusCode}), showing error page`)
    throw createError({
      statusCode,
      statusMessage: fetchError.value.statusMessage || 'Error loading page',
      fatal: true
    })
  }
}

console.log('🟢 ============ PAGE COMPONENT END ============\n')

useHead(() => {
  const a = article.value || {};
  const siteUrl = (config.public?.SITE_URL || "").replace(/\/$/, "");
  const siteName = config.public?.SITE_NAME || "";
  const twitterHandle = config.public?.TWITTER_HANDLE || "";
  const canonicalCategory = getCanonicalCategory(a.categories, category);
  const canonicalUrl = siteUrl ? `${siteUrl}/${canonicalCategory}/${slug}/` : undefined;
  const title = a.title || siteName || "Meridian Sport";
  const rawDesc = a.excerpt || a.subtitle || stripHtml(a.contents || "") || a.title || "";
  const description = truncate(stripHtml(rawDesc), 160) || a.title || "";
  const filledDescription = description || (title !== "Article" ? title : siteName) || siteName || "Meridian Sport";
  const imageUrl = a?.feat_images?.['extra-large']?.url || a?.images?.small?.url || undefined;

  const authorName = a?.authors?.[0]?.name || "Redakcija";
  // Use publish_date first (ISO format), fallback to date field
  const publishedTime = a?.publish_date || a?.date || undefined;
  // Use update_date or updated_at for modified time, fallback to publish date
  const modifiedTime = a?.update_date || a?.updated_at || a?.publish_date || a?.date || undefined;
  const tags = Array.isArray(a?.tags) ? a.tags.map((t) => t?.name).filter(Boolean) : [];
  const categoryName = a?.categories?.[0]?.name || "";

  // Convert publishedTime to ISO 8601 format with error handling
  let publishedTimeISO = undefined;
  if (publishedTime) {
    try {
      const dateObj = new Date(publishedTime);
      // Check if date is valid
      if (!isNaN(dateObj.getTime())) {
        publishedTimeISO = dateObj.toISOString();
      } else {
        console.warn('🟢 Invalid date value for article:', publishedTime);
      }
    } catch (err) {
      console.warn('🟢 Error parsing date for article:', publishedTime, err);
    }
  }

  // Convert modifiedTime to ISO 8601 format with error handling
  let modifiedTimeISO = undefined;
  if (modifiedTime) {
    try {
      const dateObj = new Date(modifiedTime);
      // Check if date is valid
      if (!isNaN(dateObj.getTime())) {
        modifiedTimeISO = dateObj.toISOString();
      } else {
        console.warn('🟢 Invalid modified date value for article:', modifiedTime);
      }
    } catch (err) {
      console.warn('🟢 Error parsing modified date for article:', modifiedTime, err);
    }
  }

  // Generate news keywords from tags (comma-separated, max 10 keywords for Google News)
  const newsKeywords = tags.slice(0, 10).join(', ');

  // Build proper ImageObject with dimensions for Google News
  const imageObject = imageUrl ? {
    "@type": "ImageObject",
    url: imageUrl,
    width: 1200, // Standard OG image width
    height: 630  // Standard OG image height (adjust if you know actual dimensions)
  } : undefined;

  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    mainEntityOfPage: canonicalUrl
      ? { "@type": "WebPage", "@id": canonicalUrl }
      : undefined,
    image: imageObject,
    author: { "@type": "Person", name: authorName },
    publisher: siteName
      ? {
          "@type": "Organization",
          name: siteName,
          logo: siteUrl
            ? {
                "@type": "ImageObject",
                url: `${siteUrl}/favicon.ico`,
              }
            : undefined,
        }
      : undefined,
    datePublished: publishedTimeISO,
    dateModified: modifiedTimeISO || publishedTimeISO, // Use modified date or fallback to published
  };

  const meta = [
    { key: "description", name: "description", content: filledDescription },
    { key: "robots", name: "robots", content: "index, follow, max-image-preview:large" },
    // Google News specific meta tags
    newsKeywords ? { key: "news_keywords", name: "news_keywords", content: newsKeywords } : null,
    // Open Graph meta tags
    { key: "og:type", property: "og:type", content: "article" },
    siteName ? { key: "og:site_name", property: "og:site_name", content: siteName } : null,
    { key: "og:title", property: "og:title", content: title },
    { key: "og:description", property: "og:description", content: filledDescription },
    canonicalUrl ? { key: "og:url", property: "og:url", content: canonicalUrl } : null,
    imageUrl ? { key: "og:image", property: "og:image", content: imageUrl } : null,
    imageUrl ? { key: "og:image:width", property: "og:image:width", content: "1200" } : null,
    imageUrl ? { key: "og:image:height", property: "og:image:height", content: "630" } : null,
    imageUrl ? { key: "og:image:alt", property: "og:image:alt", content: title } : null,
    // Article meta tags with ISO 8601 format
    publishedTimeISO ? { key: "article:published_time", property: "article:published_time", content: publishedTimeISO } : null,
    modifiedTimeISO ? { key: "article:modified_time", property: "article:modified_time", content: modifiedTimeISO } : null,
    authorName ? { key: "article:author", property: "article:author", content: authorName } : null,
    categoryName ? { key: "article:section", property: "article:section", content: categoryName } : null,
    // Twitter Card meta tags
    { key: "twitter:card", name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
    twitterHandle ? { key: "twitter:site", name: "twitter:site", content: twitterHandle } : null,
    { key: "twitter:title", name: "twitter:title", content: title },
    { key: "twitter:description", name: "twitter:description", content: filledDescription },
    imageUrl ? { key: "twitter:image", name: "twitter:image", content: imageUrl } : null,
    imageUrl ? { key: "twitter:image:alt", name: "twitter:image:alt", content: title } : null,
    // Article tags
    ...tags.map((t, i) => ({ key: `article:tag:${i}`, property: "article:tag", content: t })),
  ].filter(Boolean);

  const link = canonicalUrl ? [{ rel: "canonical", href: canonicalUrl }] : [];

  // Build breadcrumb schema
  const breadcrumbs = a.categories?.[0]?.name ? [
    {
      name: a.categories[0].name,
      url: `/${canonicalCategory}/`,
    },
    {
      name: a.title,
      url: canonicalUrl,
    },
  ] : [];

  const breadcrumbSchema = useBreadcrumbSchema(breadcrumbs, siteUrl);

  const script = [
    {
      key: "ldjson-article",
      type: "application/ld+json",
      innerHTML: JSON.stringify(ld),
    },
  ];

  if (breadcrumbSchema) {
    script.push({
      key: "ldjson-breadcrumb",
      type: "application/ld+json",
      innerHTML: JSON.stringify(breadcrumbSchema),
    });
  }

  return {
    title,
    meta,
    link,
    script,
  };
});

import ArticlePage from "@/views/ArticlePage.vue";
</script>

<template>
  <div v-if="article">
    <ArticlePage :category="category" :slug="slug" :article="article" />
    <!-- Article data is now passed from server-side useAsyncData to prevent hydration mismatch -->
  </div>
  <div v-else>
    <!-- Loading or redirect state - don't render ArticlePage if no article data -->
  </div>
</template>


