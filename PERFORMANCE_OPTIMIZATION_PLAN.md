# Performance Optimization Plan - Meridian Sport

**Project:** Meridian Sport News Portal (Nuxt 4)
**Target:** 100,000+ daily users
**Current Status:** Well-optimized SSR site with existing performance features
**Goal:** Improve site loading speed through targeted optimizations

---

## Executive Summary

Analysis of the codebase identified **13 specific performance bottlenecks** that can be addressed to significantly improve loading speed. The site is already well-optimized with SSR, proper caching, image optimization, and code splitting. These recommendations focus on incremental improvements with clear impact/effort/risk assessments.

**Expected Overall Impact:**
- Phase 1: 15-25% faster initial load
- Phase 2: 30-40% bundle size reduction
- Phase 3: 50%+ improvement in key metrics

---

## Performance Issues Identified

### Critical Bottlenecks
1. **CSS bundling** - All CSS downloaded upfront (affects all page loads)
2. **Sequential comment fetching** - Multi-page comments load sequentially instead of parallel
3. **FontAwesome bundle size** - Entire icon library loaded (~150KB)
4. **Font file size** - All font weights/variants loaded (~500KB)
5. **GTM polling overhead** - 100ms interval for 15 seconds
6. **No performance metrics** - Can't measure improvements

### Performance Drains
7. **Unthrottled resize events** - Causes jank during window resize
8. **MutationObserver scope** - Watches entire DOM for image changes
9. **Global cache memory leak** - Map never cleared, grows indefinitely
10. **Short SWR cache** - 60s cache means frequent re-fetching
11. **GSAP always loaded** - Animation library in main bundle
12. **No static prerendering** - All pages SSR on-demand
13. **Missing resource hints** - No prefetch for critical assets

---

## Recommendations Matrix

### 🟢 Phase 1: Quick Wins (High Impact, Low Effort, Low Risk)

#### 1. Enable CSS Code Splitting ⚡
- **Impact:** 🔥🔥🔥 **HIGH** - Users download only CSS for current page
- **Effort:** ⚡ **LOW** - Single config change
- **Risk:** 🟢 **LOW** - Standard Nuxt feature, well-tested
- **File:** `nuxt.config.ts` (around line 191)
- **Status:** ❌ **NOT DONE** - Still set to `false` in config
- **Change:**
  ```typescript
  cssCodeSplit: false, // OLD ❌
  cssCodeSplit: true,  // NEW ✅
  ```
- **Expected Savings:** 40-60KB on initial load (per page)
- **Production Risk:** Minimal - CSS still loads correctly, just split by route

---

#### 2. Add Resize Event Debouncing ⚡
- **Impact:** 🔥🔥 **MEDIUM** - Eliminates jank during window resize
- **Effort:** ⚡ **LOW** - Add debounce utility
- **Risk:** 🟢 **LOW** - Standard optimization pattern
- **File:** `app/components/NewsSlider.vue:191`
- **Change:** Add debounce wrapper to resize listener
- **Expected Improvement:** Smoother scrolling/resizing, less CPU usage
- **Production Risk:** None - Progressive enhancement

---

#### 3. Optimize GTM Polling ⚡
- **Impact:** 🔥🔥 **MEDIUM** - Removes unnecessary CPU polling
- **Effort:** ⚡ **LOW** - Replace setInterval with timeout-based check
- **Risk:** 🟢 **LOW** - Better practice, same functionality
- **File:** `app/plugins/analytics.client.js:71-75`
- **Current:** Polls every 100ms for 15 seconds (150 iterations)
- **Change:** Check only when needed, with exponential backoff
- **Expected Improvement:** Reduced main thread blocking
- **Production Risk:** Minimal - GTM still loads correctly

---

#### 4. Increase SWR Cache Duration ⚡
- **Impact:** 🔥🔥 **MEDIUM** - Fewer server requests, faster responses
- **Effort:** ⚡ **LOW** - Config change
- **Risk:** 🟢 **LOW** - Content can be 5 minutes old (acceptable for news)
- **File:** `nuxt.config.ts:48-65`
- **Current:** 60 seconds SWR cache
- **Change:** Increase to 300 seconds (5 minutes) for category pages
- **Expected Improvement:** 80% reduction in category page SSR load
- **Production Risk:** Low - News updates every few minutes acceptable

---

### 🟡 Phase 2: Medium Priority (Medium Impact, Medium Effort, Low-Medium Risk)

#### 5. Parallelize Comment Fetching ⚙️
- **Impact:** 🔥🔥🔥 **HIGH** - Multi-page comments load 3-5x faster
- **Effort:** ⚙️ **MEDIUM** - Refactor async loop to Promise.all
- **Risk:** 🟡 **MEDIUM** - Must test pagination thoroughly
- **File:** `app/services/api.js:304-346`
- **Current:** Sequential while loop - each page waits for previous
- **Change:** Parallel Promise.all for all pages
- **Expected Improvement:** Articles with 100+ comments load 3-5x faster
- **Production Risk:** Medium - Requires thorough testing of edge cases
- **Testing Required:**
  - Articles with 0 comments
  - Articles with 1 page of comments
  - Articles with 10+ pages of comments
  - API rate limiting behavior

---

#### 6. Tree-shake FontAwesome Icons ⚙️
- **Impact:** 🔥🔥🔥 **HIGH** - Reduce bundle by 80-100KB
- **Effort:** ⚙️ **MEDIUM** - Audit all components, import only used icons
- **Risk:** 🟡 **MEDIUM** - Must ensure all icons still load
- **Files:** `package.json`, all Vue components
- **Current:** All FontAwesome icon sets loaded (solid, brands, regular)
- **Change:** Import only specific icons used in app
- **Expected Savings:** 80-100KB JavaScript bundle reduction
- **Production Risk:** Medium - Missing icons if audit incomplete
- **Implementation Steps:**
  1. Audit all components for icon usage
  2. Create icon registry with only used icons
  3. Remove unused FontAwesome packages
  4. Visual regression test all pages

---

#### 7. Optimize Font Loading ⚙️
- **Impact:** 🔥🔥 **MEDIUM** - Reduce bundle by 200-300KB
- **Effort:** ⚙️ **MEDIUM** - Load only required weights/variants
- **Risk:** 🟡 **MEDIUM** - Visual changes if wrong weights removed
- **Files:** `package.json:15-19`, CSS files
- **Current:** 5 font families with all weights loaded via @fontsource
  - Roboto (all weights)
  - Roboto Condensed (all weights)
  - Barlow Condensed (all weights)
  - Urbanist (all weights)
  - Source Sans Pro (all weights)
- **Change:** Load only weights actually used (e.g., 400, 500, 700)
- **Expected Savings:** 200-300KB
- **Production Risk:** Medium - Must verify all font weights in use
- **Testing Required:**
  - Visual regression on all pages
  - Check bold/italic/light variants still render

---

#### 8. Implement Cache Eviction Strategy ⚙️
- **Impact:** 🔥🔥 **MEDIUM** - Prevent memory leaks in long sessions
- **Effort:** ⚙️ **MEDIUM** - Add LRU cache with size limits
- **Risk:** 🟢 **LOW** - Improves stability
- **File:** `app/composables/useGlobalCache.js:10-11`
- **Current:** Map-based cache with no eviction (grows indefinitely)
- **Change:** Implement LRU cache with max 50 items or 10MB limit
- **Expected Improvement:** Stable memory usage in long sessions
- **Production Risk:** Low - Only improves memory management
- **Implementation:** Use simple LRU algorithm or library

---

#### 9. Add Web Vitals Tracking ⚙️
- **Impact:** 🔥🔥 **MEDIUM** - Measure real user performance
- **Effort:** ⚙️ **MEDIUM** - Add web-vitals library + GA4 events
- **Risk:** 🟢 **LOW** - Monitoring only, no user-facing changes
- **Files:** New plugin + `app/plugins/analytics.client.js`
- **Metrics to Track:**
  - LCP (Largest Contentful Paint) - target <2.5s
  - FID (First Input Delay) - target <100ms
  - CLS (Cumulative Layout Shift) - target <0.1
  - TTFB (Time to First Byte) - target <800ms
  - FCP (First Contentful Paint) - target <1.8s
- **Expected Value:** Data-driven optimization decisions
- **Production Risk:** None - passive monitoring

---

### 🔴 Phase 3: Long-term (High Impact, High Effort, Medium-High Risk)

#### 10. Lazy-load GSAP Animation Library 🔧
- **Impact:** 🔥🔥 **MEDIUM** - Reduce initial bundle by 60-70KB
- **Effort:** 🔧 **HIGH** - Refactor all GSAP usage to dynamic imports
- **Risk:** 🟡 **MEDIUM** - Animation timing changes possible
- **Files:** All components using GSAP (NewsGrid.vue, etc.)
- **Current:** GSAP in main bundle (~70KB)
- **Change:** Dynamic import GSAP only when animations needed
- **Expected Savings:** 60-70KB on pages without animations
- **Production Risk:** Medium - Flash of unstyled content if not careful
- **Implementation:**
  ```javascript
  // Before
  import gsap from 'gsap'

  // After
  const gsap = await import('gsap').then(m => m.default)
  ```

---

#### 11. Optimize MutationObserver Scope 🔧
- **Impact:** 🔥 **LOW-MEDIUM** - Reduce CPU overhead on dynamic pages
- **Effort:** ⚙️ **MEDIUM** - Scope observer to specific containers
- **Risk:** 🟢 **LOW** - More efficient, same functionality
- **File:** `app/plugins/image-optimization.client.js:66-97`
- **Current:** Observes entire `document.body` for image additions
- **Change:** Observe only `.main-content` or specific containers
- **Expected Improvement:** Lower CPU usage on pages with frequent DOM updates
- **Production Risk:** Low - Images still optimized, just more efficiently

---

#### 12. Implement Route-based Prerendering 🔧
- **Impact:** 🔥🔥🔥 **HIGH** - Near-instant loads for key pages
- **Effort:** 🔧 **HIGH** - Setup static generation for category pages
- **Risk:** 🔴 **HIGH** - Cache invalidation complexity
- **File:** `nuxt.config.ts:40-42`
- **Current:** `crawlLinks: false` - no prerendering
- **Change:** Prerender category pages (/fudbal, /kosarka, etc.)
- **Expected Improvement:** <500ms load time for category pages
- **Production Risk:** High - Stale content if cache not invalidated
- **Challenges:**
  - Need webhook to regenerate on content updates
  - ISR (Incremental Static Regeneration) setup
  - Fallback for dynamic content

---

#### 13. Add Resource Hints for Critical Assets 🔧
- **Impact:** 🔥🔥 **MEDIUM** - Faster first paint, better LCP
- **Effort:** ⚙️ **MEDIUM** - Add prefetch/preload for critical resources
- **Risk:** 🟢 **LOW** - Progressive enhancement
- **File:** `nuxt.config.ts:119-147`
- **Current:** Preconnect to API and S3, but no asset preloading
- **Change:** Add preload for critical resources
  ```html
  <link rel="preload" as="image" href="hero-image.jpg">
  <link rel="preload" as="font" href="roboto-400.woff2" crossorigin>
  <link rel="prefetch" href="/fudbal">
  ```
- **Expected Improvement:** 200-500ms faster LCP
- **Production Risk:** Low - Over-preloading can hurt, but manageable

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days, minimal risk)
**Timeline:** Week 1
**Goal:** Achieve 15-25% faster initial load with minimal risk

#### Tasks:
1. ✅ Enable CSS code splitting (30 min)
2. ✅ Add resize debouncing (1 hour)
3. ✅ Optimize GTM polling (1 hour)
4. ✅ Increase SWR cache duration (30 min)
5. ✅ Test on staging (4 hours)
6. ✅ Deploy to production with monitoring (1 hour)

**Expected Results:**
- Initial load: 15-25% faster
- CSS payload: 40-60KB smaller per page
- CPU usage: 10-15% reduction
- Server load: 80% fewer category page SSR requests

**Rollback Plan:**
- CSS splitting: Revert config if CSS loading issues
- Resize: No rollback needed (progressive)
- GTM: Revert if analytics drop
- SWR: Reduce if content too stale

---

### Phase 2: Medium Priority (1 week, test thoroughly)
**Timeline:** Week 2-3
**Goal:** Achieve 30-40% bundle reduction with thorough testing

#### Tasks:
1. ✅ Parallelize comment fetching (1 day)
   - Refactor API function
   - Test edge cases (0, 1, 10+ pages)
   - Monitor API rate limits
2. ✅ Tree-shake FontAwesome (2 days)
   - Audit all icon usage
   - Create icon registry
   - Visual regression test
3. ✅ Optimize font loading (1 day)
   - Audit font weights in use
   - Update package.json
   - Visual regression test
4. ✅ Implement cache eviction (1 day)
   - Add LRU cache logic
   - Test memory usage
5. ✅ Add Web Vitals tracking (1 day)
   - Install web-vitals
   - Setup GA4 events
   - Create dashboard

**Expected Results:**
- Bundle size: 30-40% reduction (280-400KB)
- Comment loading: 3-5x faster for multi-page threads
- Memory: Stable in long sessions
- Metrics: Real user performance data

**Testing Requirements:**
- Full regression test suite
- Performance testing with real data
- A/B test with 10% traffic initially
- Monitor Web Vitals for 1 week

**Rollback Plan:**
- Keep old code branches
- Feature flags for risky changes
- Gradual rollout with monitoring

---

### Phase 3: Long-term (2-3 weeks, staged rollout)
**Timeline:** Week 4-6
**Goal:** Advanced optimizations with A/B testing

#### Tasks:
1. ✅ Lazy-load GSAP (1 week)
   - Audit GSAP usage
   - Implement dynamic imports
   - Test animation timing
2. ✅ Optimize MutationObserver (2 days)
   - Scope to specific containers
   - Test on dynamic pages
3. ✅ Route-based prerendering (1 week)
   - Setup ISR for category pages
   - Implement cache invalidation
   - Setup regeneration webhooks
4. ✅ Add resource hints (2 days)
   - Identify critical assets
   - Add preload/prefetch
   - Measure LCP improvement

**Expected Results:**
- Initial bundle: 60-70KB smaller
- Category pages: <500ms load time
- LCP: 200-500ms improvement
- Overall: 50%+ improvement in key metrics

**Risk Mitigation:**
- A/B test each change
- Monitor Web Vitals closely
- Gradual rollout (10% → 25% → 50% → 100%)
- Keep rollback plan ready

---

## Success Metrics

### Key Performance Indicators

#### Load Time Metrics
- **Current Baseline:** (Measure before Phase 1)
  - Homepage LCP: ~2.5s (estimated)
  - Category page LCP: ~2.0s (estimated)
  - Article page LCP: ~2.2s (estimated)
  - TTFB: ~400ms (estimated)

- **Phase 1 Targets:**
  - Homepage LCP: <2.0s (20% improvement)
  - Category page LCP: <1.6s (20% improvement)
  - TTFB: <350ms (12% improvement)

- **Phase 2 Targets:**
  - Homepage LCP: <1.8s (28% improvement)
  - Article with comments: <2.0s (40% improvement in comment load)
  - Bundle size: <500KB (30% reduction)

- **Phase 3 Targets:**
  - All pages LCP: <1.5s (40% improvement)
  - Category pages: <500ms with prerender
  - FCP: <1.0s

#### Business Metrics
- Bounce rate reduction: 5-10%
- Pages per session: +15%
- Session duration: +20%
- Ad viewability: +10%

### Monitoring Setup
- **Tools:**
  - Google Analytics 4 (Web Vitals)
  - Chrome User Experience Report
  - Lighthouse CI (automated testing)
  - Real User Monitoring (RUM)

- **Alerts:**
  - LCP > 2.5s
  - CLS > 0.1
  - TTFB > 800ms
  - Error rate > 0.5%

---

## Risk Assessment & Mitigation

### High-Risk Changes (Phase 3)

#### Route-based Prerendering
- **Risk:** Stale content shown to users
- **Mitigation:**
  - ISR with 5-minute revalidation
  - Webhook to regenerate on content publish
  - Fallback to SSR if prerendered page >10min old
  - Clear cache button for editors

#### GSAP Lazy Loading
- **Risk:** Flash of unstyled content, animation timing issues
- **Mitigation:**
  - Preload GSAP on pages that need it
  - Skeleton loaders during GSAP load
  - A/B test to verify no visual regressions

### Medium-Risk Changes (Phase 2)

#### Parallel Comment Fetching
- **Risk:** API rate limiting, pagination bugs
- **Mitigation:**
  - Test with articles containing many comment pages
  - Add exponential backoff for rate limits
  - Fallback to sequential if parallel fails
  - Monitor API error rates

#### FontAwesome Tree-shaking
- **Risk:** Missing icons in production
- **Mitigation:**
  - Comprehensive icon audit using grep
  - Visual regression testing on all pages
  - Automated tests for icon rendering
  - Keep backup of old config

### Low-Risk Changes (Phase 1)

#### All Phase 1 changes are low-risk
- Standard optimization patterns
- Well-tested Nuxt features
- Progressive enhancements
- Easy rollback

---

## Testing Strategy

### Pre-deployment Testing

#### 1. Performance Testing
- Lighthouse audits (target: 90+ performance score)
- WebPageTest (multiple locations, devices)
- Chrome DevTools Performance profiling
- Bundle size analysis (webpack-bundle-analyzer)

#### 2. Functional Testing
- Full regression test suite
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile testing (iOS, Android)
- Accessibility testing (WCAG 2.1 AA)

#### 3. Load Testing
- Simulate 100,000 daily users
- Peak traffic scenarios
- API rate limit testing
- Server resource monitoring

### Production Monitoring

#### 1. Real User Monitoring
- Web Vitals (LCP, FID, CLS)
- Custom metrics (comment load time, etc.)
- Error tracking (Sentry or similar)
- Uptime monitoring

#### 2. Business Metrics
- Bounce rate
- Session duration
- Pages per session
- Conversion rates (if applicable)

#### 3. Technical Metrics
- Server CPU/memory usage
- API response times
- Cache hit rates
- CDN performance

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
If critical issues detected:
1. Revert Git commit
2. Rebuild and redeploy
3. Clear CDN cache
4. Monitor error rates

### Gradual Rollback
If issues affect subset of users:
1. Reduce feature flag percentage
2. Monitor metrics
3. Investigate root cause
4. Fix and re-deploy

### Emergency Contacts
- DevOps team: [Contact info]
- Backend team: [Contact info]
- Product owner: [Contact info]

---

## Resource Requirements

### Development Time
- Phase 1: 2 days (1 developer)
- Phase 2: 1 week (1-2 developers)
- Phase 3: 2-3 weeks (2 developers)
- **Total:** 4-6 weeks

### Infrastructure
- Staging environment (existing)
- Performance testing tools (Lighthouse CI)
- Monitoring tools (GA4 + Web Vitals)
- A/B testing setup (feature flags)

### Budget Considerations
- Developer time: Primary cost
- Tools: Mostly free (Lighthouse, GA4)
- Optional: Premium monitoring (Sentry, etc.)
- No infrastructure changes needed

---

## Conclusion

This performance optimization plan provides a structured approach to improving site loading speed for 100,000+ daily users. By focusing on high-impact, low-risk changes first (Phase 1), we can achieve quick wins while building confidence for more complex optimizations in later phases.

The phased approach allows for:
- ✅ **Incremental improvement** - See results quickly
- ✅ **Risk mitigation** - Test thoroughly before high-risk changes
- ✅ **Data-driven decisions** - Measure impact of each phase
- ✅ **Easy rollback** - Revert if issues arise

**Recommended Next Steps:**
1. Review and approve this plan
2. Setup Web Vitals tracking (even before Phase 1)
3. Measure current baseline performance
4. Begin Phase 1 implementation
5. Monitor results and iterate

---

---

## 🆕 NEW RECOMMENDATIONS (2024-2025)

### Phase 4: Modern Performance Patterns (High Impact, Low-Medium Effort)

#### 14. Optimize Nuxt Image Usage 🎨
- **Impact:** 🔥🔥🔥 **HIGH** - Already installed but underutilized
- **Effort:** ⚙️ **MEDIUM** - Replace img tags with NuxtImg/NuxtPicture
- **Risk:** 🟢 **LOW** - @nuxt/image already configured
- **Status:** 🟡 **PARTIAL** - Module installed, not widely used

**Current State:**
- @nuxt/image installed and configured in nuxt.config.ts
- WebP format enabled
- Presets defined (newsCard, featured, thumb, banner)
- Not used in most components (still using regular `<img>` tags)

**Implementation:**
```vue
<!-- Replace regular img tags -->
<img :src="article.image" alt="..." loading="lazy">

<!-- With NuxtImg -->
<NuxtImg
  :src="article.image"
  alt="..."
  preset="newsCard"
  loading="lazy"
  sizes="sm:100vw md:50vw lg:400px"
/>
```

**Benefits:**
- Automatic WebP conversion (already configured)
- Responsive srcset generation
- Lazy loading built-in
- 30-50% file size reduction

**Priority Components to Update:**
1. NewsCard.vue
2. Featured.vue
3. ArticlePage.vue (article images)
4. NewsGrid.vue

**Expected Impact:** 30-50% reduction in image data transfer

---

#### 15. Enable Font Subsetting 📝
- **Impact:** 🔥🔥 **MEDIUM** - Reduce font file sizes
- **Effort:** ⚡ **LOW** - Configure font loading
- **Risk:** 🟢 **LOW** - Progressive enhancement

**Problem:**
- Currently loading full font files from Google Fonts
- Many unused characters in Cyrillic and Latin Extended sets

**Solution:**
```typescript
// nuxt.config.ts - Update link configuration
{
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@400;700&display=swap&subset=latin,latin-ext",
}
```

**Expected Savings:** 20-30% reduction in font file sizes

---

#### 16. Implement Progressive Hydration 💧
- **Impact:** 🔥🔥🔥 **HIGH** - Faster interactivity
- **Effort:** ⚙️ **MEDIUM** - Use lazy hydration components
- **Risk:** 🟡 **MEDIUM** - Requires careful component selection

**Technique:**
Use `<ClientOnly>` wrapper with lazy loading for non-critical interactive components:

```vue
<!-- Defer hydration of comments section -->
<ClientOnly>
  <CommentsSection :article-id="articleId" />
  <template #fallback>
    <CommentsSkeleton />
  </template>
</ClientOnly>
```

**Candidates for Lazy Hydration:**
- Comments section
- Social media embeds
- Newsletter signup
- Related articles (below fold)
- Search modal

**Expected Impact:** 200-400ms faster Time to Interactive (TTI)

---

#### 17. Add Speculation Rules API 🔮
- **Impact:** 🔥🔥 **MEDIUM** - Instant navigation
- **Effort:** ⚡ **LOW** - Add speculation rules
- **Risk:** 🟢 **LOW** - Progressive enhancement, Chrome only

**Implementation:**
Add to `app.vue` or layout:
```vue
<script setup>
if (process.client && 'speculation' in HTMLScriptElement) {
  useHead({
    script: [{
      type: 'speculationrules',
      innerHTML: JSON.stringify({
        prerender: [{
          where: {
            href_matches: "/*"
          },
          eagerness: "moderate"
        }]
      })
    }]
  })
}
</script>
```

**Benefits:**
- Instant page navigation for Chrome users
- Prerender likely next pages
- Zero user-perceived loading time

**Expected Impact:** Near-instant page transitions for 65% of users (Chrome market share)

---

#### 18. Optimize Third-Party Scripts 📦
- **Impact:** 🔥🔥🔥 **HIGH** - Reduce main thread blocking
- **Effort:** ⚙️ **MEDIUM** - Use facade pattern for heavy scripts
- **Risk:** 🟢 **LOW** - Better UX, preserves functionality

**Current Third-Party Scripts:**
- Google Analytics / GTM
- Social media embeds (Twitter, Facebook, Instagram)
- Ad networks (if any)

**Strategy:**
1. **Defer GA/GTM:** Already using `useGtag()` - verify it's deferred
2. **Facade for Social Embeds:** Replace iframe embeds with click-to-load facades
3. **Use Partytown:** Offload third-party scripts to Web Worker

**Implementation (Partytown):**
```bash
npm install @builder.io/partytown
```

```typescript
// nuxt.config.ts
modules: ['@nuxt/image', '@builder.io/partytown-nuxt']
```

**Expected Impact:** 500-800ms reduction in Total Blocking Time (TBT)

---

#### 19. Implement Service Worker Caching 💾
- **Impact:** 🔥🔥🔥 **HIGH** - Offline capability, faster repeat visits
- **Effort:** 🔧 **HIGH** - Requires Workbox or similar
- **Risk:** 🟡 **MEDIUM** - Cache invalidation complexity

**Benefits:**
- Offline article reading
- Instant repeat page loads
- Reduced server load

**Implementation Options:**
1. **Nuxt PWA Module:** `@vite-pwa/nuxt`
2. **Workbox:** Manual service worker with Workbox

**Caching Strategy:**
- **Cache First:** Images, fonts, CSS, JS
- **Network First:** API requests, HTML pages
- **Stale While Revalidate:** Article pages

**Expected Impact:** 80-95% faster repeat visits

---

#### 20. Add Conditional Polyfills 🔄
- **Impact:** 🔥 **LOW-MEDIUM** - Smaller bundles for modern browsers
- **Effort:** ⚙️ **MEDIUM** - Configure differential serving
- **Risk:** 🟢 **LOW** - Graceful degradation

**Current State:**
- Nuxt transpiles to ES2019 by default
- May include unnecessary polyfills for modern browsers

**Solution:**
```typescript
// nuxt.config.ts
vite: {
  build: {
    target: 'es2020', // Modern browsers only
    modulePreload: true,
    cssCodeSplit: true // ← Enable this!
  }
}
```

**Expected Impact:** 15-25KB smaller bundle for 90% of users

---

#### 21. Database Query Optimization (Backend) 🗄️
- **Impact:** 🔥🔥🔥 **HIGH** - Faster TTFB
- **Effort:** 🔧 **HIGH** - Requires backend changes
- **Risk:** 🟡 **MEDIUM** - Database changes need testing

**Frontend Impact:**
- Current TTFB: ~400ms (estimated)
- Target TTFB: <200ms

**Recommendations for Backend Team:**
1. **Add database indexes** on commonly queried fields:
   - articles.category
   - articles.publish_date
   - articles.slug
2. **Implement Redis caching** for:
   - Homepage articles query (5 min cache)
   - Category page queries (5 min cache)
   - Popular articles list (15 min cache)
3. **Use connection pooling** for database
4. **Add query result pagination** limits

**Expected Impact:** 50% reduction in TTFB (400ms → 200ms)

---

#### 22. Implement Critical Request Chains Optimization 🔗
- **Impact:** 🔥🔥 **MEDIUM** - Faster initial render
- **Effort:** ⚙️ **MEDIUM** - Analyze and optimize
- **Risk:** 🟢 **LOW** - Performance enhancement

**Current Request Chains:**
1. HTML → CSS → Fonts → Images
2. HTML → JS → API calls → Render

**Optimizations:**
```typescript
// nuxt.config.ts - Add to head
link: [
  // Preconnect to critical origins (already exists)
  { rel: 'preconnect', href: process.env.NUXT_PUBLIC_BACKEND_URL },

  // NEW: Preload critical fonts
  {
    rel: 'preload',
    as: 'font',
    type: 'font/woff2',
    href: '/fonts/roboto-v30-latin-regular.woff2',
    crossorigin: 'anonymous'
  },

  // NEW: Preload hero image (dynamic per page)
  // Implement in page components
]
```

**Expected Impact:** 150-250ms faster LCP

---

## 📊 Updated Success Metrics

### Current Performance (Estimated based on config):
- **LCP:** ~2.8s
- **FID:** ~150ms
- **CLS:** ~0.08
- **TTFB:** ~400ms
- **Bundle Size:** ~800KB (uncompressed)

### Target After All Phases:
- **LCP:** <2.0s (30% improvement) ✅
- **FID:** <100ms (33% improvement) ✅
- **CLS:** <0.05 (40% improvement) ✅
- **TTFB:** <200ms (50% improvement) ✅
- **Bundle Size:** <500KB (38% reduction) ✅

### Phase 4 Specific Targets:
- **Image data:** -40% (with NuxtImg optimization)
- **Third-party blocking:** -70% (with Partytown)
- **Repeat visit speed:** +90% (with Service Worker)
- **Font loading:** -25% (with subsetting)

---

## 🎯 Prioritized Action Plan (Updated)

### IMMEDIATE (This Week) 🚨
1. **Enable CSS Code Splitting** (5 min) - Easiest win
2. **Start using NuxtImg** in top 5 components (2-3 hours)
3. **Enable font subsetting** (15 min)
4. **Add Speculation Rules** (30 min)

**Expected Impact:** +20-30% performance improvement

### SHORT TERM (Next 2 Weeks) ⚡
5. **Progressive hydration** for comments/newsletter (4 hours)
6. **Optimize third-party scripts** (6 hours)
7. **Complete Phase 2 tasks** from original plan (1 week)

**Expected Impact:** +40-50% performance improvement

### MEDIUM TERM (Next Month) 📅
8. **Implement Service Worker** (2-3 days)
9. **Backend caching optimization** (coordinate with backend team)
10. **Complete all Phase 3 tasks** from original plan

**Expected Impact:** +60-75% performance improvement

---

**Document Version:** 2.0
**Last Updated:** 2025-10-29
**Status:** In Progress - Phase 1 Partially Complete, New Recommendations Added
