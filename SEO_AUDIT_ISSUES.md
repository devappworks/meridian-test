# SEO Optimization Audit - Potential Issues

## 🔍 Issues Found & Recommendations

---

## ❌ CRITICAL Issues (Fix Immediately)

### 1. **Missing Sitemap**
**Status:** ❌ NOT FOUND
**Impact:** HIGH - Search engines can't discover all pages efficiently

**Current State:**
- robots.txt references: `https://meridiansport.rs/sitemap.xml`
- But sitemap.xml doesn't exist in the project

**Solution:**
Install `@nuxtjs/sitemap` module:
```bash
npm install @nuxtjs/sitemap
```

Add to nuxt.config.ts:
```typescript
modules: ['@nuxtjs/sitemap'],
sitemap: {
  hostname: 'https://meridiansport.rs',
  gzip: true,
  routes: async () => {
    // Dynamically fetch article URLs from API
    const articles = await $fetch('/api/articles/all')
    return articles.map(article => ({
      url: `/${article.category}/${article.slug}/`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: article.updated_at
    }))
  }
}
```

### 2. **Excessive Console.log Statements**
**Status:** ❌ 158 occurrences across 33 files
**Impact:** MEDIUM - Increases HTML size, slows down execution

**Files with most console logs:**
- `app/views/ArticlePage.vue` - 38 occurrences
- `app/services/api.js` - 17 occurrences
- `app/views/CategoryPage.vue` - 14 occurrences

**Solution:**
Remove all console.log statements in production:

Add to `nuxt.config.ts`:
```typescript
vite: {
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
}
```

Or use a plugin to strip them at build time.

### 3. **Missing OG Image**
**Status:** ❌ NOT UPLOADED
**Impact:** HIGH - Poor social media sharing appearance

**Current State:**
- Homepage: No OG image defined (line 35: `const imageUrl = undefined`)
- Categories: Reference `/images/default-category-og.jpg` but file doesn't exist

**Solution:**
1. Create and upload homepage OG image: `/public/images/homepage-og.jpg`
2. Create and upload category OG image: `/public/images/default-category-og.jpg`
3. Update homepage to use OG image:
```javascript
const imageUrl = `${siteUrl}/images/homepage-og.jpg`
```

---

## ⚠️ HIGH Priority Issues

### 4. **Duplicate Structured Data Keys**
**Status:** ⚠️ NEEDS REVIEW
**Impact:** MEDIUM - May cause validation errors

**Found in:** `app/pages/index.vue`
- Lines 86-96: Two separate LD+JSON scripts with keys "ldjson-website-1" and "ldjson-website-2"
- Both define Organization and WebSite schemas

**Recommendation:**
Combine into single schema or ensure they serve different purposes.

### 5. **Mixed URL Formats**
**Status:** ⚠️ INCONSISTENT
**Impact:** MEDIUM - Canonicalization issues

**Examples:**
- Homepage canonical: `https://meridiansport.rs/` (trailing slash)
- Some internal links: Without trailing slash
- API returns: Mixed formats

**Solution:**
Ensure ALL internal links use trailing slashes:
```vue
<NuxtLink to="/fudbal/">Fudbal</NuxtLink>  ✅
<NuxtLink to="/fudbal">Fudbal</NuxtLink>   ❌
```

### 6. **No Lazy Loading for Images**
**Status:** ⚠️ NOT IMPLEMENTED
**Impact:** MEDIUM - Slower LCP and page load

**Current State:**
- All images load immediately
- No `loading="lazy"` attribute
- No intersection observer

**Solution:**
Use `@nuxt/image` module:
```vue
<NuxtImg
  src="/path/to/image.jpg"
  loading="lazy"
  sizes="sm:100vw md:50vw lg:400px"
/>
```

### 7. **No Alt Text Validation**
**Status:** ⚠️ NEEDS AUDIT
**Impact:** MEDIUM - Accessibility and SEO

**Recommendation:**
Audit all `<img>` tags to ensure descriptive alt text:
```vue
<!-- Bad -->
<img :src="article.image" alt="image">

<!-- Good -->
<img :src="article.image" :alt="`${article.title} - Meridian Sport`">
```

---

## 📊 MEDIUM Priority Issues

### 8. **Missing Breadcrumbs on Article Pages**
**Status:** ⚠️ PARTIAL
**Impact:** MEDIUM - User experience and SEO

**Current State:**
- BreadcrumbList schema exists in structured data
- No visible breadcrumb UI component

**Recommendation:**
Add visual breadcrumbs on article pages:
```vue
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/fudbal/">Fudbal</a></li>
    <li aria-current="page">Article Title</li>
  </ol>
</nav>
```

### 9. **No Schema Validation**
**Status:** ⚠️ NOT TESTED
**Impact:** MEDIUM - Potential structured data errors

**Recommendation:**
Test all pages with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

**Known Issues to Check:**
- CollectionPage schema completeness
- Article schema with all required fields
- Organization schema

### 10. **Slow API Response Times**
**Status:** ⚠️ NEEDS MONITORING
**Impact:** HIGH - Affects TTFB and loading speed

**Current State:**
- Multiple API calls on homepage (6 parallel requests)
- No visible caching on API side
- No request deduplication

**Solution:**
- Enable API response caching
- Use request deduplication
- Consider GraphQL to reduce requests

### 11. **Missing hreflang Tags**
**Status:** ❌ NOT IMPLEMENTED
**Impact:** LOW (if single language)

**If multi-language site is planned:**
```html
<link rel="alternate" hreflang="sr" href="https://meridiansport.rs/fudbal/">
<link rel="alternate" hreflang="en" href="https://meridiansport.rs/en/football/">
```

### 12. **No Pagination Meta Tags**
**Status:** ⚠️ NEEDS CHECK
**Impact:** MEDIUM - If paginated pages exist

**For paginated category pages:**
```html
<link rel="next" href="https://meridiansport.rs/fudbal/?page=2">
<link rel="prev" href="https://meridiansport.rs/fudbal/?page=1">
```

---

## 📉 LOW Priority Issues

### 13. **Missing Author Schema**
**Status:** ⚠️ INCOMPLETE
**Impact:** LOW - Enhanced rich snippets

**Current State:**
- Article pages have author in NewsArticle schema
- No separate Person/Author schema

**Enhancement:**
```json
{
  "@type": "Person",
  "@id": "https://meridiansport.rs/author/john-doe",
  "name": "John Doe",
  "url": "https://meridiansport.rs/author/john-doe"
}
```

### 14. **No Video Schema**
**Status:** ⚠️ MISSING (if videos present)
**Impact:** LOW - Missed rich snippet opportunity

**If YouTube videos are embedded:**
```json
{
  "@type": "VideoObject",
  "name": "Video Title",
  "description": "Video Description",
  "thumbnailUrl": "https://...",
  "uploadDate": "2024-01-01",
  "contentUrl": "https://youtube.com/..."
}
```

### 15. **No FAQ Schema**
**Status:** ❌ NOT IMPLEMENTED
**Impact:** LOW - Potential for FAQ rich snippets

**If FAQ sections exist, add:**
```json
{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Kako...",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "..."
    }
  }]
}
```

### 16. **Missing Last-Modified Header**
**Status:** ⚠️ NOT IMPLEMENTED
**Impact:** LOW - Caching efficiency

**Add to server middleware:**
```javascript
event.node.res.setHeader('Last-Modified', article.updated_at)
```

---

## 🎯 Technical SEO Issues

### 17. **No RSS Feed**
**Status:** ❌ NOT IMPLEMENTED
**Impact:** LOW - Alternative content discovery

**Solution:**
Create RSS feed at `/feed.xml` or `/rss.xml`

### 18. **Missing JSON-LD for SiteNavigationElement**
**Status:** ❌ NOT IMPLEMENTED
**Impact:** LOW - Enhanced site links in SERPs

**Add to homepage:**
```json
{
  "@type": "SiteNavigationElement",
  "name": "Fudbal",
  "url": "https://meridiansport.rs/fudbal/"
}
```

### 19. **No Mobile-Specific Optimizations**
**Status:** ⚠️ NEEDS CHECK
**Impact:** MEDIUM - Mobile-first indexing

**Check:**
- [ ] Responsive images with srcset
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] No horizontal scrolling
- [ ] Readable font sizes (min 16px)

### 20. **Missing Preload for Hero Images**
**Status:** ⚠️ NOT IMPLEMENTED
**Impact:** MEDIUM - Slower LCP

**Solution:**
Preload above-the-fold images:
```vue
useHead({
  link: [
    { rel: 'preload', as: 'image', href: featuredArticle.image }
  ]
})
```

---

## 🔒 Additional Security & Privacy Issues

### 21. **No Content Security Policy (CSP)**
**Status:** ❌ NOT IMPLEMENTED
**Impact:** LOW - Security risk

**Add to security headers middleware:**
```javascript
headers.setHeader('Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' https:; ..."
)
```

### 22. **No Cookie Consent Banner**
**Status:** ⚠️ NEEDS CHECK
**Impact:** HIGH - GDPR compliance

**If collecting analytics:**
- Implement cookie consent banner
- Block GA until consent given
- Provide privacy policy page

---

## 📝 Content Issues

### 23. **Thin Content Pages**
**Status:** ⚠️ NEEDS AUDIT
**Impact:** MEDIUM - May affect rankings

**Check for:**
- Pages with <300 words
- Duplicate content across categories
- Empty or placeholder pages

### 24. **Missing Internal Linking**
**Status:** ⚠️ PARTIAL
**Impact:** MEDIUM - Link equity distribution

**Recommendations:**
- Add "Related Articles" section (✅ Already present)
- Link to category pages from articles
- Add contextual links within article content

---

## 🚀 Action Plan Priority

### Immediate (This Week):
1. ✅ ~~Create and upload OG images~~ → **ACTION REQUIRED**
2. ✅ ~~Install and configure sitemap module~~ → **ACTION REQUIRED**
3. Remove console.log statements
4. Add lazy loading to images
5. Validate all alt text

### Short Term (This Month):
6. Add visual breadcrumbs
7. Optimize API response times
8. Test structured data with validators
9. Implement image preloading for hero images
10. Add mobile optimization checks

### Long Term (Next Quarter):
11. Consider RSS feed
12. Add FAQ schema if applicable
13. Implement video schema if videos present
14. Add cookie consent banner
15. Content audit for thin pages

---

## 🧪 Testing Checklist

### Before Launch:
- [ ] Run Google PageSpeed Insights (Mobile & Desktop)
- [ ] Test with Google Rich Results Test
- [ ] Validate structured data with Schema.org
- [ ] Check mobile-friendliness with Google's tool
- [ ] Test all meta tags with Facebook Debugger
- [ ] Verify Twitter Cards
- [ ] Test site in Google Search Console
- [ ] Check Core Web Vitals
- [ ] Verify canonical tags on all pages
- [ ] Test 404 error pages
- [ ] Check robots.txt accessibility
- [ ] Verify sitemap.xml loads and validates
- [ ] Test internal search (if implemented)
- [ ] Check for broken links
- [ ] Verify HTTPS redirect works

---

## 📊 SEO Metrics to Monitor

### Weekly:
- Google Search Console impressions/clicks
- Core Web Vitals (LCP, FID, CLS)
- Page speed scores
- Mobile usability errors

### Monthly:
- Organic traffic trends
- Keyword rankings
- Backlink profile
- Structured data errors
- Crawl errors
- Index coverage

---

## 📚 Resources

### Tools:
- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/)
- [Ahrefs](https://ahrefs.com/)
- [SEMrush](https://www.semrush.com/)

### Documentation:
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Nuxt SEO](https://nuxt.com/docs/getting-started/seo-meta)
- [Web.dev Performance](https://web.dev/performance/)

---

## ✅ Summary

**Critical Issues to Fix:** 3
**High Priority Issues:** 4
**Medium Priority Issues:** 8
**Low Priority Issues:** 5

**Estimated Implementation Time:** 2-3 weeks for critical + high priority issues

**Expected SEO Impact After Fixes:**
- 📈 +20-30% organic traffic (3-6 months)
- 🚀 Improved Core Web Vitals scores
- 📊 Better SERP appearance (rich snippets)
- 📱 Enhanced mobile user experience
- 🔍 Better crawlability and indexation
