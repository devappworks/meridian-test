# How to Test if Caching is Working

## Method 1: Browser Network Tab (EASIEST - RECOMMENDED)

This is the **simplest and most visual** way to see caching in action.

### Steps:

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and press `F12` to open DevTools

3. **Go to the Network tab**

4. **Visit the homepage** (`http://localhost:3000`)
   - You'll see API calls to `getHomepageFeaturedArticles`, `getArticles`, etc.
   - Note the number of requests

5. **Navigate to another page** (e.g., click on an article)

6. **Click the browser BACK button** to return to homepage
   - **If caching works**: You'll see NO new API calls to those endpoints
   - **If caching doesn't work**: You'll see the same API calls again

### What to Look For:

**First Visit (Fresh Data):**
```
GET /getHomepageFeaturedArticles   200   1.2s
GET /getArticles                   200   980ms
GET /getArticles?category[]=28     200   750ms
GET /getArticles?category[]=25     200   820ms
```

**Second Visit Within 60 Seconds (CACHED):**
```
(No network requests - data served from cache!)
```

**After 60+ Seconds (Cache Expired):**
```
GET /getHomepageFeaturedArticles   200   1.1s  (Fresh fetch)
```

---

## Method 2: Add Console Logs (VISUAL CONFIRMATION)

Add logging to see exactly when API calls happen.

### Edit: `app/pages/index.vue`

```js
// SSR Data Fetching with Smart Caching Pattern
const { data: featuredData, pending: featuredPending } = await useAsyncData('homepage-featured', async () => {
  console.log('🔥 FETCHING FEATURED ARTICLES FROM API') // <- Add this
  const data = await fetchFromApi('/getHomepageFeaturedArticles');
  console.log('✅ Featured articles loaded:', data.result?.articles?.length) // <- Add this
  return data;
}, {
  staleTime: 1000 * 60 // Cache for 60 seconds
});

const { data: latestArticlesData, pending: latestPending } = await useAsyncData('homepage-latest', async () => {
  console.log('🔥 FETCHING LATEST ARTICLES FROM API') // <- Add this
  const data = await fetchFromApi('/getArticles');
  console.log('✅ Latest articles loaded:', data.result?.articles?.length) // <- Add this
  return data;
}, {
  staleTime: 1000 * 60 // Cache for 60 seconds
});
```

### Test:

1. Open browser console (`F12` → Console tab)
2. Visit homepage
3. You'll see:
   ```
   🔥 FETCHING FEATURED ARTICLES FROM API
   ✅ Featured articles loaded: 8
   🔥 FETCHING LATEST ARTICLES FROM API
   ✅ Latest articles loaded: 40
   ```
4. Navigate away and back
5. **If cached**: You'll see NO new console logs
6. **If not cached**: You'll see the logs again

---

## Method 3: Vue DevTools (ADVANCED)

### Install Vue DevTools:
- [Chrome Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Steps:

1. Open Vue DevTools (in browser DevTools)
2. Go to **"Timeline"** tab
3. Visit homepage
4. You'll see `useAsyncData` events
5. Navigate away and back
6. **If cached**: No new `useAsyncData` events
7. **If not cached**: New events appear

---

## Quick Test Script

Run this in your browser console to test cache behavior:

```js
// Test cache by navigating multiple times
async function testCache() {
  console.clear();
  console.log('🧪 Testing cache behavior...\n');

  // Navigate to homepage
  console.log('1️⃣ First visit - should fetch from API');
  window.location.href = '/';

  setTimeout(() => {
    console.log('\n2️⃣ Navigate to article page');
    document.querySelector('a[href*="/fudbal/"]')?.click();

    setTimeout(() => {
      console.log('\n3️⃣ Navigate back - should use cache (no API calls)');
      window.history.back();

      setTimeout(() => {
        console.log('\n✅ Check Network tab - you should see NO API calls on step 3');
      }, 1000);
    }, 2000);
  }, 3000);
}

// Run the test
testCache();
```

---

## Expected Behavior

### Scenario 1: First Visit
- **Network Tab**: See all API calls
- **Console**: All fetch logs appear
- **Speed**: Normal loading time

### Scenario 2: Return Within 60 Seconds
- **Network Tab**: ✅ **NO API CALLS** (this proves caching works!)
- **Console**: ✅ **NO fetch logs**
- **Speed**: ⚡ **INSTANT** page load

### Scenario 3: Return After 60+ Seconds
- **Network Tab**: See API calls again (cache expired)
- **Console**: Fetch logs appear again
- **Speed**: Normal loading time (fresh data)

---

## Troubleshooting

### "I still see API calls on second visit"

**Possible reasons:**

1. **Cache expired** - Wait less than 60 seconds between visits
2. **Hard refresh** - Don't press `Ctrl+Shift+R` or `Cmd+Shift+R` (this bypasses cache)
3. **Different URL** - Make sure you're visiting the exact same URL
4. **DevTools "Disable cache" enabled** - Uncheck it in Network tab

### "How do I test cache expiration?"

```js
// Change staleTime to 10 seconds for testing
const { data } = await useAsyncData('test', fetchData, {
  staleTime: 1000 * 10  // 10 seconds instead of 60
});
```

Then:
1. Visit page
2. Wait 11 seconds
3. Navigate away and back
4. You should see fresh API calls

### "I want to force refresh the cache"

**Option 1: Manual refresh button**
```vue
<script setup>
const { data, refresh } = await useAsyncData('homepage', fetchData, {
  staleTime: 1000 * 60
});
</script>

<template>
  <button @click="refresh()">Force Refresh</button>
</template>
```

**Option 2: Refresh from console**
```js
// In browser console
await refreshNuxtData('homepage-featured');  // Refresh specific cache
await refreshNuxtData();                      // Refresh all caches
```

**Option 3: Hard refresh**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## Real-World Test Scenario

### Test Homepage Caching:

1. **Start server**: `npm run dev`
2. **Open Network tab** in DevTools
3. **Visit**: `http://localhost:3000`
4. **Count API calls**: You should see ~5-6 requests
5. **Click any article** to navigate away
6. **Press browser BACK button**
7. **Check Network tab**: Should show 0 new API requests! 🎉

### Test Article Page Caching:

1. **Visit any article page**
2. **Note the API call** (e.g., `/api/articles/123`)
3. **Navigate to another article**
4. **Use browser BACK button**
5. **Check Network tab**: Should show 0 new API requests for 24 hours! 🎉

---

## Performance Comparison

### Without Caching:
```
Homepage Load Time: 1.5s - 2.5s
API Calls: 5-6 per visit
Total Data Transfer: ~500KB per visit
```

### With Caching (second visit within 60s):
```
Homepage Load Time: 0.1s - 0.3s ⚡ (5-10x faster!)
API Calls: 0 🎯
Total Data Transfer: ~0KB (all from cache!)
```

---

## Monitoring in Production

Add this to track cache hit rate:

```js
// composables/useCacheMonitor.js
export function useCacheMonitor() {
  const cacheHits = ref(0);
  const cacheMisses = ref(0);

  const trackCacheHit = () => cacheHits.value++;
  const trackCacheMiss = () => cacheMisses.value++;

  const hitRate = computed(() => {
    const total = cacheHits.value + cacheMisses.value;
    return total > 0 ? (cacheHits.value / total * 100).toFixed(1) : 0;
  });

  return {
    cacheHits,
    cacheMisses,
    hitRate,
    trackCacheHit,
    trackCacheMiss
  };
}
```

---

## Summary

**Easiest way**: Open Network tab, navigate around, see if API calls disappear on second visit!

If you see **fewer/no API calls** on repeat visits = **✅ Caching is working!**
