# Google Tag Manager (GTM) Setup Guide

## ✅ What Has Been Done (Code Changes)

Your project has been successfully migrated from Google Analytics (gtag.js) to Google Tag Manager (GTM):

1. ✅ Replaced gtag.js with GTM container code in `nuxt.config.ts`
2. ✅ Added optimized GTM loading (loads on user interaction or after 3s delay)
3. ✅ Added GTM noscript fallback in `app/layouts/default.vue`
4. ✅ Added GTM_ID to runtime config
5. ✅ Kept backward compatibility (old GA_MEASUREMENT_ID still available)

## 🔧 What YOU Need to Do (Outside the Project)

### Step 1: Create a Google Tag Manager Account

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Click **"Create Account"**
3. Fill in:
   - **Account Name:** Meridian Sport (or your company name)
   - **Country:** Serbia
   - **Container Name:** meridiansport.rs (your website domain)
   - **Target Platform:** Web
4. Click **"Create"** and accept the Terms of Service
5. **IMPORTANT:** Copy your GTM Container ID (format: `GTM-XXXXXXX`)

### Step 2: Add GTM Container ID to Your Project

#### Option A: Using Environment Variables (Recommended for Production)

Create or edit `.env` file in your project root:

```bash
# Google Tag Manager
NUXT_PUBLIC_GTM_ID=GTM-XXXXXXX  # Replace with your actual GTM ID
```

#### Option B: Hardcode in nuxt.config.ts (Quick Test)

Edit `nuxt.config.ts` line 8:

```javascript
// Change this:
const gtmId = process.env.NUXT_PUBLIC_GTM_ID || process.env.GTM_ID || 'GTM-XXXXXXX'

// To this (replace with your actual ID):
const gtmId = process.env.NUXT_PUBLIC_GTM_ID || process.env.GTM_ID || 'GTM-ABC1234'
```

### Step 3: Configure Google Analytics 4 Inside GTM

Now that GTM is installed, you need to add Google Analytics as a **tag** inside GTM:

1. **In GTM Dashboard:**
   - Click **"Tags"** in the left sidebar
   - Click **"New"**
   - Click **"Tag Configuration"**

2. **Choose Tag Type:**
   - Select **"Google Analytics: GA4 Configuration"**

3. **Configure GA4:**
   - **Measurement ID:** Your GA4 ID (e.g., `G-D36YF7TZJF`)
   - You can find this in Google Analytics: Admin → Data Streams → Your Stream → Measurement ID

4. **Set Trigger for Initial Page Load:**
   - Click **"Triggering"**
   - Select **"Initialization - All Pages"**

5. **Save and Name:**
   - Name: "GA4 - Configuration"
   - Click **"Save"**

6. **Create Trigger for SPA Route Changes (IMPORTANT!):**
   - Click **"Triggers"** → **"New"**
   - Trigger Configuration → **"Custom Event"**
   - Event name: `nuxt-route-change`
   - Name it: **"Nuxt Route Change"**
   - Click **"Save"**

7. **Create GA4 Event Tag for Route Changes:**
   - Click **"Tags"** → **"New"**
   - Tag Configuration → **"Google Analytics: GA4 Event"**
   - Configuration Tag: Select "GA4 - Configuration" (from step 5)
   - Event Name: `page_view`
   - Triggering → Select **"Nuxt Route Change"** (from step 6)
   - Name it: **"GA4 - Route Change Page View"**
   - Click **"Save"**

8. **Submit Container:**
   - Click **"Submit"** (top right)
   - Add Version Name: "GA4 Setup with SPA Tracking"
   - Add Version Description: "Added GA4 with client-side route tracking"
   - Click **"Publish"**

### Step 4: Test GTM Installation

1. **Install GTM/GA Debugger Extension:**
   - Chrome: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - OR use GTM Preview Mode (see below)

2. **Enable GTM Preview Mode:**
   - In GTM Dashboard, click **"Preview"** (top right)
   - Enter your website URL: `http://localhost:3000` (for dev) or your production URL
   - Click **"Connect"**

3. **Test Your Site:**
   - Navigate through your website
   - Check that GTM fires on page views
   - Verify GA4 tags are sending data

4. **Check Real-Time Reports:**
   - Go to Google Analytics 4
   - Click **"Reports"** → **"Realtime"**
   - You should see yourself as an active user

## 📊 Benefits of GTM vs gtag.js

| Feature | gtag.js (Old) | GTM (New) |
|---------|---------------|-----------|
| **Performance** | Loads immediately | Deferred (3s or on interaction) |
| **Flexibility** | Requires code changes | Update tags in GTM UI |
| **Multiple Tags** | Separate scripts | One container for all |
| **Tag Management** | Developers only | Marketers can manage |
| **Testing** | Deploy to production | Preview mode |

## 🚀 Optional: Add More Tags to GTM

Once GTM is working, you can easily add:

### Facebook Pixel
1. GTM → New Tag → Custom HTML
2. Paste Facebook Pixel code
3. Set trigger to "All Pages"

### Google Ads Conversion Tracking
1. GTM → New Tag → Google Ads Conversion Tracking
2. Enter Conversion ID and Label
3. Set trigger to specific pages/events

### Custom Events (e.g., Button Clicks)
1. GTM → Triggers → New → Click - All Elements
2. Configure click trigger (e.g., button with class "cta-button")
3. Create tag to send event to GA4

## 🔍 Troubleshooting

### GTM Not Loading?

**Check Console:**
```javascript
// Open browser DevTools → Console
// Type:
window.dataLayer
// Should return an array (not undefined)
```

**Verify GTM ID:**
- Check that `GTM-XXXXXXX` in your .env matches GTM dashboard

### GA4 Data Not Showing?

1. **Check GTM Debug Mode:**
   - Enable Preview mode in GTM
   - Verify "GA4 Configuration" tag fires

2. **Check GA4 Property:**
   - Make sure you're using the correct Measurement ID
   - Check if GA4 property is active (not disabled)

3. **Ad Blockers:**
   - Disable ad blockers when testing
   - Use Incognito mode

## 📝 Summary

✅ **Code is ready** - GTM integration is complete
🔧 **Action needed** - Set up GTM account and get Container ID
⚙️ **Configure** - Add GA4 tag inside GTM
✅ **Test** - Use Preview mode and real-time reports

---

**Need Help?**
- [GTM Documentation](https://support.google.com/tagmanager)
- [GA4 Setup in GTM](https://support.google.com/analytics/answer/9744165)
