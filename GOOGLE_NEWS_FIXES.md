# Google News/Discovery SEO Fixes - Implementation Summary

## ✅ Fixed Issues

All Google News/Discovery meta tags and structured data issues have been resolved in the codebase.

### 1. ✅ Missing Meta Tags - **FIXED**

Added the following critical meta tags to `/app/pages/[category]/[slug].vue`:

#### Added:
- **`news_keywords`** - Extracted from article tags (max 10 keywords, comma-separated)
- **`article:modified_time`** - ISO 8601 format date from `update_date` or `updated_at` field
- **`article:author`** - Author name from article data
- **`article:section`** - Category name for better article categorization
- **`og:image:width`** - Image width dimension (1200px)
- **`og:image:height`** - Image height dimension (630px)

### 2. ✅ Date Format Improvements - **FIXED**

- All date meta tags now use **ISO 8601 format** (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- `article:published_time` uses `publishedTimeISO` (converted from `publish_date`)
- `article:modified_time` uses `modifiedTimeISO` (from `update_date` or `updated_at`)
- Proper fallback chain: `update_date` → `updated_at` → `publish_date` → `date`

### 3. ✅ NewsArticle Schema Enhancements - **FIXED**

Enhanced structured data in both:
- `/app/pages/[category]/[slug].vue`
- `/app/composables/useNewsArticleSchema.js`

#### Changes:
```javascript
// Before:
image: imageUrl ? [imageUrl] : undefined

// After:
image: {
  "@type": "ImageObject",
  url: imageUrl,
  width: 1200,
  height: 630
}
```

- Changed `author` type from `Organization` to `Person` (correct for Google News)
- Added proper `dateModified` with fallback to `datePublished`
- Image is now a proper `ImageObject` with dimensions instead of array

### 4. ✅ Code Quality

- Added inline comments explaining each meta tag section
- Proper error handling for date parsing
- Organized meta tags by category (Google News, Open Graph, Article, Twitter)

---

## 📋 Complete Meta Tags Now Implemented

Your articles now have the following complete meta tag structure:

```html
<!-- Basic SEO -->
<meta name="description" content="Article description">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="news_keywords" content="tag1, tag2, tag3">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:site_name" content="Meridian Sport">
<meta property="og:title" content="Article Title">
<meta property="og:description" content="Article description">
<meta property="og:url" content="https://meridiansport.rs/category/slug/">
<meta property="og:image" content="image-url">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Article Title">

<!-- Article Meta Tags -->
<meta property="article:published_time" content="2025-01-01T12:00:00.000Z">
<meta property="article:modified_time" content="2025-01-02T14:30:00.000Z">
<meta property="article:author" content="Author Name">
<meta property="article:section" content="Fudbal">
<meta property="article:tag" content="tag1">
<meta property="article:tag" content="tag2">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Article Title">
<meta name="twitter:description" content="Article description">
<meta name="twitter:image" content="image-url">
<meta name="twitter:image:alt" content="Article Title">
```

---

## 📊 Complete NewsArticle Schema

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Article Title",
  "description": "Article description",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://meridiansport.rs/category/slug/"
  },
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/image.jpg",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Meridian Sport",
    "logo": {
      "@type": "ImageObject",
      "url": "https://meridiansport.rs/favicon.ico"
    }
  },
  "datePublished": "2025-01-01T12:00:00.000Z",
  "dateModified": "2025-01-02T14:30:00.000Z"
}
```

---

## ⚠️ Production Deployment Required

### Critical Issue: `/api/articles/resolve` Returns 404 on Production

The code is **correct** and the endpoint exists at:
```
/server/api/articles/resolve.get.js
```

However, it returns 404 on production. This causes SSR to fail and renders generic metadata.

### Possible Causes:
1. **Outdated deployment** - Production doesn't have the latest code
2. **Build configuration issue** - Server API routes not being deployed
3. **Missing files in build** - `/server` directory not included in production build

### Action Required:
1. ✅ Verify latest commit is deployed to production
2. ✅ Check that `/server/api/articles/resolve.get.js` exists in production build
3. ✅ Review deployment logs for any build errors
4. ✅ Test endpoint after deployment:
   ```bash
   curl https://meridiansport.rs/api/articles/resolve?category=fudbal&slug=test-slug
   # Should return article JSON, not 404
   ```

---

## 🧪 Testing After Deployment

### 1. Test with Google Rich Results Test
```
https://search.google.com/test/rich-results
```
Enter your article URL and verify:
- ✅ NewsArticle structured data is valid
- ✅ All required fields are present (headline, image, datePublished, dateModified)
- ✅ No errors or warnings

### 2. Test with Facebook Debugger
```
https://developers.facebook.com/tools/debug/
```
Verify:
- ✅ Correct title, description, and image
- ✅ `og:type` is "article"
- ✅ `article:published_time` and `article:modified_time` are present

### 3. Test with Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```
Verify:
- ✅ `summary_large_image` card type
- ✅ Image displays correctly
- ✅ Title and description are correct

### 4. Manual HTML Inspection
View page source of a live article and verify:
```bash
curl -s https://meridiansport.rs/fudbal/some-article/ | grep -A 5 "NewsArticle"
curl -s https://meridiansport.rs/fudbal/some-article/ | grep "article:modified_time"
curl -s https://meridiansport.rs/fudbal/some-article/ | grep "news_keywords"
```

---

## 📝 Notes on Image Dimensions

Currently using standard dimensions:
- **Width:** 1200px
- **Height:** 630px (16:9 aspect ratio recommended by Open Graph)

### If Your Images Have Different Dimensions:

The backend API should return image dimensions. If available, update the code to use actual dimensions:

```javascript
// In /app/pages/[category]/[slug].vue
const imageWidth = a?.feat_images?.['extra-large']?.width || 1200;
const imageHeight = a?.feat_images?.['extra-large']?.height || 630;

const imageObject = imageUrl ? {
  "@type": "ImageObject",
  url: imageUrl,
  width: imageWidth,
  height: imageHeight
} : undefined;
```

---

## 🎯 Expected Results After Fix

Once deployed, your articles will:

✅ **Google News/Discovery:**
- Proper article titles (not "Meridian Sport")
- Full descriptions
- Correct publish/modified dates
- Valid NewsArticle schema
- Proper keyword targeting

✅ **Social Media:**
- Rich preview cards with images
- Correct metadata on Facebook, Twitter, LinkedIn
- Proper attribution

✅ **SEO:**
- Better crawling and indexing
- Improved click-through rates
- Enhanced visibility in Google News

---

## 🔍 Files Modified

1. `/app/pages/[category]/[slug].vue` - Added missing meta tags and enhanced schema
2. `/app/composables/useNewsArticleSchema.js` - Updated schema with proper ImageObject

---

## ✅ Checklist for Production

- [ ] Deploy latest code to production
- [ ] Verify `/api/articles/resolve` endpoint works (returns 200, not 404)
- [ ] Test with Google Rich Results Test
- [ ] Test with Facebook Debugger
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor Google Search Console for indexing improvements
- [ ] Check Google News Publisher Center (if enrolled)

---

## 📚 References

- [Google News Technical Requirements](https://developers.google.com/search/docs/crawling-indexing/news-sitemap)
- [NewsArticle Schema](https://schema.org/NewsArticle)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**Last Updated:** October 7, 2025
**Status:** ✅ All code fixes implemented - awaiting production deployment

