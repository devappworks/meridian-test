# SEO Category Pages Implementation

## ✅ Completed Implementation

All category pages now have proper SEO metadata including canonical tags, Open Graph, robots directives, and structured data.

---

## 📁 Files Modified/Created

### New Files:
1. **[app/composables/useCategorySEO.js](app/composables/useCategorySEO.js)**
   - Centralized SEO metadata composable for all category pages
   - Handles canonical URLs, Open Graph, structured data

2. **[public/images/README.md](public/images/README.md)**
   - Documentation for OG image requirements

### Updated Category Pages:
1. [app/pages/najnovije-vesti.vue](app/pages/najnovije-vesti.vue) ✅
2. [app/pages/fudbal.vue](app/pages/fudbal.vue) ✅
3. [app/pages/kosarka.vue](app/pages/kosarka.vue) ✅
4. [app/pages/tenis.vue](app/pages/tenis.vue) ✅
5. [app/pages/odbojka.vue](app/pages/odbojka.vue) ✅
6. [app/pages/ostali-sportovi.vue](app/pages/ostali-sportovi.vue) ✅

---

## 🎯 Implemented Features

### 1. ✅ Self-Referencing Canonical Tags
Each category page now includes:
```html
<link rel="canonical" href="https://meridiansport.rs/fudbal/" />
```

### 2. ✅ Open Graph Meta Tags
Complete OG implementation for social sharing:
```html
<meta property="og:type" content="website">
<meta property="og:title" content="Fudbal - Meridian Sport">
<meta property="og:description" content="Najnovije fudbalske vesti...">
<meta property="og:image" content="https://meridiansport.rs/images/default-category-og.jpg">
<meta property="og:url" content="https://meridiansport.rs/fudbal/">
<meta property="og:site_name" content="Meridian Sport">
```

### 3. ✅ Robots Meta Tag
```html
<meta name="robots" content="index, follow, max-image-preview:large">
```

### 4. ✅ CollectionPage Structured Data
Each category includes proper schema.org markup:
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Fudbal - Meridian Sport",
  "description": "Najnovije fudbalske vesti...",
  "url": "https://meridiansport.rs/fudbal/",
  "publisher": {
    "@type": "Organization",
    "name": "Meridian Sport",
    "logo": {
      "@type": "ImageObject",
      "url": "https://meridiansport.rs/_nuxt/meridian-logo.DklqdKiS.svg"
    }
  }
}
```

### 5. ✅ BreadcrumbList Structured Data
Navigation breadcrumbs for SEO:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://meridiansport.rs/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Fudbal",
      "item": "https://meridiansport.rs/fudbal/"
    }
  ]
}
```

### 6. ✅ Twitter Card Meta Tags
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Fudbal - Meridian Sport">
<meta name="twitter:description" content="Najnovije fudbalske vesti...">
<meta name="twitter:image" content="https://meridiansport.rs/images/default-category-og.jpg">
```

---

## 📋 Category Metadata

### Najnovije vesti
- **Title:** Najnovije vesti - Meridian Sport
- **Description:** Najnovije sportske vesti sa Meridian Sport portala! Fudbal, košarka, odbojka i svi aktuelni događaji iz Srbije i sveta, na jednom mestu.
- **URL:** https://meridiansport.rs/najnovije-vesti/

### Fudbal
- **Title:** Fudbal - Meridian Sport
- **Description:** Najnovije fudbalske vesti sa Meridian Sport portala! Rezultati, transferi, analize i priče iz domaćeg i svetskog fudbala.
- **URL:** https://meridiansport.rs/fudbal/

### Košarka
- **Title:** Košarka - Meridian Sport
- **Description:** Meridian Sport prati sve iz sveta košarke! Utakmice, transferi, izveštaji i ekskluzive iz domaćih i stranih liga.
- **URL:** https://meridiansport.rs/kosarka/

### Tenis
- **Title:** Tenis - Meridian Sport
- **Description:** Meridian Sport donosi najnovije vesti iz tenisa! ATP, WTA, Grand Slam turniri, rezultati i analize.
- **URL:** https://meridiansport.rs/tenis/

### Odbojka
- **Title:** Odbojka - Meridian Sport
- **Description:** Pratite Meridian Sport za najnovije vesti iz odbojke - rezultati, transferi, izveštaji i sve što zanima ljubitelje odbojke.
- **URL:** https://meridiansport.rs/odbojka/

### Ostali sportovi
- **Title:** Ostali sportovi - Meridian Sport
- **Description:** Meridian Sport donosi aktuelne vesti iz ostalih sportova - atletika, borilački sportovi, rukomet, plivanje i više.
- **URL:** https://meridiansport.rs/ostali-sportovi/

---

## 🖼️ OG Image Requirements

**⚠️ ACTION REQUIRED:** Upload the default category OG image

### Image Specifications:
- **File name:** `default-category-og.jpg`
- **Location:** `/public/images/default-category-og.jpg`
- **Dimensions:** 1200x630px (minimum 1200px width)
- **Format:** JPG or PNG
- **Aspect ratio:** 1.91:1 (Facebook/OG standard)
- **File size:** < 5MB

### Design Guidelines:
- Include Meridian Sport logo
- Generic sports imagery (multiple sports)
- Brand colors
- Clear and readable at small sizes
- Professional appearance for social sharing

### URL After Upload:
`https://meridiansport.rs/images/default-category-og.jpg`

---

## 🧪 Testing & Validation

### 1. Validate Structured Data
**Google Rich Results Test:**
```
https://search.google.com/test/rich-results
```
Test each category URL to ensure structured data is valid.

### 2. Validate Open Graph
**Facebook Sharing Debugger:**
```
https://developers.facebook.com/tools/debug/
```
After uploading OG image, test all category URLs.

**Twitter Card Validator:**
```
https://cards-dev.twitter.com/validator
```

### 3. Check in Browser
View page source and verify:
- ✅ Canonical tag present
- ✅ All OG meta tags present
- ✅ Robots meta tag present
- ✅ Both structured data scripts present (CollectionPage + BreadcrumbList)

### 4. Test with SEO Tools
- **Screaming Frog:** Crawl site and check metadata
- **Ahrefs Site Audit:** Verify canonical tags
- **Semrush Site Audit:** Check structured data

---

## 🔧 How It Works

### useCategorySEO Composable
The composable accepts a category slug and returns complete SEO metadata:

```javascript
// Usage in any category page
const seoData = useCategorySEO('fudbal')
if (seoData) {
  useHead(seoData)
}
```

### Benefits:
✅ **DRY (Don't Repeat Yourself):** Single source of truth for all category SEO
✅ **Maintainable:** Update one file to change all categories
✅ **Consistent:** Same structure across all pages
✅ **Type-safe:** Easy to extend with TypeScript later
✅ **Environment-aware:** Uses runtime config for dynamic URLs

---

## 📊 SEO Impact

### Expected Improvements:
1. **Better Indexing:** Self-referencing canonicals prevent duplicate content issues
2. **Rich Snippets:** CollectionPage structured data may show in SERPs
3. **Social Sharing:** Proper OG tags ensure good appearance on social media
4. **Breadcrumb Navigation:** Enhanced SERP display with breadcrumbs
5. **Image Previews:** Large image preview in social shares and search

### Monitoring:
- **Google Search Console:** Monitor impressions and clicks for category pages
- **Google Analytics:** Track social referral traffic
- **Social Media Insights:** Check engagement on shared links

---

## 🚀 Future Enhancements

### Potential Additions:
1. **Category-Specific OG Images:** Unique images for each sport
2. **FAQ Schema:** Add FAQ structured data to categories
3. **Video Object:** If video content is added
4. **WebSite Schema:** Add site-wide search functionality markup
5. **Organization Schema:** Enhanced brand information
6. **ItemList Schema:** List of articles in the category

---

## 📝 Notes

- All category pages use trailing slashes (e.g., `/fudbal/`)
- URLs are hardcoded to `meridiansport.rs` but can be changed via `NUXT_PUBLIC_SITE_URL` env variable
- Logo URL uses hash-based filename from Nuxt build
- Metadata is SSR-friendly and works with both server and client rendering

---

## ✅ Checklist Before Going Live

- [ ] Upload `default-category-og.jpg` to `/public/images/`
- [ ] Test all category pages in Rich Results Test
- [ ] Validate OG tags in Facebook Debugger
- [ ] Check Twitter Card preview
- [ ] Verify canonical URLs in browser
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor Google Search Console for any errors
- [ ] Check mobile rendering of meta tags

---

## 🆘 Troubleshooting

### Issue: OG image not showing
**Solution:**
1. Verify file exists at `/public/images/default-category-og.jpg`
2. Check file permissions (should be readable)
3. Clear social media cache (Facebook Debugger)
4. Ensure image meets size requirements (1200px width min)

### Issue: Structured data errors
**Solution:**
1. Test with Google Rich Results Tool
2. Verify JSON syntax in browser console
3. Check that all required fields are present
4. Ensure URLs are absolute (not relative)

### Issue: Canonical not working
**Solution:**
1. Check that trailing slashes match URLs
2. Verify in browser developer tools (Network tab)
3. Ensure no conflicting canonical tags from other sources

---

## 📞 Support

For questions or issues with SEO implementation:
1. Check this documentation
2. Review [app/composables/useCategorySEO.js](app/composables/useCategorySEO.js)
3. Test in development environment first
4. Validate with Google tools before production deployment
