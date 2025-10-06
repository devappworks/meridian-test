export function useNewsArticleSchema(article) {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.SITE_URL || '').replace(/\/$/, '');
  const siteName = config.public?.SITE_NAME || 'MeridianSport';

  if (!article) return null;

  // Helper function to strip HTML tags
  function stripHtml(input) {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Build the article URL
  const articleUrl = article.url ||
    `${siteUrl}/${article.categories?.[0]?.slug || article.category}/${article.slug}`;

  // Get the main image
  const mainImage = article.feat_images?.['extra-large']?.url;

  // Get author name
  const authorName = article.authors?.[0]?.name || siteName;

  // Create description from content or subtitle
  const description = article.subtitle ||
                     stripHtml(article.contents).substring(0, 160) ||
                     article.title;

  // Convert dates to ISO 8601 format
  const publishDate = article.publish_date || article.date;
  const modifiedDate = article.updated_at || article.publish_date || article.date;

  const datePublishedISO = publishDate ? new Date(publishDate).toISOString() : undefined;
  const dateModifiedISO = modifiedDate ? new Date(modifiedDate).toISOString() : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    image: mainImage ? [mainImage] : [],
    datePublished: datePublishedISO,
    dateModified: dateModifiedISO,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `https://meridian.mpanel.app/image/cache/original/files/images/meridian-favicon-1758622126.png?crop=true`,
      },
    },
    description: description,
  };
}
