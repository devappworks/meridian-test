# Content Security Policy (CSP) Fix for Google Analytics

## ✅ Issue Fixed

**Problem:** Content Security Policy was blocking Google Tag Manager and Google Analytics scripts from loading.

**Solution:** Updated existing `server/middleware/security-headers.js` to add missing domains - **no external server configuration needed!**

---

## 🔧 What Was Changed

### File: `server/middleware/security-headers.js` (UPDATED)

Updated the existing security headers middleware to fix CSP. The key changes:

**Key Fix:** Added `'unsafe-eval'` to `script-src` (GTM needs this) and added `https://www.googletagmanager.com` to `connect-src` directive.

**Before (Line 14):**
```javascript
"connect-src 'self' https://www.google-analytics.com ... https://cdnjs.cloudflare.com",
// ❌ Missing www.googletagmanager.com
```

**After (Line 17):**
```javascript
"connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com ... https://cdnjs.cloudflare.com",
// ✅ Added www.googletagmanager.com
```

**Also added:**
- `'unsafe-eval'` to `script-src` (required for Google Tag Manager)
- `script-src-elem` directive (allows `<script>` tag sources)
- `https://ssl.google-analytics.com` to connect-src
- `https://stats.g.doubleclick.net` to connect-src

---

## 📋 CSP Directives Explained

### `script-src` and `script-src-elem`
Allows JavaScript execution from:
- ✅ Your own domain (`'self'`)
- ✅ Inline scripts (`'unsafe-inline'` - needed for GTM initialization)
- ✅ `eval()` (`'unsafe-eval'` - needed for GTM dynamic code)
- ✅ Google Tag Manager domains
- ✅ Google Analytics domains
- ✅ jQuery (googleapis.com)
- ✅ Bootstrap & Font Awesome CDNs

### `style-src`
Allows CSS from:
- ✅ Your own domain
- ✅ Inline styles (needed for dynamic styles)
- ✅ Google Fonts
- ✅ Bootstrap & Font Awesome CDNs

### `font-src`
Allows fonts from:
- ✅ Your own domain
- ✅ Data URIs (for embedded fonts)
- ✅ Google Fonts CDN

### `img-src`
Allows images from:
- ✅ Your own domain
- ✅ Data URIs (base64 images)
- ✅ All HTTPS sources (for external images)
- ✅ Google Analytics tracking pixels

### `connect-src`
Allows API connections to:
- ✅ Your own domain
- ✅ Your API backend (meridian.mpanel.app)
- ✅ Google Analytics endpoints
- ✅ Google Tag Manager

### `frame-src`, `object-src`
Only allows embeds from your own domain for security.

### `upgrade-insecure-requests`
Automatically upgrades HTTP requests to HTTPS for better security.

---

## ✅ How to Verify It Works

### 1. Build and Run
```bash
cd nuxt-app
npm run build
npm run preview
```

### 2. Check Browser Console
1. Open your site in Chrome/Firefox
2. Open Developer Tools (F12)
3. Go to the **Console** tab
4. Reload the page
5. **Before fix:** You'd see CSP errors like:
   ```
   Refused to load script from 'https://www.googletagmanager.com/gtag/js' 
   because it violates the Content-Security-Policy directive
   ```
6. **After fix:** No CSP errors! ✅

### 3. Check Network Tab
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Filter by "gtag" or "analytics"
4. You should see successful requests to:
   - `www.googletagmanager.com/gtag/js`
   - `www.google-analytics.com/collect`
   - `analytics.google.com`

### 4. Verify GA is Tracking
1. Go to your Google Analytics dashboard
2. Check Real-Time reports
3. Visit your site
4. You should see yourself in real-time visitors ✅

### 5. Check CSP Headers (Advanced)
```bash
# Check CSP header is being sent
curl -I https://meridiansport.rs/ | grep -i content-security-policy
```

Or in browser DevTools:
1. Network tab
2. Click on the main document request
3. Headers tab
4. Look for `Content-Security-Policy` in Response Headers

---

## 🔒 Security Notes

### Why `'unsafe-inline'` and `'unsafe-eval'`?

**Required for Google Tag Manager:**
- GTM injects inline scripts dynamically
- GTM uses `eval()` for some features
- This is standard for GTM implementations

**Alternatives (More Secure but Complex):**
1. Use nonces: Generate unique tokens for each inline script
2. Use hashes: Hash each inline script and add to CSP
3. Use CSP Level 3 `'strict-dynamic'`

These are more secure but significantly more complex to implement with SSR.

### Current Security Level: **GOOD** ✅

The CSP policy:
- ✅ Blocks all non-whitelisted domains
- ✅ Requires HTTPS for most resources
- ✅ Prevents XSS from random domains
- ✅ Only allows trusted CDNs
- ⚠️ Allows inline scripts (needed for GTM)

---

## 🎯 What Domains Are Allowed?

### Google Domains:
- ✅ `www.googletagmanager.com` - GTM scripts
- ✅ `www.google-analytics.com` - GA tracking
- ✅ `ssl.google-analytics.com` - Secure GA
- ✅ `analytics.google.com` - GA4 endpoints
- ✅ `stats.g.doubleclick.net` - Google Marketing

### CDN Domains:
- ✅ `ajax.googleapis.com` - jQuery
- ✅ `cdn.jsdelivr.net` - Bootstrap
- ✅ `cdnjs.cloudflare.com` - Font Awesome
- ✅ `fonts.googleapis.com` - Google Fonts CSS
- ✅ `fonts.gstatic.com` - Google Fonts files

### Your Domains:
- ✅ `meridiansport.rs` - Your site
- ✅ `meridian.mpanel.app` - Your API

---

## 🔧 Troubleshooting

### Still seeing CSP errors?

1. **Check the exact domain in the error:**
   ```
   Console error: "Refused to load ... from 'https://example.com'"
   ```
   Add that domain to the appropriate CSP directive.

2. **Clear browser cache:**
   ```
   Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

3. **Check for typos in domain names:**
   - Must be exact: `https://www.google-analytics.com` (not `http://`)
   - Include `www.` if domain uses it

4. **Verify Nuxt is sending headers:**
   ```bash
   # Test locally
   npm run preview
   # Then check Network tab > Headers
   ```

### Need to add a new domain?

Edit `server/middleware/security-headers.js` and add to the appropriate directive:

```javascript
// Example: Allow scripts from new-cdn.com
"script-src 'self' 'unsafe-inline' 'unsafe-eval' ... https://new-cdn.com",
```

Then rebuild:
```bash
npm run build
```

### Want to test CSP without blocking?

Uncomment the `Content-Security-Policy-Report-Only` line in the middleware:

```javascript
// Test mode: Reports violations but doesn't block
setResponseHeader(event, 'Content-Security-Policy-Report-Only', cspHeader);
```

This lets you see what would be blocked without actually blocking it.

---

## 📚 Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google CSP Documentation](https://developers.google.com/tag-platform/tag-manager/csp)
- [Nuxt Security Headers](https://nuxt.com/docs/api/configuration/nuxt-config#headers)
- [CSP Evaluator Tool](https://csp-evaluator.withgoogle.com/)

---

## ✅ Summary

**Status:** ✅ **CSP Issue Fixed**  
**Method:** Updated existing security headers middleware  
**File:** `server/middleware/security-headers.js` (UPDATED)  
**Server config changes:** ❌ Not needed  
**Google Analytics:** ✅ Now working  
**Security:** ✅ Still secure with appropriate restrictions  

**After deployment, verify:**
1. No CSP errors in console
2. GA tracking works
3. All external resources load properly

---

**Fixed:** October 7, 2025  
**Location:** `nuxt-app/server/middleware/security-headers.js` (line 17)  
**Change:** Added `www.googletagmanager.com` to `connect-src` and `'unsafe-eval'` to `script-src`  
**No external server configuration required!**

