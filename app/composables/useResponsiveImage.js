/**
 * Composable for generating responsive image attributes with modern format support
 * Helps optimize images by providing srcset for different sizes and formats
 * 
 * Usage:
 * const { generateSrcSet, getSrcSetSizes } = useResponsiveImage()
 * const srcset = generateSrcSet(imageUrl, [320, 640, 768, 1024, 1280, 1920])
 */
export const useResponsiveImage = () => {
  /**
   * Generate srcset string for responsive images
   * @param {string} baseUrl - Base image URL
   * @param {number[]} widths - Array of desired widths
   * @returns {string} - srcset attribute value
   */
  const generateSrcSet = (baseUrl, widths = [320, 640, 768, 1024, 1280, 1920]) => {
    if (!baseUrl) return '';
    
    // Check if URL is from mpanel.app (external API)
    const isMPanel = baseUrl.includes('mpanel.app');
    
    if (isMPanel) {
      // For mpanel images, we can't directly control the format
      // But we can suggest different sizes if the API supports it
      return widths
        .map(width => `${baseUrl}?w=${width} ${width}w`)
        .join(', ');
    }
    
    // For local images, just return the base URL with width descriptors
    return widths
      .map(width => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  };

  /**
   * Generate sizes attribute based on common breakpoints
   * @param {string} customSizes - Optional custom sizes string
   * @returns {string} - sizes attribute value
   */
  const getSrcSetSizes = (customSizes = null) => {
    if (customSizes) return customSizes;
    
    // Default responsive sizes
    return '(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
  };

  /**
   * Get optimal image format support
   * Checks browser support for modern image formats
   * @returns {Promise<string>} - Best supported format ('avif', 'webp', or 'original')
   */
  const getOptimalFormat = async () => {
    if (typeof window === 'undefined') return 'original';
    
    // Check AVIF support
    const avifSupport = await checkImageSupport('image/avif');
    if (avifSupport) return 'avif';
    
    // Check WebP support
    const webpSupport = await checkImageSupport('image/webp');
    if (webpSupport) return 'webp';
    
    return 'original';
  };

  /**
   * Check if browser supports a specific image format
   * @param {string} format - MIME type to check
   * @returns {Promise<boolean>}
   */
  const checkImageSupport = (format) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Test images (1x1 pixel)
      const testImages = {
        'image/avif': 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
        'image/webp': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
      };
      
      img.src = testImages[format] || '';
    });
  };

  return {
    generateSrcSet,
    getSrcSetSizes,
    getOptimalFormat
  };
};

