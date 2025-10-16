/**
 * Global Cache Store for Cross-Page Data Persistence
 *
 * This composable provides a global cache that persists across page navigations.
 * Unlike useAsyncData which is scoped to individual pages, this cache is shared
 * across the entire application.
 */

// Global cache store using useState (persists across navigation)
const cacheStore = new Map()
const cacheTimestamps = new Map()

export function useGlobalCache() {
  /**
   * Get data from cache if not stale
   */
  const get = (key, staleTime = 60000) => {
    const cached = cacheStore.get(key)
    const timestamp = cacheTimestamps.get(key)

    if (!cached || !timestamp) {
      return null
    }

    const age = Date.now() - timestamp
    if (age > staleTime) {
      // Cache is stale, remove it
      cacheStore.delete(key)
      cacheTimestamps.delete(key)
      return null
    }

    console.log(`✅ Cache HIT for "${key}" (age: ${Math.round(age/1000)}s)`)
    return cached
  }

  /**
   * Set data in cache
   */
  const set = (key, data) => {
    console.log(`💾 Caching "${key}"`)
    cacheStore.set(key, data)
    cacheTimestamps.set(key, Date.now())
  }

  /**
   * Clear specific cache key
   */
  const clear = (key) => {
    cacheStore.delete(key)
    cacheTimestamps.delete(key)
    console.log(`🗑️ Cleared cache for "${key}"`)
  }

  /**
   * Clear all cache
   */
  const clearAll = () => {
    cacheStore.clear()
    cacheTimestamps.clear()
    console.log(`🗑️ Cleared ALL cache`)
  }

  /**
   * Fetch with global cache
   */
  const fetchWithCache = async (key, fetcher, staleTime = 60000) => {
    // Try to get from cache first
    const cached = get(key, staleTime)
    if (cached) {
      return cached
    }

    // Cache miss - fetch fresh data
    console.log(`🔥 Cache MISS for "${key}" - fetching from API`)
    const data = await fetcher()
    set(key, data)
    return data
  }

  return {
    get,
    set,
    clear,
    clearAll,
    fetchWithCache
  }
}
