# Lighthouse CI Implementation Plan - Meridian Sport

**Document Version:** 1.0
**Date:** October 29, 2025
**Status:** Ready for Implementation

---

## 📋 Executive Summary

This document outlines the implementation of **Lighthouse CI** for automated performance, SEO, and accessibility monitoring on every pull request and deployment. Lighthouse CI will act as an **automated quality gate** to prevent performance regressions and SEO breaks before they reach production.

**Key Benefits:**
- ✅ **Automated Core Web Vitals monitoring** - Catch performance regressions
- ✅ **SEO score tracking** - Prevent meta tag/schema breaks
- ✅ **Performance budgets** - Enforce speed requirements
- ✅ **GitHub PR comments** - Instant feedback on every change
- ✅ **Trend tracking** - Monitor improvements over time

**Expected Outcomes:**
- Zero performance regressions slip to production
- SEO score maintained above 95/100
- LCP under 2.5s, CLS under 0.1
- Accessibility score above 90/100

---

## 🎯 Current Performance Baseline

### Desktop Performance (from October 2025 audits)
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Performance Score** | ~85/100 | 90/100 | 🟡 Needs work |
| **SEO Score** | ~87/100 | 95/100 | 🟡 Needs work |
| **Accessibility** | ~82/100 | 90/100 | 🟡 Needs work |
| **Best Practices** | ~92/100 | 95/100 | 🟢 Good |

### Core Web Vitals
| Metric | Current | Good | Needs Improvement |
|--------|---------|------|-------------------|
| **LCP** (Largest Contentful Paint) | ~3.2s | <2.5s | 2.5-4.0s |
| **FID** (First Input Delay) | ~80ms | <100ms | 100-300ms |
| **CLS** (Cumulative Layout Shift) | ~0.08 | <0.1 | 0.1-0.25 |

**Status:** 🟡 **NEEDS IMPROVEMENT**

---

## 🚀 Implementation Steps

### Phase 1: Basic Setup (Day 1 - 2 hours)

#### Step 1: Install Lighthouse CI

```bash
# Install Lighthouse CI
npm install -D @lhci/cli

# Install Lighthouse for local testing
npm install -D lighthouse
```

#### Step 2: Create Configuration File

```javascript
// lighthouserc.js

module.exports = {
  ci: {
    collect: {
      // Start dev server for testing
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,

      // URLs to test
      url: [
        'http://localhost:3000/',                          // Homepage
        'http://localhost:3000/fudbal/',                   // Category page
        'http://localhost:3000/najnovije-vesti/',          // Latest news
      ],

      // Run multiple times for consistency
      numberOfRuns: 3,

      // Settings
      settings: {
        // Mobile-first (most of your traffic)
        preset: 'mobile',
        // Don't throttle on CI (already slow)
        throttlingMethod: 'provided',
      },
    },

    assert: {
      preset: 'lighthouse:recommended',

      assertions: {
        // ========================================
        // PERFORMANCE BUDGETS
        // ========================================

        // Core Web Vitals (strict)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],

        // Other performance metrics
        'speed-index': ['warn', { maxNumericValue: 3500 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],

        // ========================================
        // SEO (CRITICAL - Revenue dependent)
        // ========================================

        'meta-description': 'error',                       // Must have description
        'document-title': 'error',                         // Must have title
        'html-has-lang': 'error',                          // Must specify language
        'link-text': 'warn',                               // Descriptive link text
        'canonical': 'error',                              // Must have canonical URL

        // Schema.org structured data (custom audit needed)
        // Will add via custom plugin

        // ========================================
        // ACCESSIBILITY
        // ========================================

        'color-contrast': 'warn',                          // Readable text
        'tap-targets': 'warn',                             // Touch-friendly (48x48px)
        'image-alt': 'error',                              // Alt text required
        'button-name': 'error',                            // Accessible buttons
        'link-name': 'error',                              // Accessible links

        // ========================================
        // BEST PRACTICES
        // ========================================

        'uses-https': 'error',                             // HTTPS required
        'no-vulnerable-libraries': 'warn',                 // Security
        'errors-in-console': 'warn',                       // No console errors
        'valid-source-maps': 'off',                        // Don't check in prod

        // ========================================
        // PROGRESSIVE WEB APP (Optional)
        // ========================================

        'viewport': 'error',                               // Responsive viewport
        'installable-manifest': 'off',                     // Not a PWA (yet)
        'splash-screen': 'off',
        'themed-omnibox': 'off',

        // ========================================
        // CUSTOM BUDGETS
        // ========================================

        // Resource counts
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB CSS
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // 1MB images
        'resource-summary:font:size': ['warn', { maxNumericValue: 300000 }], // 300KB fonts

        // Request counts
        'resource-summary:script:count': ['warn', { maxNumericValue: 15 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 5 }],
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 10 }],

        // Categories (scores must be above threshold)
        'categories:performance': ['warn', { minScore: 0.85 }],  // 85/100
        'categories:accessibility': ['warn', { minScore: 0.90 }], // 90/100
        'categories:seo': ['error', { minScore: 0.95 }],         // 95/100 (CRITICAL)
        'categories:best-practices': ['warn', { minScore: 0.92 }],
      },
    },

    upload: {
      // Use temporary public storage (free, 7-day retention)
      target: 'temporary-public-storage',

      // OR use LHCI server (self-hosted, permanent storage)
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },

    // GitHub PR status checks
    githubStatusContextSuffix: '/lighthouse',
  },
}
```

#### Step 3: Add NPM Scripts

```json
// package.json

{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:collect": "lhci collect",
    "lighthouse:assert": "lhci assert",
    "lighthouse:upload": "lhci upload",
    "lighthouse:local": "lighthouse http://localhost:3000 --view"
  }
}
```

#### Step 4: Test Locally

```bash
# Build the app
npm run build

# Run Lighthouse CI locally
npm run lighthouse

# OR run single Lighthouse audit (with viewer)
npm run lighthouse:local
```

---

### Phase 2: GitHub Actions Integration (Day 2 - 2 hours)

#### Step 5: Create GitHub Workflow

```yaml
# .github/workflows/lighthouse.yml

name: Lighthouse CI

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev, main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for better diffing

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          # Add any required env vars
          NODE_ENV: production

      - name: Run Lighthouse CI
        run: npm run lighthouse
        env:
          # GitHub token for PR comments
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci/
          retention-days: 30

      - name: Comment PR with results
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            const fs = require('fs')
            const results = JSON.parse(fs.readFileSync('.lighthouseci/manifest.json'))

            // Extract scores from first run
            const url = Object.keys(results[0])[0]
            const report = results[0][url][0]

            const scores = {
              performance: Math.round(report.summary.performance * 100),
              accessibility: Math.round(report.summary.accessibility * 100),
              bestPractices: Math.round(report.summary['best-practices'] * 100),
              seo: Math.round(report.summary.seo * 100),
            }

            const body = `## 🚦 Lighthouse CI Results

            | Category | Score |
            |----------|-------|
            | 🚀 Performance | ${scores.performance}/100 |
            | ♿ Accessibility | ${scores.accessibility}/100 |
            | ✅ Best Practices | ${scores.bestPractices}/100 |
            | 🔍 SEO | ${scores.seo}/100 |

            [View full report](${report.url})
            `

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            })
```

---

### Phase 3: Custom SEO Audits (Day 3 - 4 hours)

#### Step 6: Create Custom Lighthouse Plugin

Lighthouse doesn't validate Schema.org structured data by default. Let's add a custom audit:

```javascript
// lighthouse-plugin/structured-data-audit.js

module.exports = {
  id: 'structured-data',
  title: 'Valid Schema.org Structured Data',
  description: 'Validates NewsArticle and Organization schemas',

  async audit(artifacts, context) {
    const schemas = artifacts.SchemaScripts || []
    const errors = []
    const warnings = []

    // Check for required schemas
    const hasOrganization = schemas.some(s => s['@type'] === 'Organization')
    const hasNewsArticle = schemas.some(s => s['@type'] === 'NewsArticle')

    if (!hasOrganization) {
      errors.push('Missing Organization schema')
    }

    if (context.url.includes('/fudbal/') || context.url.includes('/kosarka/')) {
      if (!hasNewsArticle) {
        errors.push('Article page missing NewsArticle schema')
      } else {
        // Validate NewsArticle fields
        const article = schemas.find(s => s['@type'] === 'NewsArticle')

        const requiredFields = ['headline', 'datePublished', 'author', 'publisher', 'image']
        for (const field of requiredFields) {
          if (!article[field]) {
            errors.push(`NewsArticle missing required field: ${field}`)
          }
        }

        // Check image licensing (Google Discover requirement)
        if (article.image) {
          if (!article.image.copyrightNotice) {
            warnings.push('Image missing copyrightNotice (recommended for Google Discover)')
          }
          if (!article.image.license) {
            warnings.push('Image missing license (recommended for Google Discover)')
          }
        }
      }
    }

    const score = errors.length === 0 ? 1 : 0

    return {
      score,
      numericValue: errors.length,
      displayValue: errors.length === 0 ? 'All required schemas present' : `${errors.length} errors`,
      details: {
        type: 'table',
        headings: [
          { key: 'type', itemType: 'text', text: 'Type' },
          { key: 'message', itemType: 'text', text: 'Message' },
        ],
        items: [
          ...errors.map(e => ({ type: 'Error', message: e })),
          ...warnings.map(w => ({ type: 'Warning', message: w })),
        ],
      },
    }
  },
}
```

#### Step 7: Register Custom Plugin

```javascript
// lighthouse-plugin/index.js

module.exports = {
  audits: [
    { path: './structured-data-audit.js' },
  ],
}
```

Update `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      // ... existing config
      settings: {
        plugins: ['lighthouse-plugin'],
      },
    },
    // ... rest of config
  },
}
```

---

### Phase 4: Performance Budgets (Day 4 - 2 hours)

#### Step 8: Define Budget File

```json
// lighthouse-budgets.json

[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 500
      },
      {
        "resourceType": "stylesheet",
        "budget": 100
      },
      {
        "resourceType": "image",
        "budget": 1000
      },
      {
        "resourceType": "font",
        "budget": 300
      },
      {
        "resourceType": "document",
        "budget": 50
      },
      {
        "resourceType": "total",
        "budget": 2000
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "script",
        "budget": 15
      },
      {
        "resourceType": "stylesheet",
        "budget": 5
      },
      {
        "resourceType": "third-party",
        "budget": 10
      }
    ],
    "timings": [
      {
        "metric": "first-contentful-paint",
        "budget": 1800
      },
      {
        "metric": "largest-contentful-paint",
        "budget": 2500
      },
      {
        "metric": "interactive",
        "budget": 3800
      },
      {
        "metric": "cumulative-layout-shift",
        "budget": 0.1
      },
      {
        "metric": "total-blocking-time",
        "budget": 300
      }
    ]
  },
  {
    "path": "/fudbal/*",
    "timings": [
      {
        "metric": "largest-contentful-paint",
        "budget": 3000
      }
    ]
  }
]
```

Update `lighthouserc.js` to use budgets:

```javascript
module.exports = {
  ci: {
    collect: {
      // ... existing config
      settings: {
        budgetsPath: './lighthouse-budgets.json',
      },
    },
    // ... rest of config
  },
}
```

---

## 📊 Monitoring & Reporting

### Option 1: Temporary Public Storage (Free, Simple)

**Pros:**
- ✅ Zero setup
- ✅ Works out-of-the-box
- ✅ Public shareable links

**Cons:**
- ❌ 7-day retention only
- ❌ No trend tracking
- ❌ No historical comparisons

**Best for:** Getting started quickly

### Option 2: LHCI Server (Self-Hosted, Full-Featured)

**Pros:**
- ✅ Permanent storage
- ✅ Trend graphs
- ✅ Historical comparisons
- ✅ Multiple projects
- ✅ Custom dashboards

**Cons:**
- ❌ Requires hosting (Docker/Heroku)
- ❌ Setup effort

**Best for:** Long-term monitoring

#### Setting Up LHCI Server (Optional)

```bash
# Using Docker
docker run -p 9001:9001 \
  -v $(pwd)/lhci-data:/data \
  patrickhulce/lhci-server

# OR using Heroku
git clone https://github.com/GoogleChrome/lighthouse-ci.git
cd lighthouse-ci
heroku create your-lhci-server
git push heroku main
```

Update `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    upload: {
      target: 'lhci',
      serverBaseUrl: 'https://your-lhci-server.herokuapp.com',
      token: process.env.LHCI_TOKEN,
    },
  },
}
```

---

## 🎯 Success Metrics

### Week 1: Baseline Established
- ✅ Lighthouse CI running on every PR
- ✅ Baseline scores documented
- ✅ GitHub PR comments working
- ✅ Team familiar with reports

### Month 1: Improvements Visible
- ✅ Performance score: 85 → 90/100
- ✅ SEO score: 87 → 95/100
- ✅ LCP: 3.2s → 2.5s
- ✅ Zero regressions merged

### Month 3: Excellence Achieved
- ✅ Performance score: 90+/100
- ✅ SEO score: 95+/100
- ✅ Accessibility: 90+/100
- ✅ All Core Web Vitals "Good"
- ✅ Trend tracking enabled

---

## 🚨 Handling Failing Audits

### When Lighthouse Fails Your PR

**Step 1: Review the Report**
- Click the Lighthouse report link in PR comments
- Identify which metrics failed

**Step 2: Common Fixes**

#### LCP Too High (>2.5s)
```javascript
// Fixes:
// 1. Preload hero image
<link rel="preload" as="image" href="/hero.jpg">

// 2. Use NuxtPicture with proper sizes
<NuxtPicture sizes="(max-width: 768px) 100vw, 800px" />

// 3. Defer non-critical CSS
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">
```

#### CLS Too High (>0.1)
```css
/* Fixes: */
/* 1. Reserve space for images */
img {
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
}

/* 2. Avoid layout shifts from ads/embeds */
.ad-container {
  min-height: 250px;
}
```

#### SEO Score Low (<95)
```html
<!-- Fixes: -->
<!-- 1. Add missing meta description -->
<meta name="description" content="...">

<!-- 2. Add canonical URL -->
<link rel="canonical" href="https://meridiansport.rs/...">

<!-- 3. Fix structured data -->
<script type="application/ld+json">
{
  "@type": "NewsArticle",
  "headline": "...",
  "datePublished": "...",
  "author": {...},
  "publisher": {...},
  "image": {...}
}
</script>
```

**Step 3: Re-run CI**
```bash
# Push fixes
git add .
git commit -m "fix: improve Lighthouse scores"
git push

# CI will automatically re-run
```

---

## 🔄 Continuous Improvement

### Monthly Reviews
- Review Lighthouse trends
- Identify recurring issues
- Update budgets as site improves
- Share wins with team

### Quarterly Goals
- Q1: Establish baseline + fix critical issues
- Q2: Achieve "Good" on all Core Web Vitals
- Q3: Maintain 90+ scores, focus on advanced optimizations
- Q4: Compete for top performance rankings

---

## ✅ Implementation Checklist

**Day 1: Setup**
- [ ] Install `@lhci/cli`
- [ ] Create `lighthouserc.js`
- [ ] Run locally: `npm run lighthouse`
- [ ] Document baseline scores

**Day 2: CI/CD**
- [ ] Create `.github/workflows/lighthouse.yml`
- [ ] Test on PR
- [ ] Verify GitHub comments work
- [ ] Fix any failing assertions

**Day 3: Custom Audits**
- [ ] Create `lighthouse-plugin/structured-data-audit.js`
- [ ] Register plugin in config
- [ ] Test schema validation
- [ ] Update assertions

**Day 4: Budgets**
- [ ] Create `lighthouse-budgets.json`
- [ ] Define resource budgets
- [ ] Define timing budgets
- [ ] Update config to use budgets

**Week 2: Optimization**
- [ ] Fix LCP issues
- [ ] Fix CLS issues
- [ ] Improve SEO score to 95+
- [ ] Improve Accessibility to 90+

**Ongoing:**
- [ ] Monitor trends
- [ ] Update budgets as site improves
- [ ] Share reports with team
- [ ] Celebrate improvements!

---

## 📚 Resources

- Lighthouse CI Docs: https://github.com/GoogleChrome/lighthouse-ci
- Performance Budgets: https://web.dev/performance-budgets-101/
- Core Web Vitals: https://web.dev/vitals/
- Custom Audits: https://github.com/GoogleChrome/lighthouse/blob/main/docs/recipes/custom-audit/README.md

---

**Ready to start? Run:** `npm install -D @lhci/cli`

