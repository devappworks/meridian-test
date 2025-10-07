# Debug Logs Guide

## Overview
I've added comprehensive debug logging throughout the article loading flow to help diagnose the issue with articles not loading. The logs use different colored emoji markers to identify which component/layer is logging.

## Log Markers

- 🔵 **Blue** = Server API (`/api/articles/resolve.get.js`)
- 🟢 **Green** = Page Component (`pages/[category]/[slug].vue`)
- 🟡 **Yellow** = View Component (`views/ArticlePage.vue`)
- 🔴 **Red** = Error Page (`error.vue`)

## Expected Flow for Successful Article Load

When you access a URL like `/fudbal/article-slug/`, you should see this sequence in the **server console** (terminal where you ran `npm run dev`):

```
🔵 ============ RESOLVE API START ============
🔵 Articles resolve API called: { category: 'fudbal', slug: 'article-slug', ... }
🔵 Config loaded: { backendUrl: '...', hasApiKey: true }
🔵 Articles resolve API: Will try categories: ['fudbal', 'domaci-fudbal', 'reprezentacije', 'evropska-takmicenja']

🔵 [Attempt 1/4] Trying category: fudbal
🔵 API URL: https://meridian.mpanel.app/api/webV3/getArticlesBySlug/fudbal/article-slug
🔵 [Attempt 1] Response received in XXXms
🔵 [Attempt 1] Response structure: { hasResponse: true, hasArticle: true, articleId: 123, ... }
✅ [Attempt 1] SUCCESS! Article found under category: fudbal
✅ Article details: { id: 123, title: '...', hasCategories: true, ... }

✅ Articles resolve API: Returning article
✅ Final article data: { articleId: 123, title: '...', correctCategory: 'fudbal', ... }
🔵 ============ RESOLVE API END (SUCCESS) ============
```

And in the **browser console** (F12 Developer Tools):

```
🟢 ============ PAGE COMPONENT START ============
🟢 [category]/[slug].vue loading: { category: 'fudbal', slug: 'article-slug', ... }
🟢 useAsyncData executing for: { category: 'fudbal', slug: 'article-slug' }
🟢 useAsyncData received result: { hasResult: true, hasId: true, ... }
🟢 useAsyncData completed: { hasArticle: true, articleId: 123, ... }
🟢 ============ PAGE COMPONENT END ============

🟡 ============ ARTICLE PAGE COMPONENT START ============
🟡 ArticlePage props received: { hasArticle: true, articleId: 123, ... }
🟡 ArticlePage: Valid article data received from props
🟡 ============ ARTICLE PAGE MOUNTED ============
🟡 ArticlePage: Using article from SSR props - skipping fetch
🟡 Fetching related content...
🟡 Fetching comments...
🟡 ============ ARTICLE PAGE MOUNTED END ============
```

## What to Look For When Debugging

### 1. **Article Not Found (404)**
If the article doesn't exist in any category:

**Server Console:**
```
🔵 [Attempt 1/4] Trying category: fudbal
❌ [Attempt 1] Error fetching: { message: '404', ... }

🔵 [Attempt 2/4] Trying category: domaci-fudbal
❌ [Attempt 2] Error fetching: { message: '404', ... }

... (tries all categories)

❌ Articles resolve API: Article not found in any category
❌ Search summary: { categoriesTried: [...], triedCount: 4 }
🔵 ============ RESOLVE API END (NOT FOUND) ============
```

**Browser Console:**
```
🔴 ============ ERROR PAGE DISPLAYED ============
🔴 Error details: { statusCode: 404, ... }
```

### 2. **Backend API Timeout/Unavailable**
If the backend API is slow or down:

**Server Console:**
```
🔵 [Attempt 1/4] Trying category: fudbal
🔵 API URL: https://...
(Long pause - no response)
❌ [Attempt 1] Error fetching: { message: 'timeout', ... }
```

Look for:
- Long delays between "Trying category" and response
- Timeout errors
- Connection refused errors

### 3. **Article Prop Not Passed to Component**
If SSR succeeds but props aren't passed:

**Browser Console:**
```
🟡 ArticlePage props received: { hasArticle: false, ... }
🟡 ArticlePage: No article data provided, will fetch from API
🟡 ============ FETCHING ARTICLE (CLIENT-SIDE FALLBACK) ============
🟡 Calling backend API directly: /getArticlesBySlug/fudbal/article-slug
```

This indicates the article was fetched on the server but not properly passed to the component.

### 4. **Category Mismatch**
If article is stored under a different category:

**Server Console:**
```
🔵 [Attempt 1/4] Trying category: fudbal
❌ [Attempt 1] Error fetching: { statusCode: 404 }

🔵 [Attempt 2/4] Trying category: domaci-fudbal
✅ [Attempt 2] SUCCESS! Article found under category: domaci-fudbal
```

This is normal - the resolve API tries multiple categories until it finds the article.

### 5. **500 Server Error**
If there's a server-side error:

**Browser Console:**
```
🔴 ============ ERROR PAGE DISPLAYED ============
🔴 Error details: { statusCode: 500, statusMessage: 'Failed to resolve article', ... }
```

**Server Console:**
```
❌ Articles resolve API - FATAL ERROR: { statusCode: 500, message: '...', stack: '...' }
```

Look at the stack trace and error message for details.

## Testing URLs

Test these problematic URLs and capture the logs:
1. https://meridiansport.rs/fudbal/posle-163-vecitog-derbija-fss-kaznjavao-i-zvezdu-i-partizan/
2. https://meridiansport.rs/fudbal/aleksandar-stankovic-i-andrej-ilic-na-piksijevom-spisku/

## How to Capture Logs

### Server Console (Terminal)
1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Access the problematic URL
4. Copy all the logs from the terminal

### Browser Console
1. Open the problematic URL
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy all the logs

## Share the Logs

Send me:
1. **Full server console output** (from the terminal)
2. **Full browser console output** (from F12 Developer Tools)
3. **Which URL** you tested

This will help me identify exactly where the problem is occurring.

## Files Modified with Debug Logs

1. `server/api/articles/resolve.get.js` - API endpoint logs
2. `app/pages/[category]/[slug].vue` - Page component logs
3. `app/views/ArticlePage.vue` - View component logs
4. `app/error.vue` - Error page logs

