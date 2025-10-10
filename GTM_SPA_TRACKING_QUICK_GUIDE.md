# GTM SPA Tracking - Quick Setup Guide

## ✅ What I Fixed

Created **`gtm-router.client.js`** plugin that automatically tracks page views when users navigate between pages in your Nuxt SPA.

Without this plugin, GTM only fires on the initial page load. Now it fires on every route change!

## 🚀 Quick GTM Configuration (5 minutes)

### 1. Create GA4 Configuration Tag

**GTM Dashboard → Tags → New**

- **Type:** Google Analytics: GA4 Configuration
- **Measurement ID:** `G-D36YF7TZJF`
- **Trigger:** Initialization - All Pages
- **Name:** `GA4 - Configuration`

### 2. Create Custom Trigger for Route Changes

**GTM Dashboard → Triggers → New**

- **Type:** Custom Event
- **Event name:** `nuxt-route-change` (exactly as written)
- **Name:** `Nuxt Route Change`

### 3. Create Page View Event Tag

**GTM Dashboard → Tags → New**

- **Type:** Google Analytics: GA4 Event
- **Configuration Tag:** GA4 - Configuration (from step 1)
- **Event Name:** `page_view`
- **Trigger:** Nuxt Route Change (from step 2)
- **Name:** `GA4 - Route Change Page View`

### 4. Publish

Click **Submit** → Version Name: "SPA Tracking" → **Publish**

## 🧪 Test It Now

### Method 1: Browser Console

1. Restart dev server: `npm run dev`
2. Open site in browser
3. Open DevTools → Console
4. Navigate between pages (Home → Fudbal → Košarka)
5. You should see: `📊 GTM Page View Tracked: { path: '/fudbal', title: '...' }`

### Method 2: GTM Preview Mode

1. GTM Dashboard → **Preview** button
2. Enter: `http://localhost:3000`
3. Navigate between pages
4. See events fire in real-time in the GTM debugger

### Method 3: GA4 Real-Time

1. Go to Google Analytics 4
2. Reports → Realtime
3. Navigate your site
4. See page views appear in real-time

## 📊 What Gets Tracked

Every time a user navigates to a new page:

```javascript
{
  event: 'nuxt-route-change',
  page: {
    path: '/fudbal',           // Route path
    title: 'Fudbal - Meridian', // Page title
    url: 'http://localhost:3000/fudbal' // Full URL
  }
}
```

## ⚙️ How It Works

1. **Initial Load:** GTM loads normally (on interaction or after 3s)
2. **Route Change:** Nuxt router detects navigation
3. **Plugin Fires:** `gtm-router.client.js` pushes event to `dataLayer`
4. **GTM Trigger:** Custom trigger `nuxt-route-change` activates
5. **GA4 Tag:** Sends `page_view` event to Google Analytics

## 🎯 Expected Results

✅ Initial page load tracked
✅ Every route change tracked
✅ Page title updated per route
✅ Works with back/forward browser buttons
✅ Works with programmatic navigation
✅ Console logs confirm tracking (dev mode only)

## 🐛 Troubleshooting

### Not seeing page views on navigation?

**Check browser console:**
```javascript
// Should see these logs:
"📊 GTM Page View Tracked: {...}"
```

**Check dataLayer:**
```javascript
// In console, type:
window.dataLayer

// Should contain events like:
// { event: 'nuxt-route-change', page: {...} }
```

### GTM trigger not firing?

1. **Check trigger event name** - Must be exactly: `nuxt-route-change`
2. **Check if GTM loaded** - Type `window.dataLayer` in console
3. **Enable GTM Preview Mode** - See events in real-time

### GA4 not receiving data?

1. **Check Measurement ID** - Should be `G-D36YF7TZJF`
2. **Check tag type** - Must be "GA4 Event" (not GA4 Configuration)
3. **Check event name** - Must be `page_view` (lowercase, underscore)

## 🎉 Success Criteria

When working correctly, you'll see:

1. ✅ Console logs on every page navigation
2. ✅ GTM Preview shows `nuxt-route-change` event
3. ✅ GA4 Real-time shows active page views
4. ✅ Multiple page views when navigating around site

---

**Need more help?** Check the full guide: [GTM_SETUP_GUIDE.md](GTM_SETUP_GUIDE.md)
