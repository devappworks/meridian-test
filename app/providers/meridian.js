import { defineProvider } from '@nuxt/image'

/**
 * Custom Nuxt Image provider for Meridian Sport API
 * Handles image optimization for meridian.mpanel.app images
 */
export default defineProvider({
  name: 'meridian',
  // Don't modify URLs that are already from the API
  // The API already provides optimized sizes
  supportsAlias: true,

  getImage(src, { modifiers = {}, baseURL } = {}) {
    const { width, height, format, quality, fit } = modifiers

    // If src is a full URL from meridian.mpanel.app, use it as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const url = new URL(src)
      const params = new URLSearchParams()

      // Add crop parameter if needed
      if (fit === 'cover' || modifiers.crop) {
        params.set('crop', 'true')
      }

      // Add width/height if specified (for future API support)
      if (width) params.set('w', String(width))
      if (height) params.set('h', String(height))

      // Add quality if specified
      if (quality) params.set('q', String(quality))

      // Preserve existing query params
      url.search = params.toString()

      return {
        url: url.toString()
      }
    }

    // For relative paths, use baseURL
    const baseUrl = baseURL || 'https://meridian.mpanel.app'
    return {
      url: `${baseUrl}${src}`
    }
  }
})
