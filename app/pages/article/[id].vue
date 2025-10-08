<script setup>
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema';

const route = useRoute();
const id = route.params.id;
const config = useRuntimeConfig();

function stripHtml(input) {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input, max = 160) {
  if (!input) return "";
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + "…";
}

const { data: article, error } = await useAsyncData(
  `article-${id}`,
  async () => {
    try {
      return await $fetch(`/api/articles/${id}`)
    } catch (e) {
      // Let the view handle error state; return null so page still renders
      return null
    }
  }
)

useHead(() => {
  const a = article.value || {};
  const siteUrl = (config.public?.SITE_URL || "").replace(/\/$/, "");
  const siteName = config.public?.SITE_NAME || "";
  const twitterHandle = config.public?.TWITTER_HANDLE || "";
  const canonicalUrl = siteUrl ? `${siteUrl}/article/${id}/` : undefined;
  const title = a.title || siteName || "Meridian Sport";
  const rawDesc = a.excerpt || a.subtitle || stripHtml(a.contents || "") || a.title || "";
  const description = truncate(stripHtml(rawDesc), 160) || a.title || "";
  const filledDescription = description || (title !== "Article" ? title : siteName) || siteName || "Meridian Sport";
  const imageUrl = a?.feat_images?.['extra-large']?.url || a?.feat_images?.large?.url || a?.feat_images?.small?.url || undefined;
  const authorName = a?.authors?.[0]?.name || "Redakcija";
  // Prefer primary date, fallback to publish_date if present
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
                url: `${siteUrl}/images/meridian-favicon-512x512.png`,
              }
            : undefined,
          sameAs: [
            "https://www.facebook.com/sportmeridian",
            "https://www.instagram.com/meridiansportrs",
            "https://www.youtube.com/@meridiansport",
            "https://twitter.com/meridiansportrs"
          ]
        }
      : undefined,
    datePublished: publishedTime,
    dateModified: publishedTime,
  };

  const meta = [
    { key: "description", name: "description", content: filledDescription },
    { key: "robots", name: "robots", content: "index, follow, max-image-preview:large" },
    // Open Graph
    { key: "og:type", property: "og:type", content: "article" },
    siteName ? { key: "og:site_name", property: "og:site_name", content: siteName } : null,
    { key: "og:title", property: "og:title", content: title },
    { key: "og:description", property: "og:description", content: filledDescription },
    canonicalUrl ? { key: "og:url", property: "og:url", content: canonicalUrl } : null,
    imageUrl ? { key: "og:image", property: "og:image", content: imageUrl } : null,
    imageUrl ? { key: "og:image:alt", property: "og:image:alt", content: title } : null,
    publishedTime ? { key: "article:published_time", property: "article:published_time", content: publishedTime } : null,
    // Twitter
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
  const breadcrumbs = a.categories?.[0] ? [
    {
      name: a.categories[0].name,
      url: `/${a.categories[0].slug}/`,
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

// Server-side redirect only - handles /article/:id -> /category/slug/ redirects
// This runs during SSR and ensures proper 301 redirects for SEO
if (process.server && article.value?.url) {
  const prettyUrl = article.value.url
  // Only redirect if we have a pretty URL that's not an /article/ URL
  if (prettyUrl && !prettyUrl.startsWith('/article/') && route.path.startsWith('/article/')) {
    console.log(`[SERVER] Redirecting from ${route.path} to ${prettyUrl}`)
    await navigateTo(prettyUrl, { redirectCode: 301 })
  }
}

// Note: Client-side redirect removed to prevent double redirects
// Server-side redirect above handles all cases during initial load
// For client-side navigation, users should navigate directly to pretty URLs
</script>

<template>
  <ArticlePage 
    :category="article?.category?.slug || article?.categories?.[0]?.slug || ''" 
    :slug="article?.slug || ''" 
  />
</template>
