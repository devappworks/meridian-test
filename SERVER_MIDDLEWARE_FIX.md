# Server Middleware Fix - Article Routing Issue

## 🐛 Problem

The URL `/odbojka/grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska/` was:
- ✅ Working on **local** environment
- ❌ **Not working** on dev environment

## 🔍 Root Cause

The server middleware `server/middleware/canonical-redirect.js` was **completely disabled** with an early `return` statement:

```javascript
export default defineEventHandler(async (event) => {
  // TEMPORARILY DISABLED to fix 500 errors
  // This middleware was causing issues with article loading
  // TODO: Re-implement with better error handling
  return  // ← This caused the middleware to do nothing!
```

This middleware is responsible for:
1. Checking if an article is accessed via the correct category
2. Redirecting to the canonical category URL if needed

When disabled, articles might not load properly depending on the environment's routing configuration.

## ✅ What Was Fixed

### 1. **Re-enabled the Middleware**
Removed the early `return` statement and added proper error handling to prevent 500 errors.

### 2. **Added Robust Error Handling**
```javascript
// Added timeout and retry logic
const response = await $fetch(apiUrl, {
  headers: apiKey ? { 'Authorization': apiKey } : {},
  timeout: 5000,  // 5 second timeout
  retry: 1,       // Retry once on failure
  onResponseError({ response }) {
    console.warn(`[SERVER MW] API error: ${response.status}`)
  }
}).catch(err => {
  console.warn(`[SERVER MW] Failed to fetch:`, err.message)
  return null  // Don't block the page
})
```

### 3. **Improved Validation**
```javascript
// Check if backend URL is configured
if (!backendUrl) {
  console.warn(`[SERVER MW] No BACKEND_URL configured, skipping redirect`)
  return
}

// Validate response structure
if (!response || !response.article || !response.article.categories) {
  console.log(`[SERVER MW] Invalid response, skipping redirect`)
  return
}
```

### 4. **Better Logging**
Changed all log prefixes from `[SERVER MIDDLEWARE]` to `[SERVER MW]` for consistency and easier debugging.

## 🎯 How It Works Now

1. **Request comes in**: `/odbojka/article-slug/`
2. **Middleware checks**: Is this an article URL? (2-segment path)
3. **Fetches article data**: Calls backend API to get article categories
4. **Validates canonical category**: 
   - Checks if article belongs to `odbojka` (main category)
   - If yes, allows the request through
   - If no, redirects to correct category (e.g., `/fudbal/article-slug/`)
5. **Error handling**: If API fails, allows request through (doesn't block)

## 📊 Article Data

Your article exists in the backend with:
- **ID**: 122695
- **Title**: "Grbic bolji od Kovaca! Zakazan klasik u polufinalu Italija - Poljska"
- **Categories**: ["odbojka", "ostali-sportovi"]
- **Slug**: "grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska"

Since `odbojka` is a main category, the URL `/odbojka/grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska/` is correct and will load without redirects.

## 🧪 Testing

### 1. Restart Dev Server
```powershell
cd nuxt-app
npm run dev
```

### 2. Test the URL
Open in browser:
```
http://localhost:3000/odbojka/grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska/
```

### 3. Check Server Console
You should see logs like:
```
[SERVER MW] Processing request: GET /odbojka/grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska/
[SERVER MW] Checking category: odbojka
[SERVER MW] Fetching article data from: https://...
[SERVER MW] API response received: has data
[SERVER MW] Article categories: ["odbojka", "ostali-sportovi"]
[SERVER MW] Found main category: odbojka
[SERVER MW] Category is correct, no redirect needed
```

### 4. Test Category Redirect
Try accessing via wrong category:
```
http://localhost:3000/ostali-sportovi/grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska/
```

Should redirect to:
```
http://localhost:3000/odbojka/grbic-bolji-od-kovaca-zakazan-klasik-u-polufinalu-italija-poljska/
```

## 🚀 Deployment Notes

When deploying to production/dev environment:

1. **Ensure environment variables are set**:
   - `NUXT_PUBLIC_BACKEND_URL` - Backend API URL
   - `NUXT_PUBLIC_API_KEY` - API authentication key

2. **Build and deploy**:
   ```bash
   npm run build
   npm run start
   ```

3. **Monitor logs** for any middleware errors

## 🔧 Configuration

The middleware uses these main categories for priority:
```javascript
const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']
```

If an article belongs to multiple categories, it will redirect to the first main category found.

## ⚠️ Important Notes

1. **Timeout**: API calls have a 5-second timeout to prevent hanging
2. **Retry**: Failed requests are retried once automatically
3. **Error handling**: If the middleware fails, it **allows the request through** instead of blocking
4. **Trailing slashes**: The middleware preserves trailing slashes (handled by url-normalization middleware)

## 📝 Related Files

- `/server/middleware/canonical-redirect.js` - Main fix
- `/server/api/articles/resolve.get.js` - Article resolution endpoint
- `/app/pages/[category]/[slug].vue` - Article page component
- `/app/middleware/canonical-redirect.global.js` - Client-side middleware

---

**Fixed**: October 7, 2025
**Status**: ✅ Middleware re-enabled with proper error handling

