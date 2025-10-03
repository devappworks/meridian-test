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

const { data: article } = await useAsyncData(
  `article-slug-${category}-${slug}`,
  async () => {
    return await $fetch(`/api/articles/resolve`, {
      query: { category, slug }
    })
  }
)

useHead(() => {
  const a = article.value || {};
  const siteUrl = (config.public?.SITE_URL || "").replace(/\/$/, "");
  const siteName = config.public?.SITE_NAME || "";
  const twitterHandle = config.public?.TWITTER_HANDLE || "";
  const canonicalCategory = getCanonicalCategory(a.categories, category);
  const canonicalUrl = siteUrl ? `${siteUrl}/${canonicalCategory}/${slug}` : undefined;
  const title = a.title || siteName || "Meridian Sport";
  const rawDesc = a.excerpt || a.subtitle || stripHtml(a.contents || "") || a.title || "";
  const description = truncate(stripHtml(rawDesc), 160) || a.title || "";
  const filledDescription = description || (title !== "Article" ? title : siteName) || siteName || "Meridian Sport";
  const imageUrl = a?.images?.large?.url || a?.images?.small?.url || undefined;
  const authorName = a?.author || "Redakcija";
  const publishedTime = a?.date || a?.publish_date || undefined;
  const tags = Array.isArray(a?.tags) ? a.tags.map((t) => t?.name).filter(Boolean) : [];

  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    mainEntityOfPage: canonicalUrl
      ? { "@type": "WebPage", "@id": canonicalUrl }
      : undefined,
    image: imageUrl ? [imageUrl] : undefined,
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
    datePublished: publishedTime,
    dateModified: publishedTime,
  };

  const meta = [
    { key: "description", name: "description", content: filledDescription },
    { key: "robots", name: "robots", content: "index, follow" },
    { key: "og:type", property: "og:type", content: "article" },
    siteName ? { key: "og:site_name", property: "og:site_name", content: siteName } : null,
    { key: "og:title", property: "og:title", content: title },
    { key: "og:description", property: "og:description", content: filledDescription },
    canonicalUrl ? { key: "og:url", property: "og:url", content: canonicalUrl } : null,
    imageUrl ? { key: "og:image", property: "og:image", content: imageUrl } : null,
    imageUrl ? { key: "og:image:alt", property: "og:image:alt", content: title } : null,
    publishedTime ? { key: "article:published_time", property: "article:published_time", content: publishedTime } : null,
    { key: "twitter:card", name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
    twitterHandle ? { key: "twitter:site", name: "twitter:site", content: twitterHandle } : null,
    { key: "twitter:title", name: "twitter:title", content: title },
    { key: "twitter:description", name: "twitter:description", content: filledDescription },
    imageUrl ? { key: "twitter:image", name: "twitter:image", content: imageUrl } : null,
    imageUrl ? { key: "twitter:image:alt", name: "twitter:image:alt", content: title } : null,
    ...tags.map((t, i) => ({ key: `article:tag:${i}`, property: "article:tag", content: t })),
  ].filter(Boolean);

  const link = canonicalUrl ? [{ rel: "canonical", href: canonicalUrl }] : [];

  // Build breadcrumb schema
  const breadcrumbs = a.categories?.[0]?.name ? [
    {
      name: a.categories[0].name,
      url: `/${canonicalCategory}`,
    },
    {
      name: a.title,
      url: canonicalUrl,
    },
  ] : [];

  const breadcrumbSchema = useBreadcrumbSchema(breadcrumbs);

  const script = [
    {
      key: "ldjson-article",
      type: "application/ld+json",
      children: JSON.stringify(ld),
    },
  ];

  if (breadcrumbSchema) {
    script.push({
      key: "ldjson-breadcrumb",
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
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


