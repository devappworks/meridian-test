/**
 * Generate srcset and sizes attributes for responsive images
 * @param {Object} featImages - The feat_images object from API
 * @param {string} defaultSize - The default size to use (fallback)
 * @returns {Object} - Object containing src, srcset, and sizes
 */
export function generateResponsiveImageAttrs(featImages, defaultSize = 'small') {
  if (!featImages || typeof featImages !== 'object') {
    return { src: '', srcset: '', sizes: '' };
  }

  // Fallback src
  const src = featImages[defaultSize]?.url || featImages.small?.url || featImages.medium?.url || '';

  // Build srcset for different viewport sizes
  const srcsetParts = [];

  // Define image size mapping with approximate widths
  const sizeMap = {
    'thumb-mini': '150w',
    'thumb': '200w',
    'thumb-small': '300w',
    'small': '640w',
    'medium': '960w',
    'large': '1280w',
    'extra-large': '1920w'
  };

  // Add available sizes to srcset
  Object.entries(sizeMap).forEach(([sizeName, width]) => {
    if (featImages[sizeName]?.url) {
      srcsetParts.push(`${featImages[sizeName].url} ${width}`);
    }
  });

  const srcset = srcsetParts.join(', ');

  return { src, srcset };
}

/**
 * Generate srcset for news cards (smaller images)
 * @param {Object} featImages - The feat_images object from API
 * @returns {Object} - Object containing src, srcset, and sizes
 */
export function generateNewsCardImageAttrs(featImages) {
  if (!featImages || typeof featImages !== 'object') {
    return { src: '', srcset: '', sizes: '' };
  }

  const src = featImages.small?.url || featImages.medium?.url || '';

  const srcsetParts = [];

  // For news cards, use smaller sizes
  if (featImages['thumb-small']?.url) srcsetParts.push(`${featImages['thumb-small'].url} 300w`);
  if (featImages.small?.url) srcsetParts.push(`${featImages.small.url} 640w`);
  if (featImages.medium?.url) srcsetParts.push(`${featImages.medium.url} 960w`);

  const srcset = srcsetParts.join(', ');

  // Sizes attribute for responsive layout
  // Mobile: full width, Tablet: 50%, Desktop: 25-33%
  const sizes = '(max-width: 576px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return { src, srcset, sizes };
}

/**
 * Generate srcset for featured images (larger images)
 * @param {Object} featImages - The feat_images object from API
 * @returns {Object} - Object containing src, srcset, and sizes
 */
export function generateFeaturedImageAttrs(featImages) {
  if (!featImages || typeof featImages !== 'object') {
    return { src: '', srcset: '', sizes: '' };
  }

  const src = featImages.medium?.url || featImages.large?.url || '';

  const srcsetParts = [];

  // For featured images, use medium to extra-large sizes
  if (featImages.small?.url) srcsetParts.push(`${featImages.small.url} 640w`);
  if (featImages.medium?.url) srcsetParts.push(`${featImages.medium.url} 960w`);
  if (featImages.large?.url) srcsetParts.push(`${featImages.large.url} 1280w`);
  if (featImages['extra-large']?.url) srcsetParts.push(`${featImages['extra-large'].url} 1920w`);

  const srcset = srcsetParts.join(', ');

  // Featured images are typically larger
  const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';

  return { src, srcset, sizes };
}

/**
 * Generate srcset for sidebar images (smallest images)
 * @param {Object} featImages - The feat_images object from API
 * @returns {Object} - Object containing src, srcset, and sizes
 */
export function generateSidebarImageAttrs(featImages) {
  if (!featImages || typeof featImages !== 'object') {
    return { src: '', srcset: '', sizes: '' };
  }

  const src = featImages.thumb?.url || featImages['thumb-small']?.url || '';

  const srcsetParts = [];

  // For sidebar, use smallest sizes
  if (featImages['thumb-mini']?.url) srcsetParts.push(`${featImages['thumb-mini'].url} 150w`);
  if (featImages.thumb?.url) srcsetParts.push(`${featImages.thumb.url} 200w`);
  if (featImages['thumb-small']?.url) srcsetParts.push(`${featImages['thumb-small'].url} 300w`);

  const srcset = srcsetParts.join(', ');

  // Sidebar images are small
  const sizes = '(max-width: 768px) 100px, 200px';

  return { src, srcset, sizes };
}
