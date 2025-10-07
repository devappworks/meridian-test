# Diagnose Production GA Issue - Red Network Request

## 🚨 Immediate Checks

### 1. Check Exact Error in Network Tab

**On Production Site:**
1. Open https://meridiansport.rs
2. Open DevTools (F12) → Network tab
3. Find the RED request to `gtag.js`
4. Click on it
5. Check these tabs:

**Headers Tab:**
- What's the **Status Code**? (should show at top)
  - If **blocked by CSP**: Usually shows "(blocked:csp)" or "net::ERR_BLOCKED_BY_CLIENT"
  - If **404**: Script URL is wrong
  - If **Failed**: Network/DNS issue

**Console Tab:**
- Look for CSP violation errors like:
  ```
  Refused to load the script 'https://www.googletagmanager.com/gtag/js?id=G-D36YF7TZJF' 
  because it violates the following Content Security Policy directive: "script-src 'self'"
  ```

---

## 🔍 **Test 1: Check Current CSP Headers on Production**

Run this in production browser console:

```javascript
fetch(window.location.href).then(async (response) => {
  const csp = response.headers.get('content-security-policy');
  console.log('=== CSP HEADER CHECK ===');
  console.log('CSP exists:', !!csp);
  if (csp) {
    console.log('CSP value:', csp);
    console.log('Has googletagmanager:', csp.includes('googletagmanager.com'));
    console.log('Has google-analytics:', csp.includes('google-analytics.com'));
  } else {
    console.log('No CSP header found');
  }
});
```

**Expected results:**

**If CSP is missing** (before deploy):
```
CSP exists: false
No CSP header found
```
→ This means the gtag.js should load fine, so the red error is something else

**If CSP exists but incomplete**:
```
CSP exists: true
Has googletagmanager: false  ← PROBLEM!
Has google-analytics: false  ← PROBLEM!
```
→ This is blocking GA

**If CSP is correct** (after deploy):
```
CSP exists: true
Has googletagmanager: true  ← GOOD!
Has google-analytics: true  ← GOOD!
```
→ GA should work

---

## 🔍 **Test 2: Check CSP Headers via curl**

Run this on your local machine (or server SSH):

```bash
curl -I https://meridiansport.rs | grep -i "content-security"
```

**Or Windows PowerShell:**
```powershell
curl.exe -I https://meridiansport.rs | Select-String "content-security"
```

**Possible Results:**

**1. No CSP header:**
```
(no output)
```
→ CSP doesn't exist yet - need to deploy fix

**2. CSP exists but blocks GA:**
```
content-security-policy: default-src 'self'; script-src 'self'
```
→ This CSP is TOO STRICT - doesn't allow external scripts

**3. CSP exists and allows GA:**
```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com...
```
→ This is CORRECT - should work

---

## 🔍 **Test 3: Check if Cloudflare or CDN is Adding Headers**

**If using Cloudflare:**
1. Login to Cloudflare dashboard
2. Go to your domain
3. Check **Transform Rules** or **Page Rules**
4. Check **Security** → **WAF** settings
5. Look for any CSP headers being added

**Common issue:** Cloudflare can add strict CSP headers that override your app's headers

---

## 🔍 **Test 4: Check Web Server Config**

**If using nginx, check for CSP in config:**

```bash
# On server, check nginx config
cat /etc/nginx/sites-available/meridiansport.rs | grep -i "content-security"

# Or Apache
cat /etc/apache2/sites-available/meridiansport.rs.conf | grep -i "content-security"
```

**Look for lines like:**
```nginx
add_header Content-Security-Policy "default-src 'self'";
```

**If found:** This is overriding your Nuxt middleware headers!

---

## 🔍 **Test 5: Compare Local vs Production**

**On Local (http://localhost:3000):**
```javascript
fetch(window.location.href).then(r => console.log('Local CSP:', r.headers.get('content-security-policy')));
```

**On Production (https://meridiansport.rs):**
```javascript
fetch(window.location.href).then(r => console.log('Prod CSP:', r.headers.get('content-security-policy')));
```

**Compare the outputs** - this will show if there's a difference

---

## 📋 **What Each Scenario Means:**

### Scenario A: No CSP on Either
**Symptoms:** 
- Local works (white)
- Production fails (red)
- No CSP headers

**Possible causes:**
- Network/firewall blocking Google domains
- HTTPS/SSL certificate issues
- DNS issues
- Ad blocker only on production browser

**Solution:** Check browser console for exact error message

---

### Scenario B: CSP on Production Only (Too Strict)
**Symptoms:**
- Local works (no CSP)
- Production fails (CSP blocking)
- CSP exists but doesn't allow Google domains

**Solution:** 
1. Find where CSP is set (nginx, Cloudflare, etc.)
2. Either remove it and deploy our Nuxt middleware
3. OR update the existing CSP to allow Google domains

---

### Scenario C: Nuxt Fix Not Deployed Yet
**Symptoms:**
- Both show no CSP
- Production still red

**Solution:** Deploy the fix now

---

## 🚀 **Resolution Steps Based on Findings:**

### If CSP Found in nginx/Apache:

**Option 1: Remove from web server** (let Nuxt handle it)
```nginx
# Comment out or remove this line from nginx config:
# add_header Content-Security-Policy "...";
```

**Option 2: Update web server CSP to allow GA**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com;" always;
```

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### If CSP Found in Cloudflare:

1. Go to Cloudflare → Transform Rules
2. Remove or modify the CSP rule to allow Google domains
3. Or disable the rule temporarily to test

---

### If NO CSP Found Anywhere:

The red error must be something else:
1. Check browser console for exact error
2. Check if HTTPS certificate is valid
3. Check if firewall is blocking Google domains
4. Try in Incognito mode (disable extensions)
5. Try different browser

---

## 🔧 **Quick Test Script**

Save this as a bookmark and click it on production to get full diagnostic:

```javascript
javascript:(function(){const d=document.createElement('div');d.style='position:fixed;top:10px;right:10px;background:white;border:2px solid red;padding:20px;z-index:99999;max-width:400px;font-family:monospace;font-size:12px';d.innerHTML='<h3>GA Diagnostic</h3><div id="diag">Testing...</div>';document.body.appendChild(d);const log=(msg)=>{document.getElementById('diag').innerHTML+=msg+'<br>'};fetch(window.location.href).then(r=>{const csp=r.headers.get('content-security-policy');log('CSP: '+(csp?'EXISTS':'MISSING'));if(csp){log('GTM: '+(csp.includes('googletagmanager')?'✅':'❌'));log('GA: '+(csp.includes('google-analytics')?'✅':'❌'));}log('gtag: '+(typeof gtag!=='undefined'?'✅':'❌'));log('dataLayer: '+(window.dataLayer?.length||0));}).catch(e=>log('Error: '+e.message))})();
```

---

## 📊 **Report Back With:**

Please run the tests above and report:

1. ✅ Status code of the red gtag.js request
2. ✅ Any console error messages
3. ✅ Output of CSP header check (Test 1)
4. ✅ Are you using Cloudflare, nginx, or other CDN/proxy?
5. ✅ Have you deployed the Nuxt CSP fix yet?

This will tell us exactly what's blocking GA on production!

