# Frontend Testing Strategy - Meridian Sport

**Document Version:** 1.0
**Date:** October 29, 2025
**Status:** Ready for Implementation

---

## 📋 Executive Summary

This document provides a **practical, actionable testing strategy** for Meridian Sport based on 2025 best practices. Given the site's heavy SEO dependency and zero current test coverage, this strategy prioritizes **SEO validation**, **critical user paths**, and **automated CI/CD** to prevent production breaks.

**Key Recommendations:**
- Use **Playwright** for E2E tests (not Cypress) - better for SSR, multi-browser, parallel execution
- Use **Vitest** for unit/component tests (Nuxt-native, fast)
- Implement **Lighthouse CI** for performance monitoring
- **Start with SEO tests** - these protect your revenue
- Automate via **GitHub Actions** - every PR gets tested

**Expected Outcomes:**
- Catch SEO breaks before production (meta tags, schema, OG images)
- Prevent navigation/functionality regressions
- Monitor Core Web Vitals automatically
- Faster, more confident deployments

---

## 🎯 Testing Philosophy: Why Playwright Over Cypress

### Decision Matrix

| Feature | Playwright | Cypress | Winner |
|---------|-----------|---------|--------|
| **Browser Support** | Chrome, Firefox, Safari, Edge | Chrome (primarily) | ✅ Playwright |
| **Parallel Execution** | ✅ Built-in, free | ❌ Requires paid plan | ✅ Playwright |
| **SSR Compatibility** | ✅ Excellent | ⚠️ Limited | ✅ Playwright |
| **Multi-Tab/Domain** | ✅ Native support | ❌ Limited | ✅ Playwright |
| **API Testing** | ✅ Built-in | ❌ Requires workarounds | ✅ Playwright |
| **Language Support** | JS, TS, Python, C#, Java | JS, TS only | ✅ Playwright |
| **Auto-Waiting** | ✅ Yes | ✅ Yes | 🟰 Tie |
| **Developer Experience** | ✅ Excellent | ✅ Excellent | 🟰 Tie |
| **Debugging** | ✅ Codegen, traces, screenshots | ✅ Time travel, live reload | 🟰 Tie |
| **Performance** | ✅ Faster | ⚠️ Slower at scale | ✅ Playwright |
| **Market Momentum (2025)** | ✅ Growing | ⚠️ Stable | ✅ Playwright |

**Verdict:** **Playwright** is the better choice for Meridian Sport because:
1. **Multi-browser SEO validation** (Google crawls from different UAs)
2. **Free parallel execution** (faster CI/CD)
3. **Better SSR support** (Nuxt 4 SSR app)
4. **Future-proof** (Microsoft backing, growing ecosystem)

---

## 🏗️ Testing Stack Recommendations

### Core Testing Tools

```json
{
  "e2e": "Playwright",
  "unit": "Vitest",
  "component": "Vitest + @vue/test-utils",
  "performance": "Lighthouse CI",
  "visual": "Playwright + Percy (optional)",
  "ci-cd": "GitHub Actions"
}
```

### Why This Stack?

**1. Playwright for E2E**
- ✅ Native Nuxt/SSR support
- ✅ Test real browser behavior
- ✅ Catch SEO issues before production
- ✅ Parallel execution = faster CI
- ✅ Auto-screenshots on failure

**2. Vitest for Unit/Component**
- ✅ Nuxt-native (uses same Vite config)
- ✅ 10x faster than Jest
- ✅ ESM support out-of-the-box
- ✅ Watch mode for dev
- ✅ Coverage reports built-in

**3. Lighthouse CI for Performance**
- ✅ Core Web Vitals monitoring
- ✅ SEO score tracking
- ✅ Performance budgets
- ✅ Regression detection
- ✅ GitHub PR comments

**4. GitHub Actions for CI/CD**
- ✅ Free for public repos
- ✅ Parallel test execution
- ✅ Caching for speed
- ✅ PR comments with results
- ✅ Deploy on passing tests

---

## 🎯 Testing Priorities: What to Test First

### Tier 1: SEO & Critical Business Logic (Week 1)

**These directly impact revenue - test first!**

#### 1. SEO Validation (CRITICAL)
```javascript
// tests/e2e/seo-critical.spec.ts

test('Homepage has correct meta tags and schema', async ({ page }) => {
  await page.goto('/')

  // Title
  await expect(page).toHaveTitle(/Meridian Sport.*Fudbal.*Košarka/)

  // Meta description
  const metaDesc = page.locator('meta[name="description"]')
  await expect(metaDesc).toHaveAttribute('content', /.{100,160}/)

  // Open Graph
  const ogTitle = page.locator('meta[property="og:title"]')
  const ogImage = page.locator('meta[property="og:image"]')
  const ogUrl = page.locator('meta[property="og:url"]')

  await expect(ogTitle).toHaveAttribute('content', /Meridian Sport/)
  await expect(ogImage).toHaveAttribute('content', /homepage-og\.jpg/)
  await expect(ogUrl).toHaveAttribute('content', 'https://meridiansport.rs/')

  // Structured Data
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(schemas.length).toBeGreaterThan(0)

  const orgSchema = JSON.parse(schemas.find(s => s.includes('"@type":"Organization"')))
  expect(orgSchema).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Meridian Sport',
    url: 'https://meridiansport.rs'
  })
})

test('Article page has valid NewsArticle schema', async ({ page }) => {
  // Navigate to any article (use test fixture or real article)
  await page.goto('/fudbal/test-article/')

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  const newsArticle = JSON.parse(schemas.find(s => s.includes('"@type":"NewsArticle"')))

  // Validate required fields for Google Discover
  expect(newsArticle).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: expect.any(String),
    datePublished: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
    dateModified: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
    author: expect.objectContaining({
      '@type': 'Organization',
      name: 'Meridian Sport'
    }),
    publisher: expect.objectContaining({
      '@type': 'Organization',
      name: 'Meridian Sport',
      logo: expect.objectContaining({
        '@type': 'ImageObject'
      })
    }),
    image: expect.objectContaining({
      '@type': 'ImageObject',
      url: expect.any(String),
      contentUrl: expect.any(String),
      copyrightNotice: expect.any(String),
      license: expect.any(String)
    })
  })

  // Validate image licensing (Google Discover requirement)
  expect(newsArticle.image.copyrightNotice).toBeTruthy()
  expect(newsArticle.image.license).toContain('creativecommons.org')
})

test('All pages have canonical URLs', async ({ page }) => {
  const pages = [
    '/',
    '/fudbal/',
    '/kosarka/',
    '/tenis/',
    '/odbojka/',
    '/ostali-sportovi/',
    '/najnovije-vesti/'
  ]

  for (const url of pages) {
    await page.goto(url)

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', new RegExp(`${url}$`))
  }
})

test('No duplicate title or description tags', async ({ page }) => {
  await page.goto('/')

  const titleCount = await page.locator('title').count()
  const descCount = await page.locator('meta[name="description"]').count()
  const ogTitleCount = await page.locator('meta[property="og:title"]').count()

  expect(titleCount).toBe(1)
  expect(descCount).toBe(1)
  expect(ogTitleCount).toBe(1)
})
```

#### 2. Navigation & Core Flows
```javascript
// tests/e2e/navigation.spec.ts

test('Homepage loads and displays articles', async ({ page }) => {
  await page.goto('/')

  // Check for article cards
  const articles = page.locator('.news-card')
  await expect(articles).toHaveCount({ min: 3 })

  // Check category navigation
  await expect(page.locator('nav a:has-text("FUDBAL")')).toBeVisible()
  await expect(page.locator('nav a:has-text("KOŠARKA")')).toBeVisible()
})

test('Article navigation works correctly', async ({ page }) => {
  await page.goto('/')

  // Click first article
  const firstArticle = page.locator('.news-card').first()
  const articleTitle = await firstArticle.locator('.news-title').textContent()

  await firstArticle.click()

  // Should navigate to article page
  await expect(page).toHaveURL(/\/(fudbal|kosarka|tenis|odbojka)\/.*/)

  // Article title should match
  await expect(page.locator('h1')).toContainText(articleTitle)
})

test('Category pages load correctly', async ({ page }) => {
  const categories = ['fudbal', 'kosarka', 'tenis', 'odbojka']

  for (const category of categories) {
    await page.goto(`/${category}/`)

    // Should have articles
    const articles = page.locator('.news-card')
    await expect(articles).toHaveCount({ min: 1 })

    // Should have correct title
    await expect(page).toHaveTitle(new RegExp(category, 'i'))
  }
})
```

#### 3. Speculation Rules API
```javascript
// tests/e2e/speculation-rules.spec.ts

test('Speculation Rules script is present', async ({ page }) => {
  await page.goto('/')

  // Wait for client-side script injection
  await page.waitForTimeout(500)

  // Check for speculation rules script
  const speculationScript = await page.locator('script[type="speculationrules"]').textContent()
  expect(speculationScript).toBeTruthy()

  const rules = JSON.parse(speculationScript)

  expect(rules).toMatchObject({
    prerender: [{
      where: {
        href_matches: "/*",
        not: {
          href_matches: expect.arrayContaining([
            "/prijava/*",
            "/registracija/*",
            "/account-page/*",
            "/moje-vesti/*"
          ])
        }
      },
      eagerness: "moderate"
    }]
  })
})

test('Prerendering works for article links', async ({ page, context }) => {
  await page.goto('/')

  // Get first article link
  const articleLink = page.locator('.news-card').first()
  const href = await articleLink.getAttribute('href')

  // Listen for prerender requests
  const prerenderPromise = page.waitForRequest(req =>
    req.url().includes(href) &&
    req.headers()['sec-purpose'] === 'prefetch'
  )

  // Hover to trigger prerender
  await articleLink.hover()
  await page.waitForTimeout(250)

  // Should have triggered prerender (may not always work in tests)
  // This is more of a smoke test
})
```

---

### Tier 2: Components & User Interactions (Week 2)

#### 4. Header Component
```javascript
// tests/e2e/header.spec.ts

test('Mobile menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
  await page.goto('/')

  // Burger menu should be visible
  const burgerMenu = page.locator('.burger-menu')
  await expect(burgerMenu).toBeVisible()

  // Click to open
  await burgerMenu.click()

  // Mobile menu should slide in
  const mobileMenu = page.locator('.mobile-menu')
  await expect(mobileMenu).toHaveClass(/open/)

  // Navigation links should be visible
  await expect(page.locator('.mobile-nav a:has-text("FUDBAL")')).toBeVisible()
})

test('Search modal opens', async ({ page }) => {
  await page.goto('/')

  const searchIcon = page.locator('.search-icon').first()
  await searchIcon.click()

  // Search modal should open
  const searchModal = page.locator('.search-modal')
  await expect(searchModal).toBeVisible()

  // Can type in search input
  const searchInput = searchModal.locator('input[type="text"]')
  await searchInput.fill('fudbal')
  await expect(searchInput).toHaveValue('fudbal')
})
```

#### 5. Comments System
```javascript
// tests/e2e/comments.spec.ts

test('Unauthenticated users see login prompt', async ({ page }) => {
  await page.goto('/fudbal/test-article/')

  // Should have comment form
  const commentForm = page.locator('.comment-form')
  await expect(commentForm).toBeVisible()

  // Submit should be disabled or show login message
  const submitBtn = commentForm.locator('button:has-text("POŠALJI")')
  await expect(submitBtn).toBeDisabled()
})

test('Comment voting requires login', async ({ page }) => {
  await page.goto('/fudbal/test-article/')

  // Try to vote without login
  const likeBtn = page.locator('.vote-btn.like').first()
  await likeBtn.click()

  // Should show error or redirect
  await expect(page.locator('text=/prijav/i')).toBeVisible({ timeout: 2000 })
})
```

#### 6. Newsletter Signup
```javascript
// tests/e2e/newsletter.spec.ts

test('Newsletter form validates email', async ({ page }) => {
  await page.goto('/')

  const emailInput = page.locator('.newsletter-input')
  const submitBtn = page.locator('.newsletter-submit')

  // Invalid email
  await emailInput.fill('invalid-email')
  await submitBtn.click()

  await expect(page.locator('text=/validn/i')).toBeVisible()

  // Valid email
  await emailInput.fill('test@example.com')
  await submitBtn.click()

  // Should show success or error message
  await expect(page.locator('.error-message, text=/uspešno|već/i')).toBeVisible()
})
```

---

### Tier 3: Performance & Visual Regression (Week 3)

#### 7. Lighthouse CI Configuration
```javascript
// lighthouserc.js

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/fudbal/',
        'http://localhost:3000/fudbal/test-article/',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'structured-data': 'error',

        // Best Practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'warn',

        // Accessibility
        'color-contrast': 'warn',
        'tap-targets': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

#### 8. Visual Regression (Optional)
```javascript
// tests/visual/homepage.spec.ts

import { test, expect } from '@playwright/test'

test('Homepage visual regression', async ({ page }) => {
  await page.goto('/')

  // Wait for content to load
  await page.waitForSelector('.news-card')

  // Take screenshot
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100,
  })
})

test('Article page visual regression', async ({ page }) => {
  await page.goto('/fudbal/test-article/')

  await page.waitForSelector('.article-content')

  await expect(page).toHaveScreenshot('article-page.png', {
    fullPage: true,
    maxDiffPixels: 100,
  })
})
```

---

## 🚀 Implementation Guide

### Step 1: Install Playwright (5 minutes)

```bash
# Install Playwright with browsers
npm init playwright@latest

# Follow prompts:
# - TypeScript: Yes
# - Tests folder: tests
# - GitHub Actions: Yes
# - Install browsers: Yes
```

### Step 2: Configure for Nuxt (10 minutes)

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### Step 3: Write Your First Test (10 minutes)

```javascript
// tests/e2e/smoke.spec.ts

import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')

  // Check title
  await expect(page).toHaveTitle(/Meridian Sport/)

  // Check for articles
  const articles = page.locator('.news-card')
  await expect(articles).toHaveCount({ min: 3 })

  // Check for navigation
  await expect(page.locator('nav')).toBeVisible()

  console.log('✅ Homepage loads successfully')
})
```

### Step 4: Run Tests (2 minutes)

```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test smoke

# Run with UI (debugging)
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed

# Generate code (record interactions)
npx playwright codegen http://localhost:3000
```

### Step 5: Set Up CI/CD (15 minutes)

```yaml
# .github/workflows/test.yml

name: E2E Tests

on:
  push:
    branches: [dev, main]
  pull_request:

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build
        run: npm run build

      - name: Run Playwright tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
          retention-days: 30
```

---

## 📊 Test Coverage Goals

### Month 1: Foundation (80% Critical Paths)
- ✅ Homepage loads with correct SEO
- ✅ Article pages have valid NewsArticle schema
- ✅ All pages have canonical URLs
- ✅ Navigation works (category pages, article clicks)
- ✅ Speculation Rules API configured
- ✅ Mobile menu works
- ✅ No duplicate meta tags

### Month 2: Comprehensive (60% Overall)
- ✅ All Tier 1 + Tier 2 tests
- ✅ Comment system (voting, replying)
- ✅ Newsletter signup
- ✅ Search functionality
- ✅ User authentication flows
- ✅ Lighthouse CI integrated

### Month 3: Advanced (Visual + Performance)
- ✅ Visual regression tests
- ✅ Cross-browser testing
- ✅ Performance budgets enforced
- ✅ Accessibility tests
- ✅ Load testing (optional)

---

## 🎯 Key Metrics to Track

### Test Health Metrics
- **Test Success Rate:** Target 95%+
- **Test Execution Time:** Target <5 minutes
- **Flakiness Rate:** Target <5%
- **Coverage:** 80% critical paths, 60% overall

### Business Impact Metrics
- **SEO Breaks Prevented:** Track schema/meta tag issues caught
- **Production Bugs:** Before/after testing implementation
- **Deployment Confidence:** Time from commit to production
- **Developer Velocity:** PRs merged per week

---

## 🚨 Common Pitfalls to Avoid

### 1. Testing Implementation Details
❌ **BAD:** Test internal component state
```javascript
expect(component.data.isLoading).toBe(false)
```

✅ **GOOD:** Test user-visible behavior
```javascript
await expect(page.locator('.loading-spinner')).not.toBeVisible()
```

### 2. Brittle Selectors
❌ **BAD:** Rely on fragile CSS selectors
```javascript
page.locator('div.container > div:nth-child(3) > a')
```

✅ **GOOD:** Use semantic selectors
```javascript
page.locator('article a[aria-label="Read more"]')
page.getByRole('link', { name: 'Read more' })
```

### 3. Not Waiting for Dynamic Content
❌ **BAD:** Assume content is immediately available
```javascript
const title = await page.locator('h1').textContent()
```

✅ **GOOD:** Wait for content to load
```javascript
await page.waitForSelector('h1')
const title = await page.locator('h1').textContent()
```

### 4. Testing Too Many Things in One Test
❌ **BAD:** Mega test that does everything
```javascript
test('entire site works', async ({ page }) => {
  // 500 lines of test code
})
```

✅ **GOOD:** Focused, single-purpose tests
```javascript
test('homepage displays articles', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.news-card')).toHaveCount({ min: 3 })
})
```

### 5. Not Cleaning Up Test Data
❌ **BAD:** Leave test data in database
```javascript
await createTestArticle()
// Test code
// Never delete it
```

✅ **GOOD:** Clean up after tests
```javascript
test.afterEach(async () => {
  await cleanupTestData()
})
```

---

## 📚 Learning Resources

### Playwright Documentation
- Official docs: https://playwright.dev
- Best practices: https://playwright.dev/docs/best-practices
- API reference: https://playwright.dev/docs/api/class-playwright

### Video Tutorials
- Playwright Crash Course: https://www.youtube.com/watch?v=wawbt1cATsk
- Testing Nuxt Apps: https://www.youtube.com/results?search_query=playwright+nuxt

### Community
- Playwright Discord: https://aka.ms/playwright/discord
- Stack Overflow: https://stackoverflow.com/questions/tagged/playwright

---

## ✅ Quick Start Checklist

**Day 1: Setup (2 hours)**
- [ ] Run `npm init playwright@latest`
- [ ] Configure `playwright.config.ts` for Nuxt
- [ ] Write first smoke test (homepage loads)
- [ ] Run test locally: `npx playwright test`

**Day 2: SEO Tests (4 hours)**
- [ ] Test homepage meta tags
- [ ] Test article NewsArticle schema
- [ ] Test canonical URLs
- [ ] Test Open Graph images

**Day 3: Navigation Tests (4 hours)**
- [ ] Test homepage navigation
- [ ] Test category pages load
- [ ] Test article pages load
- [ ] Test mobile menu

**Day 4: CI/CD (2 hours)**
- [ ] Create `.github/workflows/test.yml`
- [ ] Push to GitHub
- [ ] Verify tests run on PR
- [ ] Fix any failing tests

**Week 2: Component Tests**
- [ ] Comments system
- [ ] Newsletter signup
- [ ] Search functionality
- [ ] User authentication

**Week 3: Performance**
- [ ] Set up Lighthouse CI
- [ ] Define performance budgets
- [ ] Monitor Core Web Vitals
- [ ] Add visual regression tests

---

## 🎯 Success Criteria

**You'll know testing is working when:**
- ✅ Every PR runs automated tests
- ✅ SEO breaks are caught before production
- ✅ Deployments happen with confidence
- ✅ Test suite runs in <5 minutes
- ✅ <5% of tests are flaky
- ✅ 80%+ critical path coverage
- ✅ Performance regressions are detected automatically

---

## 🚀 Next Steps

1. **Install Playwright:** `npm init playwright@latest`
2. **Write 5 SEO tests** (homepage, article, canonical, schema, OG)
3. **Set up GitHub Actions** (run tests on every PR)
4. **Add Lighthouse CI** (monitor performance)
5. **Expand test coverage** (navigation, components, interactions)

**Ready to start? Run:** `npm init playwright@latest`

