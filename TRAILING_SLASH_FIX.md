# Trailing Slash Fix - Client-Side Navigation

## Problem
When clicking on article links from components (NewsCard, SearchModal, etc.), the URLs were being constructed **without trailing slashes**:
- Click: `http://localhost:3000/fudbal/article-slug` ❌
- Refresh: `http://localhost:3000/fudbal/article-slug/` ✅

This inconsistency happened because:
1. Server-side rendering and middleware add trailing slashes
2. Client-side navigation (`router.push()`) bypassed the middleware
3. Some components were constructing URLs without trailing slashes

## Root Cause
The application has a **trailing slash policy** enforced by server middleware (`00.url-normalization.js`), but client-side navigation was inconsistent.

### Components with missing trailing slashes:
1. **SearchModal.vue** (line 203):
   ```javascript
   const target = `/${canonicalCategory}/${found.slug}`; // ❌ Missing trailing slash
   ```

2. **NewsGrid.vue** (line 219):
   ```javascript
   this.$router.push(`/article/${id}`); // ❌ Old format + no trailing slash
   ```

## Solution

### 1. Fixed SearchModal.vue
**Before:**
```javascript
const target = `/${canonicalCategory}/${found.slug}`;
this.$router.push(target)
```

**After:**
```javascript
const target = `/${canonicalCategory}/${found.slug}/`; // Add trailing slash for consistency
this.$router.push(target)
```

### 2. Fixed NewsGrid.vue - handlePageChange
Updated to use category/slug format with trailing slash instead of old article/id format:

**Before:**
```javascript
if (page === "article" && id) {
  this.$router.push(`/article/${id}`);
}
```

**After:**
```javascript
if (page === "article" && id) {
  const article = this.news.find(item => item && item.id === id);
  if (article && article.category && article.slug) {
    const { getCanonicalCategoryFromSlug } = require('~/utils/canonicalCategory');
    const canonicalCategory = getCanonicalCategoryFromSlug(article.category);
    this.$router.push(`/${canonicalCategory}/${article.slug}/`);
  }
}
```

### 3. Enhanced NewsGrid.vue - handleArticleClick
Added canonical category conversion for consistency:

**Before:**
```javascript
this.$router.push(`/${article.category}/${article.slug}/`);
```

**After:**
```javascript
const { getCanonicalCategoryFromSlug } = require('~/utils/canonicalCategory');
const canonicalCategory = getCanonicalCategoryFromSlug(article.category);
this.$router.push(`/${canonicalCategory}/${article.slug}/`);
```

## Verified Components (Already Correct)
These components were already using trailing slashes correctly:

✅ **NewsCard.vue** (line 91):
```javascript
const target = `/${canonicalCategory}/${this.slug}/`;
```

✅ **NewsSlider.vue** (line 295):
```javascript
const target = `/${categorySlug}/${item.slug}/`;
```

✅ **Featured.vue** (line 97):
```javascript
const target = `/${this.article.category}/${this.article.slug}/`;
```

✅ **Sidebar.vue** (line 71):
```javascript
const target = `/${item.category}/${item.slug}/`;
```

✅ **NewsGrid.vue** and **NewsSlider.vue** categoryRoute computed properties:
```javascript
categoryRoute() {
  const routeMap = {
    FUDBAL: "/fudbal/",      // ✅ All have trailing slashes
    KOŠARKA: "/kosarka/",
    TENIS: "/tenis/",
    // ... etc
  };
}
```

## Benefits
1. ✅ Consistent URLs across all navigation methods
2. ✅ No redirect needed after client-side navigation
3. ✅ Better SEO (canonical URLs consistent)
4. ✅ Faster page loads (no redirect delay)
5. ✅ Cleaner browser history
6. ✅ Canonical category used for all article links

## Testing
Test client-side navigation from:
1. **Search results** - Click articles from search modal
2. **News grids** - Click articles from any news grid
3. **News cards** - Click individual news cards
4. **Sidebars** - Click articles from sidebar
5. **Featured sections** - Click featured articles
6. **Sliders** - Click articles from news sliders

Expected behavior:
- All URLs should have trailing slashes immediately ✅
- No redirect after clicking ✅
- Browser URL bar shows correct format from the start ✅
- Refreshing the page keeps the same URL ✅

## Files Modified
1. `app/components/SearchModal.vue` - Added trailing slash to article navigation
2. `app/components/NewsGrid.vue` - Fixed both `handlePageChange` and `handleArticleClick` to use canonical categories and trailing slashes

## Related Middleware
- `server/middleware/00.url-normalization.js` - Server-side trailing slash enforcement (already working)
- This fix ensures **client-side navigation matches server-side URL format**

