/**
 * Helper utility to get the best image URL with WebP support
 * Prioritizes WebP URLs from API when available
 */

/**
 * Get the best image source for a given size from featImages
 * Prioritizes WebP URLs if available
 * @param {Object} featImages - The featImages object from API
 * @param {string} size - The desired size (small, medium, large, etc.)
 * @returns {string} - The best image URL (WebP if available, otherwise regular)
 */
export function getImageUrl(featImages, size = 'medium') {
  if (!featImages || typeof featImages !== 'object') {
    return '';
  }

  // Priority order for sizes
  const sizePriority = {
    'thumb-mini': ['thumb-mini', 'thumb', 'thumb-small', 'small'],
    'thumb': ['thumb', 'thumb-small', 'small', 'medium'],
    'thumb-small': ['thumb-small', 'small', 'thumb', 'medium'],
    'small': ['small', 'medium', 'thumb-small', 'large'],
    'medium': ['medium', 'large', 'small', 'extra-large'],
    'large': ['large', 'extra-large', 'medium', 'small'],
    'extra-large': ['extra-large', 'large', 'medium', 'small']
  };

  const sizes = sizePriority[size] || [size, 'medium', 'small', 'large'];

  // Try to get WebP URL first
  for (const sizeOption of sizes) {
    if (featImages[sizeOption]?.webp) {
      return featImages[sizeOption].webp;
    }
  }

  // Fallback to regular URL
  for (const sizeOption of sizes) {
    if (featImages[sizeOption]?.url) {
      return featImages[sizeOption].url;
    }
  }

  return '';
}

/**
 * Get WebP URL if available, otherwise return regular URL
 * @param {Object} featImages - The featImages object from API
 * @param {string} size - The desired size
 * @returns {string|null} - WebP URL or null
 */
export function getWebpUrl(featImages, size = 'medium') {
  if (!featImages || typeof featImages !== 'object') {
    return null;
  }

  return featImages[size]?.webp || null;
}

/**
 * Check if WebP is available for a given image
 * @param {Object} featImages - The featImages object from API
 * @param {string} size - The desired size
 * @returns {boolean}
 */
export function hasWebp(featImages, size = 'medium') {
  return !!(featImages && featImages[size]?.webp);
}
