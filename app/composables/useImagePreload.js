/**
 * Composable for preloading critical images (hero/featured images)
 * Improves LCP (Largest Contentful Paint) score
 */
export function useImagePreload(imageUrl) {
  if (!imageUrl) return

  const config = useRuntimeConfig()
  const siteUrl = config.public?.SITE_URL || ''

  // Resolve relative URLs to absolute
  let absoluteUrl = imageUrl
  if (imageUrl.startsWith('/') && siteUrl) {
    absoluteUrl = siteUrl + imageUrl
  }

  // Add preload link to head
  useHead({
    link: [
      {
        rel: 'preload',
        as: 'image',
        href: absoluteUrl,
        // Add fetchpriority for critical images
        fetchpriority: 'high'
      }
    ]
  })
}

/**
 * Preload multiple images
 */
export function useImagesPreload(imageUrls = []) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return

  const config = useRuntimeConfig()
  const siteUrl = config.public?.SITE_URL || ''

  const links = imageUrls
    .filter(Boolean)
    .slice(0, 3) // Only preload first 3 images max
    .map((imageUrl) => {
      // Resolve relative URLs to absolute
      let absoluteUrl = imageUrl
      if (imageUrl.startsWith('/') && siteUrl) {
        absoluteUrl = siteUrl + imageUrl
      }

      return {
        rel: 'preload',
        as: 'image',
        href: absoluteUrl,
        fetchpriority: 'high'
      }
    })

  if (links.length > 0) {
    useHead({ link: links })
  }
}
