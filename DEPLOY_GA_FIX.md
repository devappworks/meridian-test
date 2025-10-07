# Deploy GA Fix - Step by Step

## 🚨 CRITICAL: Deploy Instructions

### Step 1: Build the Application

```bash
cd nuxt-app
npm run build
```

**This will create the production build in `.output/` directory**

### Step 2: Verify Build Contains CSP Fix

Check that `server/middleware/security-headers.js` was included:

```bash
# Windows PowerShell
Get-Content .output/server/chunks/runtime.mjs | Select-String "Content-Security-Policy"

# Or check the file directly
cat .output/server/middleware/security-headers.mjs
```

**You should see:** CSP header with google-analytics domains

### Step 3: Deploy to Production Server

Transfer the `.output` folder to your production server:

```bash
# Example using SCP (adjust for your setup)
scp -r .output/* user@your-server:/path/to/app/

# Or if using Git deployment:
git add .
git commit -m "CRITICAL: Fix GA tracking - Add CSP headers"
git push origin main
```

### Step 4: Restart Production Server

```bash
# On your production server
pm2 restart meridian-app
# or
systemctl restart your-app-service
```

### Step 5: Verify Deployment

**Test 1: Check CSP Headers**

```bash
curl -I https://meridiansport.rs | grep -i content-security
```

**Expected output:**
```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com...
```

**Test 2: Check in Browser**

1. Open https://meridiansport.rs
2. Open DevTools (F12)
3. Go to Network tab
4. Filter by "google-analytics"
5. Refresh page
6. **You should now see:**
   - ✅ GET request to `/gtag/js?id=G-D36YF7TZJF` (Status: 200)
   - ✅ POST request to `/g/collect?v=2&tid=...` (Status: 200)

**Test 3: Check Real-Time in GA**

1. Open Google Analytics
2. Go to Real-time reports
3. Navigate on your site
4. Should see activity immediately

---

## 📋 Deployment Checklist

- [ ] Run `npm run build`
- [ ] Verify CSP in build output
- [ ] Deploy `.output` to server
- [ ] Restart server
- [ ] Test CSP headers with curl
- [ ] Test in browser - check Network tab
- [ ] Verify POST to /g/collect succeeds (200 OK)
- [ ] Check Google Analytics Real-time
- [ ] Monitor for 15 minutes
- [ ] Check console for errors

---

## 🆘 If It Still Fails After Deployment

### Check 1: CSP Headers Not Present

**Problem:** curl shows no CSP header

**Solution:**
- Verify server middleware loaded
- Check server logs for errors
- Ensure `.output/server/middleware/` contains security-headers

### Check 2: CSP Headers Present but GA Still Blocked

**Problem:** CSP exists but /g/collect fails

**Solution:**
- Check exact CSP directive in headers
- Look for typos in domain names
- Verify `connect-src` includes `https://www.google-analytics.com`

### Check 3: Ad Blocker Interference

**Problem:** Works in Incognito, fails in normal browser

**Solution:**
- This is expected - ad blockers block GA
- Test in Incognito mode
- Use browser without extensions

### Check 4: Browser Cache

**Problem:** Old CSP cached

**Solution:**
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Test in Incognito mode

---

## 📞 Quick Test Commands

```bash
# Test if CSP header exists
curl -I https://meridiansport.rs 2>&1 | grep -i "content-security"

# Test if gtag.js loads
curl -I https://www.googletagmanager.com/gtag/js?id=G-D36YF7TZJF

# Check server response time
curl -w "@-" -o /dev/null -s https://meridiansport.rs <<'EOF'
time_total: %{time_total}s
EOF
```

---

## ✅ Success Criteria

After deployment, you should see:

1. ✅ CSP header in HTTP response
2. ✅ gtag.js script loads (200 OK)
3. ✅ POST to /g/collect succeeds (200 OK)
4. ✅ No "Fetch failed" errors in console
5. ✅ Real-time reports show activity
6. ✅ Traffic numbers start recovering within 24-48 hours

---

**Priority:** 🚨 CRITICAL  
**Estimated Deploy Time:** 5-10 minutes  
**Expected Recovery:** 24-48 hours

