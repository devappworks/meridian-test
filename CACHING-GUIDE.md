# Smart Caching Pattern - Implementation Guide

This project now implements the **Smart Caching Pattern** for Nuxt 4 + Vue 3, providing instant navigation with automatic cache expiration and refetching.

## What Was Implemented

### 1. Configuration Changes ([nuxt.config.ts](nuxt.config.ts))

```js
experimental: {
  asyncDataCache: true  // Enable async data caching
},
app: {
  keepalive: false  // Disable keepalive for proper cache invalidation
}
```

### 2. Composable ([composables/useCachedFetch.js](app/composables/useCachedFetch.js))

A new composable `useCachedFetch` is available for future use. It wraps `useAsyncData` with caching defaults.

**Usage Example:**
```js
const { data, pending, refresh } = await useCachedFetch(
  'homepage',
  '/api/homepage',
  {
    staleTime: 1000 * 60 // 60 seconds
  }
)
```

### 3. Enhanced Existing Pages

All major pages now use the `staleTime` option in their `useAsyncData` calls:

#### Homepage ([pages/index.vue](app/pages/index.vue))
- **Featured articles**: 60 seconds cache
- **Latest articles**: 60 seconds cache
- **Sport categories** (Football, Basketball, Volleyball): 60 seconds cache
- **Tipovi**: 30 seconds cache (more dynamic)

#### Article Pages
- **[pages/article/[id].vue](app/pages/article/[id].vue)**: 24 hours cache (immutable)
- **[pages/[category]/[slug].vue](app/pages/[category]/[slug].vue)**: 24 hours cache (immutable)
- **Other news sidebar**: 5 minutes cache

## How It Works

### Client-Side Navigation Caching

When you navigate between pages:

1. **First visit** → Data is fetched from API and cached
2. **Return within cache time** → Served instantly from cache (NO API call)
3. **After cache expires** → Automatically refetches fresh data

### Cache Duration Strategy

| Content Type | Cache Duration | Reasoning |
|--------------|----------------|-----------|
| **Homepage sections** | 60 seconds | Frequently updated, need fresh content |
| **Tipovi (betting tips)** | 30 seconds | Time-sensitive content |
| **Article pages** | 24 hours | Immutable once published |
| **Other news sidebars** | 5 minutes | Balance between freshness and performance |
| **Category listings** | 60 seconds | Matches Nitro SWR cache |

### SSR + Client Synergy

The caching works on both server and client:

- **SSR (First Load)**: Server renders with data, sends to client
- **Client Navigation**: Reuses cached data if still fresh
- **Background Refetch**: After stale time, data is refetched automatically

## Benefits

✅ **Instant Navigation** - Cached pages load instantly
✅ **Reduced API Load** - Significantly fewer API calls
✅ **Automatic Freshness** - Data auto-refetches when stale
✅ **SSR Compatible** - Works seamlessly with server-side rendering
✅ **Zero Breaking Changes** - All existing functionality preserved

## Manual Cache Control

### Force Refresh a Single Cache Key
```js
await refreshNuxtData('homepage-featured')
```

### Force Refresh All Data on Current Page
```js
await refreshNuxtData()
```

### Manual Refresh Button
```vue
<script setup>
const { data, refresh } = await useAsyncData(
  'my-data',
  () => fetchFromApi('/endpoint'),
  { staleTime: 1000 * 60 }
)
</script>

<template>
  <button @click="refresh()">Refresh Content</button>
</template>
```

## Cache Keys Best Practices

### Static Content
```js
// ✅ Good - Simple key for static content
await useAsyncData('homepage-featured', () => fetchFromApi('/featured'))
```

### Dynamic Content (with parameters)
```js
// ✅ Good - Include params in key for proper cache isolation
const route = useRoute()
await useAsyncData(
  `article-${route.params.slug}`,
  () => fetchFromApi(`/articles/${route.params.slug}`),
  { staleTime: 1000 * 60 * 60 * 24 }
)
```

### Category Pages with Pagination
```js
// ✅ Good - Include page number in key
const page = ref(1)
await useAsyncData(
  `category-${categoryId}-page-${page.value}`,
  () => fetchFromApi('/articles', { category: categoryId, page: page.value }),
  { staleTime: 1000 * 60 * 5 }
)
```

## Adjusting Cache Duration

Edit the `staleTime` option in any `useAsyncData` call:

```js
await useAsyncData(
  'my-key',
  () => fetchFromApi('/endpoint'),
  {
    staleTime: 1000 * 60 * 5  // 5 minutes (in milliseconds)
  }
)
```

### Common Durations
```js
staleTime: 1000 * 30           // 30 seconds
staleTime: 1000 * 60           // 1 minute
staleTime: 1000 * 60 * 5       // 5 minutes
staleTime: 1000 * 60 * 30      // 30 minutes
staleTime: 1000 * 60 * 60      // 1 hour
staleTime: 1000 * 60 * 60 * 24 // 24 hours
```

## Nitro Route Rules (Server-Side Caching)

Your [nuxt.config.ts](nuxt.config.ts) also has server-side SWR caching:

```js
routeRules: {
  '/': { ssr: true, swr: 60 },  // Server caches for 60 seconds
  '/fudbal': { ssr: true, swr: 60 },
  // ... etc
}
```

This works **in addition to** the client-side caching:
- **Server cache (SWR)**: Caches full HTML page at CDN/server level
- **Client cache (useAsyncData)**: Caches data during client-side navigation

## Debugging Cache Behavior

### Check if Data is Cached
```js
const { data, pending, refresh } = await useAsyncData(
  'test',
  () => {
    console.log('🔥 API CALL FIRED') // This logs only on fresh fetch
    return fetchFromApi('/endpoint')
  },
  { staleTime: 1000 * 60 }
)
```

### Monitor Cache in DevTools
1. Open Vue DevTools
2. Go to "Performance" tab
3. Watch for API calls - cached data won't trigger network requests

## Migration Guide for Other Pages

To add caching to any page using `useAsyncData`, simply add the `staleTime` option:

### Before
```js
const { data } = await useAsyncData('my-key', () => fetchFromApi('/endpoint'))
```

### After
```js
const { data } = await useAsyncData(
  'my-key',
  () => fetchFromApi('/endpoint'),
  {
    staleTime: 1000 * 60 // 60 seconds
  }
)
```

## Testing the Implementation

### 1. Test Homepage Caching
```bash
# Start the dev server
npm run dev

# Visit homepage, then navigate away and back
# Second visit should be instant (cached)
```

### 2. Test Article Caching
```bash
# Visit an article page
# Navigate to another article
# Return to first article
# Should load instantly (24 hour cache)
```

### 3. Test Cache Expiration
```bash
# Visit homepage
# Wait 61 seconds
# Navigate away and back
# Data should refetch automatically
```

## Troubleshooting

### Cache not working?

**Check these:**
1. Is `asyncDataCache: true` in `nuxt.config.ts`?
2. Is `staleTime` option present in `useAsyncData`?
3. Are you using unique cache keys for different data?

### Stale data showing?

**Solutions:**
```js
// Force refresh on mount
onMounted(() => {
  refresh()
})

// Or reduce staleTime duration
{ staleTime: 1000 * 30 }  // 30 seconds instead of 60
```

### Want to disable caching for a specific call?

```js
await useAsyncData(
  'my-key',
  () => fetchFromApi('/endpoint'),
  {
    staleTime: 0  // No caching
  }
)
```

## Future Enhancements

Consider implementing:

1. **Category Page Caching** - Add caching to `/fudbal.vue`, `/kosarka.vue`, etc.
2. **Tag Page Caching** - Add caching to `/tag/[tagName].vue`
3. **User-Specific Cache Keys** - For authenticated users, include user ID in cache keys
4. **Cache Warming** - Prefetch common pages on app init
5. **Cache Invalidation Events** - Clear cache when new articles are published (webhook)

## Resources

- [Nuxt useAsyncData docs](https://nuxt.com/docs/api/composables/use-async-data)
- [Nuxt Data Fetching guide](https://nuxt.com/docs/getting-started/data-fetching)
- [Nitro Route Rules](https://nitro.unjs.io/guide/routing#route-rules)

---

**Implementation Date**: 2025-10-16
**Nuxt Version**: 4.x
**Status**: ✅ Fully Implemented
