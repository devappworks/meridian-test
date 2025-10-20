/**
 * Image utility functions for SEO optimization
 * Handles image dimensions, Google Discover compliance, and metadata
 */

/**
 * Extract actual image dimensions from feat_images object
 * Falls back to standard OG dimensions if not available
 *
 * @param {Object} featImages - The feat_images object from API
 * @param {string} sizeKey - The size key to extract (default: 'extra-large')
 * @returns {Object} - Object containing width and height
 */
export function getImageDimensions(featImages, sizeKey = 'extra-large') {
  if (!featImages || typeof featImages !== 'object') {
    return {
      width: 1200,
      height: 630
    };
  }

  const image = featImages[sizeKey];

  if (image?.width && image?.height) {
    return {
      width: image.width,
      height: image.height
    };
  }

  // Fallback to standard OG image dimensions (safe default)
  return {
    width: 1200,
    height: 630
  };
}

/**
 * Verify image meets Google Discover requirements
 * - Minimum width: 1200px
 * - Preferred ratios: 16:9, 4:3, 1:1
 *
 * @param {Object} dimensions - Object with width and height
 * @returns {Object} - Compliance status and details
 */
export function isDiscoverCompliant(dimensions) {
  const { width, height } = dimensions;

  if (!width || !height) {
    return {
      compliant: false,
      width: 0,
      height: 0,
      ratio: 0,
      issues: ['Missing dimensions']
    };
  }

  const ratio = width / height;

  const meetsWidth = width >= 1200;
  const goodRatio = (
    Math.abs(ratio - 16/9) < 0.1 ||  // 16:9
    Math.abs(ratio - 4/3) < 0.1 ||   // 4:3
    Math.abs(ratio - 1) < 0.1        // 1:1
  );

  return {
    compliant: meetsWidth && goodRatio,
    width,
    height,
    ratio: ratio.toFixed(2),
    issues: [
      !meetsWidth ? `Width ${width}px below 1200px minimum` : null,
      !goodRatio ? `Ratio ${ratio.toFixed(2)}:1 not optimal for Discover (prefer 16:9, 4:3, or 1:1)` : null
    ].filter(Boolean)
  };
}

/**
 * Get image credit text with fallback
 *
 * @param {Object} article - Article object
 * @param {string} fallback - Fallback credit text
 * @returns {string} - Credit text
 */
export function getImageCredit(article, fallback = 'Meridian Sport') {
  return article?.image_credit || article?.photo_credit || fallback;
}

/**
 * Generate copyright notice for image
 *
 * @param {string} publishDate - Article publish date
 * @param {string} siteName - Site name for copyright
 * @returns {string} - Copyright notice
 */
export function getCopyrightNotice(publishDate, siteName = 'Meridian Sport') {
  let year = new Date().getFullYear();

  if (publishDate) {
    try {
      const dateObj = new Date(publishDate);
      if (!isNaN(dateObj.getTime())) {
        year = dateObj.getFullYear();
      }
    } catch (err) {
      console.warn('Error parsing date for copyright:', publishDate);
    }
  }

  return `© ${year} ${siteName}`;
}
