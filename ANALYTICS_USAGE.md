# Google Analytics 4 (GA4) Setup Documentation

## Overview
This project uses **Google Analytics 4 (GA4)** for web analytics tracking.

### Configuration Files
- **[nuxt.config.ts](nuxt.config.ts)** - GA4 initialization script
- **[app/plugins/analytics.client.js](app/plugins/analytics.client.js)** - SPA page view tracking plugin

## Current Setup

### GA4 Measurement ID
- **Default:** `G-D36YF7TZJF`
- **Environment Variable:** `NUXT_PUBLIC_GA_MEASUREMENT_ID` or `GA_MEASUREMENT_ID`

### What's Tracked Automatically
✅ Initial page load (server-side and client-side)
✅ Client-side navigation (SPA page changes)
✅ Page title changes
✅ Full URL path tracking

## How to Use Custom Event Tracking

The analytics plugin provides a global `$gtag` function for custom event tracking.

### Example: Track Button Clicks

```vue
<template>
  <button @click="trackButtonClick">
    Subscribe to Newsletter
  </button>
</template>

<script setup>
const { $gtag } = useNuxtApp()

function trackButtonClick() {
  // Track custom event
  $gtag('event', 'newsletter_subscribe', {
    event_category: 'engagement',
    event_label: 'footer_newsletter',
    value: 1
  })

  // Your button click logic here
  console.log('Newsletter subscription clicked')
}
</script>
```

### Example: Track Article Views

```vue
<script setup>
const { $gtag } = useNuxtApp()

// Track when article is viewed
onMounted(() => {
  $gtag('event', 'article_view', {
    event_category: 'content',
    article_id: props.article.id,
    article_title: props.article.title,
    article_category: props.category
  })
})
</script>
```

### Example: Track Search Queries

```vue
<script setup>
const { $gtag } = useNuxtApp()

function handleSearch(query) {
  $gtag('event', 'search', {
    search_term: query,
    event_category: 'site_search'
  })

  // Perform search logic
  performSearch(query)
}
</script>
```

## Common Events to Track

### Recommended GA4 Events:
- `page_view` - Automatically tracked ✅
- `click` - Button/link clicks
- `search` - Search queries
- `select_content` - Article/content selection
- `share` - Social media shares
- `video_start` / `video_complete` - Video engagement
- `sign_up` / `login` - User authentication
- `purchase` - E-commerce (if applicable)

## Environment Variables

To change the GA4 Measurement ID:

### Option 1: .env file
```bash
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Option 2: Environment variable
```bash
export NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# or
export GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Troubleshooting

### Check if GA4 is loaded:
```javascript
// Open browser console and run:
console.log(window.gtag)
console.log(window.dataLayer)
```

### Check plugin logs:
Look for `[Analytics]` logs in browser console:
- `[Analytics] Page view tracked: ...` - Confirms page views
- `[Analytics] gtag not available...` - Script loading issue

### Verify in GA4 Dashboard:
1. Go to Google Analytics dashboard
2. Navigate to **Reports** → **Realtime**
3. Visit your site and check if events appear in real-time

## Technical Details

### Plugin Features:
- ✅ Client-side only (`.client.js`)
- ✅ Waits for gtag to load before tracking
- ✅ 5-second timeout with fallback
- ✅ Skips initial page load (already tracked by gtag.js)
- ✅ Tracks route changes with full URL and title
- ✅ Provides `$gtag` globally for custom events
- ✅ Error handling and console logging

### Cookie Settings:
- `SameSite=None;Secure` - Required for cross-site tracking
- First-party cookies for privacy compliance

## Migration Notes

### Previous Setup (Removed):
- ❌ Google Tag Manager (GTM) - Removed to prevent conflicts
- ❌ Mixed GTM + GA4 IDs - Cleaned up
- ❌ Duplicate noscript tags - Removed from app.vue

### Current Setup (Clean):
- ✅ Pure GA4 implementation
- ✅ Environment variable support
- ✅ SPA tracking enabled
- ✅ Custom event tracking ready

## Best Practices

1. **Don't over-track:** Only track meaningful user interactions
2. **Use event_category:** Group related events together
3. **Privacy compliance:** Ensure cookie consent is obtained (add consent banner if needed)
4. **Test in dev:** Use GA4 Debug View to verify events
5. **Document events:** Keep track of custom events you implement

## Need Help?

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Nuxt Analytics Guide](https://nuxt.com/docs/getting-started/seo-meta#external-scripts)
