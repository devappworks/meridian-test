/* export function useNewsArticleSchema(article) {
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
  const authorName = article.authors?.[0]?.name || 'Redakcija';

  // Create description from content or subtitle
  const description = article.subtitle ||
                     stripHtml(article.contents).substring(0, 160) ||
                     article.title;

  // Convert dates to ISO 8601 format with error handling
  // Use publish_date (ISO format) before formatted date field
  const publishDate = article.publish_date || article.date;
  const modifiedDate = article.update_date || article.updated_at || article.publish_date || article.date;

  // Helper function to safely parse dates
  const safeParseDate = (dateString) => {
    if (!dateString) return undefined;
    try {
      const dateObj = new Date(dateString);
      return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : undefined;
    } catch (err) {
      console.warn('Failed to parse date:', dateString);
      return undefined;
    }
  };

  const datePublishedISO = safeParseDate(publishDate);
  const dateModifiedISO = safeParseDate(modifiedDate);

  // Build proper ImageObject with dimensions for Google News
  const imageObject = mainImage ? {
    '@type': 'ImageObject',
    url: mainImage,
    width: 1200, // Standard OG image width
    height: 630  // Standard OG image height (adjust if you know actual dimensions)
  } : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    image: imageObject,
    datePublished: datePublishedISO,
    dateModified: dateModifiedISO || datePublishedISO, // Use modified date or fallback to published
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Meridian Sport',
      url: 'https://meridiansport.rs/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://meridiansport.rs/images/meridian-favicon-512x512.png',
        width: 512,
        height: 512
      },
      sameAs: [
        'https://www.facebook.com/SportMeridian/',
        'https://www.instagram.com/meridiansportrs/',
        'https://www.youtube.com/@meridiansport',
        'https://x.com/meridiansportrs'
      ]
    },
    description: description,
    isAccessibleForFree: true,
  };
}
 */