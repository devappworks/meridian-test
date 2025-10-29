# Performance Optimization - To-Do List

**Project:** Meridian Sport Performance Improvements
**Created:** 2025-10-19
**Status:** Ready to Start

---

## 🟢 Phase 1: Quick Wins (Week 1)

**Timeline:** 1-2 days
**Goal:** 15-25% faster initial load with minimal risk

### Task 1: Enable CSS Code Splitting

**Priority:** HIGH | **Effort:** 30 min | **Risk:** LOW
**Status:** ❌ NOT DONE - CSS code splitting still disabled in config

- [ ] **1.1** Open `nuxt.config.ts`
- [ ] **1.2** Find the vite.build section (search for "cssCodeSplit")
- [ ] **1.3** Change `cssCodeSplit: false` to `cssCodeSplit: true`
- [ ] **1.4** Save file
- [ ] **1.5** Run `npm run build` locally to verify build succeeds
- [ ] **1.6** Test homepage loads correctly with split CSS
- [ ] **1.7** Test category pages load correctly
- [ ] **1.8** Verify CSS order is preserved (no visual regressions)
- [ ] **1.9** Measure bundle size difference
- [ ] **1.10** Deploy to production

**Expected Impact:** 40-60KB smaller CSS per page load

**Files Changed:**
- `nuxt.config.ts` (line 191)

**Testing:**
- Visual regression on all pages
- Bundle size analysis
- CSS loading waterfall in DevTools

---

### Task 2: Add Resize Event Debouncing

**Priority:** MEDIUM | **Effort:** 1 hour | **Risk:** LOW

- [ ] **2.1** Install lodash-es: `npm install lodash-es`
- [ ] **2.2** Open `app/components/NewsSlider.vue`
- [ ] **2.3** Add import at top: `import { debounce } from 'lodash-es'`
- [ ] **2.4** Locate line 191 (resize event listener in mounted)
- [ ] **2.5** Wrap `this.updateVisibility` with debounce:
  ```javascript
  // OLD: window.addEventListener("resize", this.updateVisibility);
  // NEW:
  this.debouncedUpdateVisibility = debounce(this.updateVisibility, 150)
  window.addEventListener("resize", this.debouncedUpdateVisibility);
  ```
- [ ] **2.6** Update `beforeUnmount` to remove debounced listener
- [ ] **2.7** Test resize behavior on desktop (smooth, no jank)
- [ ] **2.8** Test on mobile/tablet
- [ ] **2.9** Verify slider still updates correctly after resize
- [ ] **2.10** Profile with Chrome DevTools Performance tab (check frame rate during resize)

**Expected Impact:** Smoother scrolling/resizing, 10-15% CPU reduction during resize

**Files Changed:**
- `app/components/NewsSlider.vue` (line 191)
- `package.json` (add lodash-es dependency)

**Testing:**
- Manual resize testing
- Performance profiling
- Cross-browser testing

---

### Task 3: Optimize GTM Polling

**Priority:** MEDIUM | **Effort:** 1 hour | **Risk:** LOW

- [ ] **3.1** Open `app/plugins/analytics.client.js`
- [ ] **3.2** Locate lines 71-75 (setInterval polling)
- [ ] **3.3** Replace polling with exponential backoff approach:
  ```javascript
  // OLD: setInterval with 100ms
  // NEW: Exponential backoff (100ms, 200ms, 400ms, 800ms, etc.)
  const checkWithBackoff = (attempt = 0, maxAttempts = 10) => {
    if (checkGtagReady() || attempt >= maxAttempts) {
      return
    }
    const delay = Math.min(100 * Math.pow(2, attempt), 3000)
    setTimeout(() => checkWithBackoff(attempt + 1, maxAttempts), delay)
  }
  checkWithBackoff()
  ```
- [ ] **3.4** Remove setInterval code (lines 71-75)
- [ ] **3.5** Remove 15-second timeout (lines 78-83) - handled by maxAttempts
- [ ] **3.6** Test that GTM loads correctly
- [ ] **3.7** Test that page views are tracked
- [ ] **3.8** Verify queued events are processed
- [ ] **3.9** Profile CPU usage (should see reduction)
- [ ] **3.10** Check Google Analytics to confirm events arrive

**Expected Impact:** Reduced main thread blocking, fewer CPU cycles wasted

**Files Changed:**
- `app/plugins/analytics.client.js` (lines 71-83)

**Testing:**
- GTM/GA4 tracking verification
- Event queue processing
- CPU profiling

---

### Task 4: Increase SWR Cache Duration

**Priority:** MEDIUM | **Effort:** 30 min | **Risk:** LOW

- [ ] **4.1** Open `nuxt.config.ts`
- [ ] **4.2** Locate nitro.routeRules section (lines 48-65)
- [ ] **4.3** Change SWR cache from 60s to 300s (5 minutes) for category pages:
  ```typescript
  // OLD: '/': { ssr: true, swr: 60 },
  // NEW: '/': { ssr: true, swr: 300 },
  ```
- [ ] **4.4** Update all category page routes:
  - `/` → swr: 300
  - `/fudbal` → swr: 300
  - `/kosarka` → swr: 300
  - `/tenis` → swr: 300
  - `/odbojka` → swr: 300
  - `/ostali-sportovi` → swr: 300
  - `/najnovije-vesti` → swr: 300
  - `/tag/**` → swr: 300
- [ ] **4.5** Keep article pages at swr: 60 (more dynamic)
- [ ] **4.6** Test cache behavior (hit same category twice within 5 min)
- [ ] **4.7** Verify content updates after 5 minutes
- [ ] **4.8** Monitor server load reduction
- [ ] **4.9** Discuss with product team if 5 min is acceptable
- [ ] **4.10** Document cache strategy in comments

**Expected Impact:** 80% reduction in category page SSR requests

**Files Changed:**
- `nuxt.config.ts` (lines 48-65)

**Testing:**
- Cache hit/miss behavior
- Content freshness verification
- Server load monitoring

---

### Task 5: Phase 1 Testing & Deployment

**Priority:** HIGH | **Effort:** 4 hours | **Risk:** LOW

- [ ] **5.1** Run full build: `npm run build`
- [ ] **5.2** Test locally with production build: `npm run preview`
- [ ] **5.3** Lighthouse audit (target: 90+ performance)
- [ ] **5.4** WebPageTest audit (test from multiple locations)
- [ ] **5.5** Manual testing:
  - [ ] Homepage loads correctly
  - [ ] All category pages load
  - [ ] Article pages load
  - [ ] Comments work
  - [ ] Search works
  - [ ] Mobile menu works
  - [ ] Sliders/carousels work
  - [ ] Analytics tracking works
- [ ] **5.6** Deploy to staging environment
- [ ] **5.7** Run automated tests (if available)
- [ ] **5.8** Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] **5.9** Mobile testing (iOS, Android)
- [ ] **5.10** Get approval from stakeholders
- [ ] **5.11** Deploy to production
- [ ] **5.12** Monitor for 24 hours:
  - [ ] Error rates
  - [ ] Server load
  - [ ] Analytics data
  - [ ] User complaints
- [ ] **5.13** Document results

**Files Changed:**
- All Phase 1 changes

**Testing:**
- Full regression testing
- Performance benchmarking
- Production monitoring

---

## 🟡 Phase 2: Medium Priority (Week 2-3)

**Timeline:** 1 week
**Goal:** 30-40% bundle reduction with thorough testing

### Task 6: Parallelize Comment Fetching

**Priority:** HIGH | **Effort:** 1 day | **Risk:** MEDIUM

- [ ] **6.1** Open `app/services/api.js`
- [ ] **6.2** Locate `fetchAllComments` function (lines 304-346)
- [ ] **6.3** Create new parallel implementation:
  ```javascript
  export const fetchAllComments = async (articleId) => {
    try {
      // First fetch to get total pages
      const firstPage = await fetchFromApi(`/getComments/${articleId}`, { page: 1 })

      if (!firstPage.result?.comments) {
        return { result: { comments: [], pagination: {} } }
      }

      const { pagination } = firstPage.result
      const totalPages = pagination?.last_page || 1

      // If only one page, return immediately
      if (totalPages === 1) {
        return firstPage
      }

      // Fetch remaining pages in parallel
      const remainingPages = Array.from(
        { length: totalPages - 1 },
        (_, i) => i + 2
      )

      const pagePromises = remainingPages.map(page =>
        fetchFromApi(`/getComments/${articleId}`, { page })
      )

      const remainingResults = await Promise.all(pagePromises)

      // Combine all comments
      const allComments = [
        ...firstPage.result.comments,
        ...remainingResults.flatMap(r => r.result?.comments || [])
      ]

      return {
        result: {
          comments: allComments,
          pagination: {
            ...pagination,
            current_page: 1,
            per_page: allComments.length,
            total: allComments.length
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching all comments for article ${articleId}:`, error)
      throw error
    }
  }
  ```
- [ ] **6.4** Backup old implementation (comment out, don't delete)
- [ ] **6.5** Test with article with 0 comments
- [ ] **6.6** Test with article with 1 page of comments
- [ ] **6.7** Test with article with 2 pages of comments
- [ ] **6.8** Test with article with 10+ pages of comments
- [ ] **6.9** Monitor API error rates during testing
- [ ] **6.10** Check for race conditions
- [ ] **6.11** Verify comment order is preserved
- [ ] **6.12** Add error handling for partial failures
- [ ] **6.13** Add retry logic with exponential backoff
- [ ] **6.14** Performance test: measure improvement
- [ ] **6.15** Deploy to staging
- [ ] **6.16** A/B test with 10% traffic
- [ ] **6.17** Monitor for 3 days
- [ ] **6.18** Full production rollout

**Expected Impact:** 3-5x faster comment loading for multi-page threads

**Files Changed:**
- `app/services/api.js` (lines 304-346)

**Testing:**
- Edge case testing (0, 1, many pages)
- API rate limit testing
- Error handling verification
- Performance benchmarking

---

### Task 7: Tree-shake FontAwesome Icons

**Priority:** HIGH | **Effort:** 2 days | **Risk:** MEDIUM

#### Phase 7A: Audit Icon Usage

- [ ] **7.1** Search codebase for all FontAwesome icon usage:
  ```bash
  grep -r "fa-" app/ --include="*.vue" --include="*.js" > icon-audit.txt
  ```
- [ ] **7.2** Search for icon component usage:
  ```bash
  grep -r "font-awesome-icon" app/ --include="*.vue" > icon-components.txt
  ```
- [ ] **7.3** Manually review each component that uses icons
- [ ] **7.4** Create list of all unique icons used
- [ ] **7.5** Categorize by icon set (solid, regular, brands)
- [ ] **7.6** Document icon usage in spreadsheet

**Estimated Icons Found:**
- Header.vue: user icons (fa-circle-user, fa-user, fa-arrow-right-from-bracket)
- Social sharing: brand icons (viber, facebook, twitter, whatsapp, instagram)
- Comments: regular icons
- Other components: TBD

#### Phase 7B: Create Icon Registry

- [ ] **7.7** Create new file: `app/utils/icons.js`
- [ ] **7.8** Import only used icons:
  ```javascript
  // Import individual icons
  import { faCircleUser, faUser, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
  import { faCircleUser as farCircleUser } from '@fortawesome/free-regular-svg-icons'
  import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'

  // Export icon registry
  export const iconRegistry = {
    // Solid icons
    'fa-circle-user': faCircleUser,
    'fa-user': faUser,
    'fa-arrow-right-from-bracket': faArrowRightFromBracket,

    // Regular icons
    'far-circle-user': farCircleUser,

    // Brand icons
    'fa-facebook': faFacebook,
    'fa-twitter': faTwitter,
    'fa-instagram': faInstagram,
  }
  ```
- [ ] **7.9** Create plugin to register icons globally

#### Phase 7C: Update Components

- [ ] **7.10** Update Header.vue to use registered icons
- [ ] **7.11** Update all other components using icons
- [ ] **7.12** Remove old icon class-based usage if using vue-fontawesome
- [ ] **7.13** OR keep class-based but ensure only used icons bundled

#### Phase 7D: Remove Unused Packages

- [ ] **7.14** Remove from `package.json`:
  - Consider if all of these are needed:
  - `@fortawesome/fontawesome-svg-core`
  - `@fortawesome/free-brands-svg-icons`
  - `@fortawesome/free-regular-svg-icons`
  - `@fortawesome/free-solid-svg-icons`
  - `@fortawesome/vue-fontawesome`
- [ ] **7.15** Install tree-shakeable alternative OR keep but configure tree-shaking
- [ ] **7.16** Update `nuxt.config.ts` FontAwesome CSS CDN (lines 143-146)
  - Consider removing CDN and using SVG icons only
- [ ] **7.17** Run `npm install`
- [ ] **7.18** Run `npm run build`
- [ ] **7.19** Check bundle size reduction

#### Phase 7E: Testing

- [ ] **7.20** Visual regression test ALL pages:
  - [ ] Homepage
  - [ ] All category pages
  - [ ] Article pages
  - [ ] Login/registration
  - [ ] User profile
  - [ ] Comments section
- [ ] **7.21** Check mobile rendering
- [ ] **7.22** Check different browsers
- [ ] **7.23** Verify no missing icons
- [ ] **7.24** Check icon sizes are correct
- [ ] **7.25** Deploy to staging
- [ ] **7.26** QA testing
- [ ] **7.27** Get design approval
- [ ] **7.28** Deploy to production

**Expected Impact:** 80-100KB bundle reduction

**Files Changed:**
- `package.json`
- `app/utils/icons.js` (new file)
- All components using FontAwesome icons
- `nuxt.config.ts` (possibly)

**Testing:**
- Comprehensive visual regression
- Cross-browser testing
- Mobile testing

---

### Task 8: Optimize Font Loading

**Priority:** MEDIUM | **Effort:** 1 day | **Risk:** MEDIUM

#### Phase 8A: Audit Font Usage

- [ ] **8.1** Search CSS for all font-family declarations:
  ```bash
  grep -r "font-family" app/assets/css/ > font-usage.txt
  ```
- [ ] **8.2** Search Vue components for inline font styles
- [ ] **8.3** Document which fonts are used where:
  - Roboto: ?
  - Roboto Condensed: ?
  - Barlow Condensed: ?
  - Urbanist: ?
  - Source Sans Pro: ?
- [ ] **8.4** Document which weights are used (400, 500, 700, etc.)
- [ ] **8.5** Document which styles are used (normal, italic)
- [ ] **8.6** Use Chrome DevTools to see which fonts actually load
- [ ] **8.7** Create font usage matrix

#### Phase 8B: Update Font Imports

- [ ] **8.8** Locate font imports in code
- [ ] **8.9** If using @fontsource, update to specific weights:
  ```javascript
  // OLD: import '@fontsource/roboto' (all weights)
  // NEW:
  import '@fontsource/roboto/400.css' // Regular
  import '@fontsource/roboto/700.css' // Bold
  ```
- [ ] **8.10** Update for each font family
- [ ] **8.11** Remove unused font families entirely
- [ ] **8.12** Update `package.json` if removing fonts
- [ ] **8.13** Run `npm install`
- [ ] **8.14** Run `npm run build`
- [ ] **8.15** Check bundle size difference

#### Phase 8C: Testing

- [ ] **8.16** Visual regression test all pages
- [ ] **8.17** Specifically check:
  - [ ] Bold text renders correctly
  - [ ] Italic text renders correctly
  - [ ] Headers use correct fonts
  - [ ] Body text uses correct fonts
- [ ] **8.18** Test on different browsers
- [ ] **8.19** Test on mobile devices
- [ ] **8.20** Use Chrome DevTools to verify only needed fonts load
- [ ] **8.21** Get design team approval
- [ ] **8.22** Deploy to staging
- [ ] **8.23** Deploy to production

**Expected Impact:** 200-300KB reduction

**Files Changed:**
- Font import locations (TBD during audit)
- `package.json` (if removing fonts)
- `app/assets/css/fonts.css` (possibly)

**Testing:**
- Visual regression (especially typography)
- Cross-browser testing
- Font loading verification

---

### Task 9: Implement Cache Eviction Strategy

**Priority:** MEDIUM | **Effort:** 1 day | **Risk:** LOW

#### Phase 9A: Implement LRU Cache

- [ ] **9.1** Open `app/composables/useGlobalCache.js`
- [ ] **9.2** Add LRU cache configuration:
  ```javascript
  const MAX_CACHE_SIZE = 50 // Max 50 items
  const MAX_CACHE_AGE = 10 * 60 * 1000 // 10 minutes max age
  const cacheAccessOrder = [] // Track access order for LRU
  ```
- [ ] **9.3** Update `set` function to enforce size limit:
  ```javascript
  const set = (key, data) => {
    // Remove oldest if at capacity
    if (cacheStore.size >= MAX_CACHE_SIZE && !cacheStore.has(key)) {
      const oldestKey = cacheAccessOrder.shift()
      cacheStore.delete(oldestKey)
      cacheTimestamps.delete(oldestKey)
      console.log(`🗑️ Evicted oldest cache: "${oldestKey}"`)
    }

    // Add/update cache
    cacheStore.set(key, data)
    cacheTimestamps.set(key, Date.now())

    // Update access order
    const existingIndex = cacheAccessOrder.indexOf(key)
    if (existingIndex > -1) {
      cacheAccessOrder.splice(existingIndex, 1)
    }
    cacheAccessOrder.push(key)

    console.log(`💾 Cached "${key}" (cache size: ${cacheStore.size})`)
  }
  ```
- [ ] **9.4** Update `get` function to track access:
  ```javascript
  const get = (key, staleTime = 60000) => {
    // ... existing code ...

    // Update access order (move to end = most recent)
    const index = cacheAccessOrder.indexOf(key)
    if (index > -1) {
      cacheAccessOrder.splice(index, 1)
      cacheAccessOrder.push(key)
    }

    return cached
  }
  ```
- [ ] **9.5** Add periodic cleanup for very old entries:
  ```javascript
  // Clean up entries older than MAX_CACHE_AGE
  const cleanup = () => {
    const now = Date.now()
    const keysToDelete = []

    for (const [key, timestamp] of cacheTimestamps) {
      if (now - timestamp > MAX_CACHE_AGE) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      cacheStore.delete(key)
      cacheTimestamps.delete(key)
      const index = cacheAccessOrder.indexOf(key)
      if (index > -1) cacheAccessOrder.splice(index, 1)
    })

    if (keysToDelete.length > 0) {
      console.log(`🗑️ Cleaned up ${keysToDelete.length} old cache entries`)
    }
  }

  // Run cleanup every 5 minutes
  if (process.client) {
    setInterval(cleanup, 5 * 60 * 1000)
  }
  ```
- [ ] **9.6** Add getCacheStats() function for debugging:
  ```javascript
  const getCacheStats = () => {
    return {
      size: cacheStore.size,
      maxSize: MAX_CACHE_SIZE,
      keys: Array.from(cacheStore.keys()),
      accessOrder: [...cacheAccessOrder]
    }
  }
  ```

#### Phase 9B: Testing

- [ ] **9.7** Test cache eviction:
  - [ ] Visit 60 different pages (exceed 50 limit)
  - [ ] Verify oldest are evicted
  - [ ] Check console logs for eviction messages
- [ ] **9.8** Test LRU behavior:
  - [ ] Access page A, then B, then A again
  - [ ] Verify A is not evicted before B
- [ ] **9.9** Test memory usage:
  - [ ] Open DevTools Memory profiler
  - [ ] Navigate many pages
  - [ ] Check memory doesn't grow indefinitely
- [ ] **9.10** Test cleanup:
  - [ ] Keep tab open for 15+ minutes
  - [ ] Verify old entries are cleaned up
- [ ] **9.11** Load test in staging
- [ ] **9.12** Monitor production for memory issues

**Expected Impact:** Stable memory usage, no memory leaks

**Files Changed:**
- `app/composables/useGlobalCache.js`

**Testing:**
- Memory profiling
- Long-running session testing
- Cache behavior verification

---

### Task 10: Add Web Vitals Tracking

**Priority:** MEDIUM | **Effort:** 1 day | **Risk:** LOW

#### Phase 10A: Install & Setup

- [ ] **10.1** Install web-vitals library:
  ```bash
  npm install web-vitals
  ```
- [ ] **10.2** Create new plugin: `app/plugins/web-vitals.client.js`
- [ ] **10.3** Implement Web Vitals tracking:
  ```javascript
  import { onLCP, onFID, onCLS, onFCP, onTTFB } from 'web-vitals'

  export default defineNuxtPlugin((nuxtApp) => {
    if (process.server) return

    const sendToAnalytics = (metric) => {
      // Send to GA4
      if (window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          event_category: 'Web Vitals',
          non_interaction: true,
        })
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals]', metric.name, metric.value, metric)
      }
    }

    // Track all Web Vitals
    onLCP(sendToAnalytics)
    onFID(sendToAnalytics)
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  })
  ```
- [ ] **10.4** Update `app/plugins/analytics.client.js` to handle web vitals events

#### Phase 10B: GA4 Configuration

- [ ] **10.5** Login to Google Analytics 4
- [ ] **10.6** Create custom metrics:
  - [ ] LCP (milliseconds)
  - [ ] FID (milliseconds)
  - [ ] CLS (score)
  - [ ] FCP (milliseconds)
  - [ ] TTFB (milliseconds)
- [ ] **10.7** Create custom report for Web Vitals
- [ ] **10.8** Setup alerts for poor metrics:
  - [ ] LCP > 2500ms
  - [ ] FID > 100ms
  - [ ] CLS > 0.1
- [ ] **10.9** Create dashboard

#### Phase 10C: Testing & Validation

- [ ] **10.10** Test in development:
  - [ ] Check console for Web Vitals logs
  - [ ] Verify values are reasonable
- [ ] **10.11** Test in staging:
  - [ ] Navigate several pages
  - [ ] Check GA4 DebugView for events
  - [ ] Verify events are received
- [ ] **10.12** Deploy to production
- [ ] **10.13** Wait 24 hours for data collection
- [ ] **10.14** Review GA4 reports
- [ ] **10.15** Document baseline metrics:
  - [ ] LCP: ____ ms
  - [ ] FID: ____ ms
  - [ ] CLS: ____
  - [ ] FCP: ____ ms
  - [ ] TTFB: ____ ms

#### Phase 10D: Monitoring Setup

- [ ] **10.16** Create weekly Web Vitals report
- [ ] **10.17** Setup Slack/email alerts for degradations
- [ ] **10.18** Train team on interpreting metrics
- [ ] **10.19** Document target metrics (LCP < 2500ms, etc.)

**Expected Impact:** Data-driven optimization decisions

**Files Changed:**
- `package.json` (add web-vitals)
- `app/plugins/web-vitals.client.js` (new)
- `app/plugins/analytics.client.js` (possibly)

**Testing:**
- Event tracking verification
- GA4 data validation
- Dashboard setup

---

## 🔴 Phase 3: Long-term (Week 4-6)

**Timeline:** 2-3 weeks
**Goal:** Advanced optimizations with A/B testing

### Task 11: Lazy-load GSAP Animation Library

**Priority:** MEDIUM | **Effort:** 1 week | **Risk:** MEDIUM

#### Phase 11A: Audit GSAP Usage

- [ ] **11.1** Search for all GSAP imports:
  ```bash
  grep -r "gsap" app/ --include="*.vue" --include="*.js" > gsap-audit.txt
  ```
- [ ] **11.2** List all components using GSAP
- [ ] **11.3** Categorize by:
  - [ ] Above-the-fold animations (keep in main bundle)
  - [ ] Below-the-fold animations (lazy load)
  - [ ] Interaction-based animations (lazy load)
- [ ] **11.4** Identify components that need GSAP immediately
- [ ] **11.5** Identify components where GSAP can be deferred

#### Phase 11B: Implement Lazy Loading

- [ ] **11.6** Create GSAP composable: `app/composables/useGSAP.js`
  ```javascript
  let gsapInstance = null
  let gsapPromise = null

  export function useGSAP() {
    const loadGSAP = async () => {
      if (gsapInstance) return gsapInstance

      if (!gsapPromise) {
        gsapPromise = import('gsap').then(module => {
          gsapInstance = module.default
          return gsapInstance
        })
      }

      return gsapPromise
    }

    return { loadGSAP }
  }
  ```
- [ ] **11.7** Update components to use lazy GSAP:
  ```javascript
  // OLD:
  import gsap from 'gsap'

  // NEW:
  const { loadGSAP } = useGSAP()

  async function animate() {
    const gsap = await loadGSAP()
    gsap.to(element, { opacity: 1 })
  }
  ```
- [ ] **11.8** Add loading states to prevent FOUC
- [ ] **11.9** Preload GSAP on pages that need it immediately
- [ ] **11.10** Update each component (one at a time, test each)

#### Phase 11C: Testing

- [ ] **11.11** Test all animations still work
- [ ] **11.12** Test no flash of unstyled content
- [ ] **11.13** Test animation timing is correct
- [ ] **11.14** Check bundle size reduction
- [ ] **11.15** Performance test with Lighthouse
- [ ] **11.16** Deploy to staging
- [ ] **11.17** A/B test with 10% traffic
- [ ] **11.18** Monitor for issues
- [ ] **11.19** Full rollout

**Expected Impact:** 60-70KB reduction on pages without animations

**Files Changed:**
- `app/composables/useGSAP.js` (new)
- All components using GSAP

**Testing:**
- Animation functionality
- Visual regression
- Bundle size analysis

---

### Task 12: Optimize MutationObserver Scope

**Priority:** LOW | **Effort:** 2 days | **Risk:** LOW

- [ ] **12.1** Open `app/plugins/image-optimization.client.js`
- [ ] **12.2** Locate MutationObserver setup (lines 66-97)
- [ ] **12.3** Change from observing entire body to specific containers:
  ```javascript
  // OLD: observer.observe(document.body, { ... })
  // NEW:
  const containers = document.querySelectorAll('.main-content, .article-column, .sidebar')
  containers.forEach(container => {
    observer.observe(container, {
      childList: true,
      subtree: true
    })
  })
  ```
- [ ] **12.4** Add debouncing to observer callback:
  ```javascript
  let optimizeTimeout
  const debouncedOptimize = () => {
    clearTimeout(optimizeTimeout)
    optimizeTimeout = setTimeout(() => {
      optimizeImages()
      observeImages()
    }, 100)
  }
  ```
- [ ] **12.5** Test on pages with dynamic content
- [ ] **12.6** Verify images still optimized
- [ ] **12.7** Profile CPU usage (should be lower)
- [ ] **12.8** Deploy to staging
- [ ] **12.9** Deploy to production

**Expected Impact:** Lower CPU usage on pages with frequent DOM updates

**Files Changed:**
- `app/plugins/image-optimization.client.js`

**Testing:**
- Image optimization verification
- CPU profiling
- Dynamic content testing

---

### Task 13: Implement Route-based Prerendering

**Priority:** HIGH | **Effort:** 1 week | **Risk:** HIGH

#### Phase 13A: Setup ISR

- [ ] **13.1** Research Nuxt ISR (Incremental Static Regeneration)
- [ ] **13.2** Update `nuxt.config.ts`:
  ```typescript
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [
        '/',
        '/fudbal',
        '/kosarka',
        '/tenis',
        '/odbojka',
        '/ostali-sportovi',
        '/najnovije-vesti',
      ]
    },
    routeRules: {
      // Prerender with ISR
      '/': { isr: 300 }, // Regenerate every 5 min
      '/fudbal': { isr: 300 },
      // ... etc
    }
  }
  ```
- [ ] **13.3** Test prerendering locally
- [ ] **13.4** Verify static HTML generated
- [ ] **13.5** Test ISR regeneration

#### Phase 13B: Cache Invalidation

- [ ] **13.6** Setup webhook endpoint for content updates
- [ ] **13.7** Create API route: `server/api/revalidate.post.ts`
  ```typescript
  export default defineEventHandler(async (event) => {
    // Verify auth token
    const body = await readBody(event)

    // Revalidate specific routes
    // Implementation depends on deployment platform

    return { revalidated: true }
  })
  ```
- [ ] **13.8** Configure CMS to call webhook on publish
- [ ] **13.9** Test cache invalidation

#### Phase 13C: Deployment

- [ ] **13.10** Deploy to staging
- [ ] **13.11** Test prerendered pages load
- [ ] **13.12** Test ISR regeneration
- [ ] **13.13** Test cache invalidation webhook
- [ ] **13.14** Load test with high traffic
- [ ] **13.15** A/B test with 10% traffic
- [ ] **13.16** Monitor for stale content
- [ ] **13.17** Full rollout

**Expected Impact:** <500ms load time for category pages

**Files Changed:**
- `nuxt.config.ts`
- `server/api/revalidate.post.ts` (new)

**Testing:**
- ISR functionality
- Cache invalidation
- Content freshness

---

### Task 14: Add Resource Hints for Critical Assets

**Priority:** MEDIUM | **Effort:** 2 days | **Risk:** LOW

#### Phase 14A: Identify Critical Assets

- [ ] **14.1** Run Lighthouse audit
- [ ] **14.2** Check "Preload key requests" opportunity
- [ ] **14.3** Identify LCP image(s)
- [ ] **14.4** Identify critical fonts
- [ ] **14.5** Identify critical JavaScript chunks
- [ ] **14.6** Create priority list

#### Phase 14B: Add Resource Hints

- [ ] **14.7** Open `nuxt.config.ts`
- [ ] **14.8** Add to app.head.link section (lines 119-147):
  ```typescript
  // Preload LCP image
  {
    rel: 'preload',
    as: 'image',
    href: '/images/hero-image.jpg', // Replace with actual LCP image
    fetchpriority: 'high'
  },
  // Preload critical fonts
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/roboto-400.woff2',
    type: 'font/woff2',
    crossorigin: 'anonymous'
  },
  // Prefetch likely next pages
  {
    rel: 'prefetch',
    href: '/fudbal'
  },
  ```
- [ ] **14.9** Add dynamic preloads in page components:
  ```javascript
  useHead({
    link: [
      {
        rel: 'preload',
        as: 'image',
        href: article.featImage
      }
    ]
  })
  ```

#### Phase 14C: Testing

- [ ] **14.10** Test with Lighthouse (check LCP improvement)
- [ ] **14.11** Test with WebPageTest
- [ ] **14.12** Measure before/after LCP
- [ ] **14.13** Verify no over-preloading (bandwidth waste)
- [ ] **14.14** Deploy to staging
- [ ] **14.15** Deploy to production
- [ ] **14.16** Monitor Web Vitals for improvement

**Expected Impact:** 200-500ms faster LCP

**Files Changed:**
- `nuxt.config.ts`
- Individual page components (for dynamic preloads)

**Testing:**
- Lighthouse audits
- LCP measurement
- Network waterfall analysis

---

## 🆕 Phase 4: Modern Performance (NEW - Week 5-6)

**Timeline:** 2 weeks
**Goal:** Leverage modern browser APIs and optimization techniques

### Task 15: Optimize Nuxt Image Usage

**Priority:** HIGH | **Effort:** 1 week | **Risk:** LOW

#### Phase 15A: Audit Current Image Usage
- [ ] **15.1** Scan all components for `<img>` tags:
  ```bash
  grep -r "<img" app/components/ app/views/ app/pages/ > image-audit.txt
  ```
- [ ] **15.2** List priority components to migrate:
  - [ ] NewsCard.vue
  - [ ] Featured.vue
  - [ ] ArticlePage.vue
  - [ ] NewsGrid.vue
  - [ ] Header.vue (logo)
- [ ] **15.3** Document current image sizes and formats

#### Phase 15B: Implement NuxtImg Components
- [ ] **15.4** Update NewsCard.vue to use `<NuxtImg preset="newsCard">`
- [ ] **15.5** Update Featured.vue to use `<NuxtImg preset="featured">`
- [ ] **15.6** Update article content images with responsive sizes
- [ ] **15.7** Update thumbnail images with `preset="thumb"`
- [ ] **15.8** Test all components render correctly
- [ ] **15.9** Verify WebP conversion working
- [ ] **15.10** Measure image size reduction with DevTools

**Expected Impact:** 30-50% reduction in image data transfer

**Files to Update:**
- `app/components/NewsCard.vue`
- `app/components/Featured.vue`
- `app/views/ArticlePage.vue`
- `app/components/NewsGrid.vue`

---

### Task 16: Enable Font Subsetting

**Priority:** MEDIUM | **Effort:** 30 min | **Risk:** LOW

- [ ] **16.1** Open `nuxt.config.ts`
- [ ] **16.2** Find Google Fonts link configuration
- [ ] **16.3** Add `&subset=latin,latin-ext` parameter
- [ ] **16.4** Test fonts render correctly
- [ ] **16.5** Measure font file size reduction in DevTools Network tab
- [ ] **16.6** Deploy to production

**Expected Savings:** 20-30% reduction in font file sizes

**Files Changed:**
- `nuxt.config.ts`

---

### Task 17: Implement Progressive Hydration

**Priority:** HIGH | **Effort:** 2 days | **Risk:** MEDIUM

#### Phase 17A: Identify Components for Lazy Hydration
- [ ] **17.1** List below-the-fold interactive components:
  - [ ] Comments section
  - [ ] Newsletter signup
  - [ ] Social media embeds
  - [ ] Related articles
  - [ ] Search modal
- [ ] **17.2** Create skeleton components for fallbacks

#### Phase 17B: Wrap with ClientOnly
- [ ] **17.3** Wrap CommentsSection with `<ClientOnly>` + skeleton
- [ ] **17.4** Wrap Newsletter with `<ClientOnly>` + skeleton
- [ ] **17.5** Wrap social embeds with `<ClientOnly>` (if any)
- [ ] **17.6** Test hydration timing with DevTools
- [ ] **17.7** Measure TTI improvement
- [ ] **17.8** Verify components still work correctly

**Expected Impact:** 200-400ms faster Time to Interactive

**Files to Update:**
- `app/views/ArticlePage.vue`
- `app/components/Newsletter.vue`
- Create: `app/components/skeletons/CommentsSkeleton.vue`

---

### Task 18: Add Speculation Rules API

**Priority:** MEDIUM | **Effort:** 1 hour | **Risk:** LOW

- [ ] **18.1** Open `app/layouts/default.vue` or `app.vue`
- [ ] **18.2** Add speculation rules script in `<script setup>`:
  ```javascript
  if (process.client && 'speculation' in HTMLScriptElement) {
    useHead({
      script: [{
        type: 'speculationrules',
        innerHTML: JSON.stringify({
          prerender: [{
            where: { href_matches: "/*" },
            eagerness: "moderate"
          }]
        })
      }]
    })
  }
  ```
- [ ] **18.3** Test in Chrome DevTools (Application > Speculative Loads)
- [ ] **18.4** Verify instant navigation works
- [ ] **18.5** Deploy to production

**Expected Impact:** Near-instant page transitions for Chrome users (65% of traffic)

**Files to Update:**
- `app/layouts/default.vue` or `app.vue`

---

### Task 19: Optimize Third-Party Scripts

**Priority:** HIGH | **Effort:** 1 week | **Risk:** MEDIUM

#### Phase 19A: Audit Third-Party Scripts
- [ ] **19.1** List all third-party scripts:
  - [ ] Google Analytics / GTM
  - [ ] Social media embeds
  - [ ] Ad networks
  - [ ] Other tracking scripts
- [ ] **19.2** Measure current TBT (Total Blocking Time) with Lighthouse

#### Phase 19B: Install Partytown
- [ ] **19.3** Install Partytown: `npm install @builder.io/partytown`
- [ ] **19.4** Add to nuxt.config.ts modules: `'@builder.io/partytown-nuxt'`
- [ ] **19.5** Move GTM/GA to Partytown worker
- [ ] **19.6** Test analytics still tracking correctly
- [ ] **19.7** Measure TBT reduction

#### Phase 19C: Implement Social Embed Facades
- [ ] **19.8** Create click-to-load facade for Twitter embeds
- [ ] **19.9** Create click-to-load facade for Facebook embeds
- [ ] **19.10** Create click-to-load facade for Instagram embeds
- [ ] **19.11** Test all embeds load on click

**Expected Impact:** 500-800ms reduction in Total Blocking Time

**Files to Update:**
- `nuxt.config.ts`
- `package.json`
- Social embed components (if any)

---

### Task 20: Implement Service Worker Caching

**Priority:** HIGH | **Effort:** 3 days | **Risk:** MEDIUM

#### Phase 20A: Install PWA Module
- [ ] **20.1** Install: `npm install @vite-pwa/nuxt`
- [ ] **20.2** Add to nuxt.config.ts modules: `'@vite-pwa/nuxt'`
- [ ] **20.3** Configure caching strategies:
  ```typescript
  pwa: {
    strategies: 'injectManifest',
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/meridian\.mpanel\.app\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }
          }
        },
        {
          urlPattern: /^https:\/\/.*\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-cache' }
        }
      ]
    }
  }
  ```

#### Phase 20B: Test Service Worker
- [ ] **20.4** Build production: `npm run build`
- [ ] **20.5** Test offline functionality
- [ ] **20.6** Test cache updates correctly
- [ ] **20.7** Verify service worker registration
- [ ] **20.8** Test on multiple browsers
- [ ] **20.9** Deploy to production

**Expected Impact:** 80-95% faster repeat visits

**Files to Update:**
- `nuxt.config.ts`
- `package.json`

---

### Task 21: Add Conditional Polyfills

**Priority:** LOW | **Effort:** 30 min | **Risk:** LOW

- [ ] **21.1** Open `nuxt.config.ts`
- [ ] **21.2** Update vite.build configuration:
  ```typescript
  vite: {
    build: {
      target: 'es2020',
      modulePreload: true,
      cssCodeSplit: true
    }
  }
  ```
- [ ] **21.3** Test in modern browsers (Chrome, Firefox, Edge, Safari)
- [ ] **21.4** Test in older browsers (if needed)
- [ ] **21.5** Measure bundle size reduction
- [ ] **21.6** Deploy to production

**Expected Impact:** 15-25KB smaller bundle for 90% of users

**Files Changed:**
- `nuxt.config.ts`

---

### Task 22: Critical Request Chains Optimization

**Priority:** MEDIUM | **Effort:** 2 hours | **Risk:** LOW

- [ ] **22.1** Open `nuxt.config.ts`
- [ ] **22.2** Add font preload to head.link:
  ```typescript
  {
    rel: 'preload',
    as: 'font',
    type: 'font/woff2',
    href: '/fonts/roboto-v30-latin-regular.woff2',
    crossorigin: 'anonymous'
  }
  ```
- [ ] **22.3** Add hero image preload in page components (dynamic)
- [ ] **22.4** Test with Lighthouse (check request chains)
- [ ] **22.5** Measure LCP improvement
- [ ] **22.6** Deploy to production

**Expected Impact:** 150-250ms faster LCP

**Files to Update:**
- `nuxt.config.ts`
- `app/pages/index.vue` (hero image preload)
- `app/views/ArticlePage.vue` (featured image preload)

---

## Summary Checklist

### Phase 1 Status 🟡
- [ ] Task 1: CSS Code Splitting - ❌ NOT DONE
- [ ] Task 2: Resize Debouncing - Status unknown
- [ ] Task 3: GTM Polling - Status unknown
- [ ] Task 4: SWR Cache - Status unknown
- [ ] Deployed to production
- [ ] 24-hour monitoring completed
- [ ] Results documented
- [ ] Stakeholders notified

### Phase 2 Complete ✅
- [ ] All Phase 2 tasks completed
- [ ] Deployed to production
- [ ] 1-week monitoring completed
- [ ] Web Vitals baseline established
- [ ] Results documented

### Phase 3 Status 🔴
- [ ] All Phase 3 tasks completed
- [ ] Deployed to production
- [ ] 2-week monitoring completed
- [ ] Final performance report created
- [ ] Success metrics achieved

### Phase 4 Status (NEW) 🆕
- [ ] Task 15: Nuxt Image optimization - NOT STARTED
- [ ] Task 16: Font subsetting - NOT STARTED
- [ ] Task 17: Progressive hydration - NOT STARTED
- [ ] Task 18: Speculation Rules API - NOT STARTED
- [ ] Task 19: Third-party script optimization - NOT STARTED
- [ ] Task 20: Service Worker caching - NOT STARTED
- [ ] Task 21: Conditional polyfills - NOT STARTED
- [ ] Task 22: Critical request chains - NOT STARTED

---

## Performance Targets

### Before Optimization (Baseline)
- [ ] **Measure:** LCP = ____ ms
- [ ] **Measure:** FID = ____ ms
- [ ] **Measure:** CLS = ____
- [ ] **Measure:** Bundle size = ____ KB
- [ ] **Measure:** TTFB = ____ ms

### After Phase 1 (Target)
- [ ] **Target:** 15-25% improvement in LCP
- [ ] **Target:** 40-60KB smaller CSS per page
- [ ] **Target:** 80% fewer category page SSR requests

### After Phase 2 (Target)
- [ ] **Target:** 30-40% bundle reduction
- [ ] **Target:** 3-5x faster comment loading
- [ ] **Target:** All Web Vitals in "Good" range

### After Phase 3 (Target)
- [ ] **Target:** 50%+ overall improvement
- [ ] **Target:** LCP < 1.5s
- [ ] **Target:** Category pages < 500ms

---

**Last Updated:** 2025-10-29
**Status:** Phase 1 Partial, Phase 4 Added with New Modern Recommendations
