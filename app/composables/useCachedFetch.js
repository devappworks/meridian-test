/**
 * Smart Caching Pattern for Nuxt 4 + Vue 3
 *
 * Provides instant navigation with automatic cache expiration and refetching.
 * SSR-friendly and works seamlessly on both server and client.
 *
 * @example
 * ```js
 * const { data, pending, refresh } = await useCachedFetch('homepage', '/api/homepage', {
 *   staleTime: 1000 * 60 // 60 seconds
 * })
 * ```
 */

export function useCachedFetch(key, url, options = {}) {
  const {
    staleTime = 1000 * 60, // Default: 60 seconds
    server = true,
    lazy = false,
    ...fetchOptions
  } = options

  return useAsyncData(
    key,
    async () => {
      return await $fetch(url, fetchOptions)
    },
    {
      // Cache for specified duration
      staleTime,

      // Enable SSR by default
      server,

      // Don't lazy load by default (fetch immediately)
      lazy,

      // Pass through any other options
      ...fetchOptions
    }
  )
}
