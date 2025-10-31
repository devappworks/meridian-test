# Frontend Testing Implementation Plan - Meridian Sport

**Document Version:** 1.0
**Date:** October 19, 2025
**Status:** Ready for Implementation

---

## 📋 Executive Summary

This document outlines a comprehensive, phased approach to implementing automated testing for the Meridian Sport frontend. The project currently has **zero test coverage** across 62 Vue components, 11 composables, and 12 server middleware files. Our goal is to establish a robust testing infrastructure that prevents production bugs, validates SEO implementation, and enables confident continuous deployment.

**The strategy is divided into 4 phases over 8 weeks:**
- **Phase 1 (Weeks 1-2):** Foundation setup with critical path testing and basic CI/CD
- **Phase 2 (Weeks 3-4):** Comprehensive coverage of components, integrations, and performance
- **Phase 3 (Weeks 5-6):** Quality assurance with visual regression and advanced SEO testing
- **Phase 4 (Weeks 7-8):** Advanced automation, security, and production monitoring

Each phase builds on the previous, allowing the team to deliver value incrementally while maintaining development velocity. **Priority is on SEO validation** given the site's traffic dependency on search engines and Google Discover. The testing stack uses modern, SSR-compatible tools: **Vitest** for unit/component tests, **Playwright** for E2E tests, and **GitHub Actions** for CI/CD automation.

**Expected outcomes:** 80% critical path coverage (Phase 1), 60% overall code coverage (Phase 2), visual regression protection (Phase 3), and full deployment automation (Phase 4). This prevents the recurring issues of untested changes breaking production SEO, performance, or functionality.

---

## 🎯 Current State Analysis

### Project Overview
- **Framework:** Nuxt 4 with SSR enabled
- **Components:** 62 Vue components (pages, views, UI elements)
- **Composables:** 11 composables (SEO, caching, image handling)
- **Server Logic:** 12 middleware files (redirects, security, URL normalization)
- **Deployment:** Production + Staging environments
- **Traffic Source:** Heavy SEO dependency (Google News, Discover, organic search)

### Current Challenges
1. ❌ **Zero test coverage** - All changes are manual testing only
2. ❌ **No CI/CD pipeline** - No automated quality gates
3. ❌ **Frequent SEO breaks** - Meta tags, schema changes not validated
4. ❌ **Manual deployment** - High risk of human error
5. ❌ **No regression detection** - UI/functionality breaks go unnoticed
6. ⚠️ **Dev mode instability** - Staging server keeps breaking in dev mode

### Critical Requirements
- **SEO validation** is paramount (traffic depends on it)
- **SSR compatibility** required (all tests must work with SSR)
- **Fast feedback** loops (tests < 5 minutes)
- **Developer-friendly** (easy to write and run tests)
- **Production monitoring** (catch issues before users do)

---

## 🚀 PHASE 1: Foundation & Critical Path Testing
**Timeline:** Weeks 1-2
**Priority:** CRITICAL
**Goal:** Prevent breaking changes to core functionality and SEO

### Objectives
1. Set up testing infrastructure
2. Test critical user paths (homepage, article, category pages)
3. Validate SEO implementation (meta tags, structured data)
4. Establish basic CI/CD pipeline
5. Create testing documentation for team

### 1.1 Testing Infrastructure Setup

#### Install Dependencies
```bash
# Unit & Component Testing
npm install -D vitest @vitest/ui @vue/test-utils happy-dom

# E2E Testing (SSR-compatible)
npm install -D @playwright/test

# Testing utilities
npm install -D @testing-library/vue @testing-library/user-event
npm install -D @nuxt/test-utils

# API Mocking
npm install -D msw
```

#### Configuration Files to Create

**File:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        '.nuxt/',
        'dist/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url))
    }
  }
})
```

**File:** `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

**File:** `tests/setup.ts`
```typescript
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Nuxt auto-imports
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    BACKEND_URL: 'https://test-api.example.com',
    SITE_URL: 'https://test.example.com',
    SITE_NAME: 'Test Site',
    GTM_ID: 'GTM-TEST'
  }
}))

global.useHead = vi.fn()
global.useSeoMeta = vi.fn()
global.useRoute = vi.fn(() => ({
  params: {},
  query: {}
}))

// Configure Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key
}
```

#### Update package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

### 1.2 Unit Tests for SEO Composables

These are **CRITICAL** because SEO drives traffic. Any break here impacts revenue.

#### Test: `tests/unit/composables/useNewsArticleSchema.test.js`

```javascript
import { describe, it, expect, vi } from 'vitest'
import { useNewsArticleSchema } from '@/composables/useNewsArticleSchema'

// Mock useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      SITE_URL: 'https://meridiansport.rs',
      SITE_NAME: 'Meridian Sport'
    }
  })
}))

describe('useNewsArticleSchema', () => {
  it('should return null for missing article', () => {
    const schema = useNewsArticleSchema(null)
    expect(schema).toBeNull()
  })

  it('should generate valid NewsArticle schema', () => {
    const article = {
      id: 1,
      title: 'Test Article',
      slug: 'test-article',
      contents: '<p>Test content</p>',
      publish_date: '2025-10-19T10:00:00Z',
      authors: [{ name: 'Test Author' }],
      categories: [{ slug: 'fudbal', name: 'Fudbal' }],
      feat_images: {
        'extra-large': { url: 'https://example.com/image.jpg' }
      }
    }

    const schema = useNewsArticleSchema(article)

    expect(schema).toBeDefined()
    expect(schema['@type']).toBe('NewsArticle')
    expect(schema.headline).toBe('Test Article')
    expect(schema.datePublished).toBeTruthy()
    expect(schema.author).toBeDefined()
    expect(schema.author['@type']).toBe('Person') // CRITICAL: Must be Person, not Organization
    expect(schema.publisher).toBeDefined()
    expect(schema.image).toBeDefined()
  })

  it('should handle missing images gracefully', () => {
    const article = {
      title: 'No Image Article',
      contents: '<p>Content</p>',
      publish_date: '2025-10-19T10:00:00Z'
    }

    const schema = useNewsArticleSchema(article)
    expect(schema.image).toBeUndefined()
  })

  it('should format dates to ISO 8601', () => {
    const article = {
      title: 'Date Test',
      contents: '<p>Content</p>',
      publish_date: '2025-10-19T10:00:00Z'
    }

    const schema = useNewsArticleSchema(article)
    expect(schema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('should include publisher with logo', () => {
    const article = {
      title: 'Publisher Test',
      contents: '<p>Content</p>',
      publish_date: '2025-10-19T10:00:00Z'
    }

    const schema = useNewsArticleSchema(article)
    expect(schema.publisher['@type']).toBe('Organization')
    expect(schema.publisher.name).toBe('Meridian Sport')
    expect(schema.publisher.logo).toBeDefined()
    expect(schema.publisher.logo.width).toBe(512)
    expect(schema.publisher.logo.height).toBe(512)
  })
})
```

#### Test: `tests/unit/composables/useCategorySEO.test.js`

```javascript
import { describe, it, expect } from 'vitest'
import { useCategorySEO } from '@/composables/useCategorySEO'

describe('useCategorySEO', () => {
  it('should return SEO data for valid category', () => {
    const seo = useCategorySEO('fudbal')

    expect(seo).toBeDefined()
    expect(seo.title).toContain('Fudbal')
    expect(seo.meta).toBeDefined()
    expect(seo.meta.length).toBeGreaterThan(0)
    expect(seo.script).toBeDefined()
  })

  it('should return null for invalid category', () => {
    const seo = useCategorySEO('invalid-category')
    expect(seo).toBeNull()
  })

  it('should include CollectionPage schema', () => {
    const seo = useCategorySEO('kosarka')

    const collectionScript = seo.script.find(s => s.innerHTML.includes('CollectionPage'))
    expect(collectionScript).toBeDefined()

    const schema = JSON.parse(collectionScript.innerHTML)
    expect(schema['@type']).toBe('CollectionPage')
    expect(schema.publisher).toBeDefined()
  })

  it('should include BreadcrumbList schema', () => {
    const seo = useCategorySEO('tenis')

    const breadcrumbScript = seo.script.find(s => s.innerHTML.includes('BreadcrumbList'))
    expect(breadcrumbScript).toBeDefined()

    const schema = JSON.parse(breadcrumbScript.innerHTML)
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement.length).toBe(2) // Home + Category
  })

  it('should have proper Open Graph tags', () => {
    const seo = useCategorySEO('odbojka')

    const ogTitle = seo.meta.find(m => m.property === 'og:title')
    const ogDescription = seo.meta.find(m => m.property === 'og:description')
    const ogType = seo.meta.find(m => m.property === 'og:type')

    expect(ogTitle).toBeDefined()
    expect(ogDescription).toBeDefined()
    expect(ogType.content).toBe('website')
  })

  it('should include robots meta with max-image-preview', () => {
    const seo = useCategorySEO('ostali-sportovi')

    const robots = seo.meta.find(m => m.name === 'robots')
    expect(robots.content).toContain('max-image-preview:large')
  })
})
```

#### Test: `tests/unit/utils/canonicalCategory.test.js`

```javascript
import { describe, it, expect } from 'vitest'
import { getCanonicalCategoryFromSlug } from '@/utils/canonicalCategory'

describe('getCanonicalCategoryFromSlug', () => {
  it('should map football subcategories to fudbal', () => {
    expect(getCanonicalCategoryFromSlug('domaci-fudbal')).toBe('fudbal')
    expect(getCanonicalCategoryFromSlug('liga-sampiona')).toBe('fudbal')
    expect(getCanonicalCategoryFromSlug('liga-evrope')).toBe('fudbal')
  })

  it('should map basketball subcategories to kosarka', () => {
    expect(getCanonicalCategoryFromSlug('nba')).toBe('kosarka')
    expect(getCanonicalCategoryFromSlug('evroliga')).toBe('kosarka')
  })

  it('should return main categories unchanged', () => {
    expect(getCanonicalCategoryFromSlug('fudbal')).toBe('fudbal')
    expect(getCanonicalCategoryFromSlug('kosarka')).toBe('kosarka')
    expect(getCanonicalCategoryFromSlug('tenis')).toBe('tenis')
  })

  it('should handle unknown categories', () => {
    const result = getCanonicalCategoryFromSlug('unknown')
    expect(result).toBe('unknown')
  })

  it('should be case insensitive', () => {
    expect(getCanonicalCategoryFromSlug('DOMACI-FUDBAL')).toBe('fudbal')
  })
})
```

---

### 1.3 E2E Tests for Critical Paths

These validate that the site actually works from a user perspective.

#### Test: `tests/e2e/homepage.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(/Meridian Sport/)

    // Check main heading exists
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/')

    // Check meta description
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /.+/)

    // Check OG tags
    const ogTitle = page.locator('meta[property="og:title"]')
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogTitle).toHaveAttribute('content', /.+/)
    await expect(ogImage).toHaveAttribute('content', /https:\/\//)

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', /meridiansport/)
  })

  test('should have Organization schema', async ({ page }) => {
    await page.goto('/')

    const schema = await page.locator('script[type="application/ld+json"]').first().textContent()
    const data = JSON.parse(schema)

    expect(data['@type']).toBe('Organization')
    expect(data.name).toBeTruthy()
    expect(data.logo).toBeDefined()
  })

  test('should display featured article', async ({ page }) => {
    await page.goto('/')

    // Wait for content to load
    await page.waitForSelector('.featured-article, .main-column', { timeout: 10000 })

    // Should have some article content
    const articles = page.locator('article, .news-card, .featured')
    await expect(articles.first()).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check main nav links exist
    const fudbalLink = page.locator('a[href*="fudbal"]').first()
    const kosarkaLink = page.locator('a[href*="kosarka"]').first()

    await expect(fudbalLink).toBeVisible()
    await expect(kosarkaLink).toBeVisible()
  })
})
```

#### Test: `tests/e2e/article-page.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Article Page', () => {
  test('should load article page', async ({ page }) => {
    // This will need to be updated with actual article URL
    await page.goto('/fudbal/test-article/')

    // Should have article title
    const title = page.locator('h1')
    await expect(title).toBeVisible()
  })

  test('should have NewsArticle schema', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    // Find NewsArticle schema
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let newsArticleSchema = null

    for (const script of scripts) {
      const content = await script.textContent()
      const data = JSON.parse(content)
      if (data['@type'] === 'NewsArticle') {
        newsArticleSchema = data
        break
      }
    }

    expect(newsArticleSchema).toBeDefined()
    expect(newsArticleSchema.headline).toBeTruthy()
    expect(newsArticleSchema.author).toBeDefined()
    expect(newsArticleSchema.author['@type']).toBe('Person') // CRITICAL
    expect(newsArticleSchema.publisher).toBeDefined()
    expect(newsArticleSchema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/)
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    // OG tags
    const ogType = page.locator('meta[property="og:type"]')
    await expect(ogType).toHaveAttribute('content', 'article')

    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /https:\/\//)

    // Image dimensions
    const ogImageWidth = page.locator('meta[property="og:image:width"]')
    const ogImageHeight = page.locator('meta[property="og:image:height"]')
    await expect(ogImageWidth).toHaveAttribute('content', /.+/)
    await expect(ogImageHeight).toHaveAttribute('content', /.+/)
  })

  test('should have breadcrumb schema', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let breadcrumbSchema = null

    for (const script of scripts) {
      const content = await script.textContent()
      const data = JSON.parse(content)
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumbSchema = data
        break
      }
    }

    expect(breadcrumbSchema).toBeDefined()
    expect(breadcrumbSchema.itemListElement.length).toBeGreaterThan(1)
  })
})
```

#### Test: `tests/e2e/category-page.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Category Page', () => {
  test.describe.configure({ mode: 'parallel' })

  const categories = ['fudbal', 'kosarka', 'tenis', 'odbojka']

  for (const category of categories) {
    test(`should load ${category} category page`, async ({ page }) => {
      await page.goto(`/${category}/`)

      // Should have title
      await expect(page).toHaveTitle(new RegExp(category, 'i'))

      // Should have articles
      await page.waitForSelector('.news-grid, .news-card, article', { timeout: 10000 })
      const articles = page.locator('.news-card, article')
      await expect(articles.first()).toBeVisible()
    })

    test(`${category} should have CollectionPage schema`, async ({ page }) => {
      await page.goto(`/${category}/`)

      const scripts = await page.locator('script[type="application/ld+json"]').all()
      let collectionSchema = null

      for (const script of scripts) {
        const content = await script.textContent()
        const data = JSON.parse(content)
        if (data['@type'] === 'CollectionPage') {
          collectionSchema = data
          break
        }
      }

      expect(collectionSchema).toBeDefined()
      expect(collectionSchema.name).toBeTruthy()
    })
  }
})
```

---

### 1.4 SEO Validation Tests

**File:** `tests/seo/meta-tags.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('SEO Meta Tags Validation', () => {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/fudbal/', name: 'Football Category' },
    { url: '/kosarka/', name: 'Basketball Category' }
  ]

  for (const { url, name } of pages) {
    test(`${name} should have required meta tags`, async ({ page }) => {
      await page.goto(url)

      // Title
      await expect(page).toHaveTitle(/.+/)

      // Meta description
      const description = page.locator('meta[name="description"]')
      await expect(description).toHaveCount(1)
      const descContent = await description.getAttribute('content')
      expect(descContent.length).toBeGreaterThan(50)
      expect(descContent.length).toBeLessThan(160)

      // Robots
      const robots = page.locator('meta[name="robots"]')
      const robotsContent = await robots.getAttribute('content')
      expect(robotsContent).toContain('index')
      expect(robotsContent).toContain('follow')
      expect(robotsContent).toContain('max-image-preview:large')

      // Canonical
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      const href = await canonical.getAttribute('href')
      expect(href).toMatch(/^https:\/\//)
    })

    test(`${name} should have Open Graph tags`, async ({ page }) => {
      await page.goto(url)

      const ogTags = [
        'og:type',
        'og:title',
        'og:description',
        'og:url',
        'og:site_name'
      ]

      for (const tag of ogTags) {
        const meta = page.locator(`meta[property="${tag}"]`)
        await expect(meta).toHaveCount(1)
        const content = await meta.getAttribute('content')
        expect(content).toBeTruthy()
      }
    })

    test(`${name} should have Twitter Card tags`, async ({ page }) => {
      await page.goto(url)

      const twitterCard = page.locator('meta[name="twitter:card"]')
      await expect(twitterCard).toHaveCount(1)

      const twitterTitle = page.locator('meta[name="twitter:title"]')
      await expect(twitterTitle).toHaveCount(1)
    })

    test(`${name} should have valid structured data`, async ({ page }) => {
      await page.goto(url)

      const scripts = await page.locator('script[type="application/ld+json"]').all()
      expect(scripts.length).toBeGreaterThan(0)

      for (const script of scripts) {
        const content = await script.textContent()
        // Should be valid JSON
        expect(() => JSON.parse(content)).not.toThrow()

        const data = JSON.parse(content)
        // Should have @context and @type
        expect(data['@context']).toBe('https://schema.org')
        expect(data['@type']).toBeTruthy()
      }
    })
  }
})
```

---

### 1.5 GitHub Actions CI/CD Setup

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  seo-validation:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Run SEO tests
        run: npx playwright test tests/seo/

      - name: Upload SEO report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: seo-report
          path: playwright-report/
          retention-days: 30
```

**File:** `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: |
          npm run test
          npm run build

      - name: Deploy to staging
        if: success()
        run: |
          # Add your deployment script here
          # Example: rsync, SSH, or deployment service
          echo "Deploying to staging server..."
          # ssh user@staging-server "cd /path && git pull && npm install && npm run build && pm2 restart app"
```

---

### 1.6 Developer Documentation

**File:** `tests/README.md`

```markdown
# Testing Guide

## Quick Start

### Run all tests
```bash
npm test
```

### Run unit tests only
```bash
npm run test:unit
```

### Run E2E tests
```bash
npm run test:e2e
```

### Run with UI
```bash
npm run test:ui          # Unit tests
npm run test:e2e:ui      # E2E tests
```

### Run with coverage
```bash
npm run test:coverage
```

## Writing Tests

### Unit Tests (Composables, Utils)

Place in `tests/unit/`:
```javascript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/utils/myFunction'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected)
  })
})
```

### Component Tests

Place in `tests/components/`:
```javascript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('Expected text')
  })
})
```

### E2E Tests

Place in `tests/e2e/`:
```typescript
import { test, expect } from '@playwright/test'

test('should load page', async ({ page }) => {
  await page.goto('/path')
  await expect(page).toHaveTitle(/Expected/)
})
```

## Best Practices

1. **Test behavior, not implementation**
2. **Keep tests simple and focused**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Don't test framework code**

## CI/CD

Tests run automatically on:
- Every pull request
- Every push to `main` or `develop`

Pull requests **cannot be merged** if tests fail.
```

---

### 1.7 Phase 1 Success Criteria

#### Deliverables
- ✅ 15+ unit tests for SEO composables
- ✅ 10+ E2E tests for critical paths
- ✅ 5+ SEO validation tests
- ✅ GitHub Actions CI pipeline running
- ✅ Test documentation complete
- ✅ Developer onboarding guide

#### Metrics
- **Coverage:** 80%+ of critical paths
- **Test execution time:** < 5 minutes total
- **CI pipeline:** Passing on all PRs
- **SEO tests:** 100% passing

#### Definition of Done
- [ ] All tests passing locally
- [ ] All tests passing in CI
- [ ] Team trained on writing tests
- [ ] Documentation reviewed and approved
- [ ] First PR merged with test coverage

---

## 📈 PHASE 2: Comprehensive Coverage
**Timeline:** Weeks 3-4
**Priority:** HIGH
**Goal:** Test all major features, components, and integrations

### Objectives
1. Achieve 60%+ overall code coverage
2. Test all major UI components
3. Add integration tests for SSR and API
4. Implement performance testing
5. Add accessibility testing

### 2.1 Component Testing

#### Test All Major Components

**File:** `tests/components/Header.test.js`

```javascript
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Header from '@/components/Header.vue'

describe('Header', () => {
  it('should render navigation links', () => {
    const wrapper = mount(Header, {
      global: {
        stubs: ['NuxtLink', 'ClientOnly']
      }
    })

    expect(wrapper.text()).toContain('FUDBAL')
    expect(wrapper.text()).toContain('KOŠARKA')
    expect(wrapper.text()).toContain('TENIS')
  })

  it('should have search functionality', async () => {
    const wrapper = mount(Header, {
      global: {
        stubs: ['NuxtLink', 'ClientOnly', 'SearchModal']
      }
    })

    const searchButton = wrapper.find('[data-testid="search-button"]')
    expect(searchButton.exists()).toBe(true)
  })

  it('should be responsive', () => {
    const wrapper = mount(Header, {
      global: {
        stubs: ['NuxtLink', 'ClientOnly']
      }
    })

    // Should have mobile menu toggle
    const mobileToggle = wrapper.find('[data-testid="mobile-menu-toggle"]')
    expect(mobileToggle.exists()).toBe(true)
  })
})
```

**File:** `tests/components/NewsCard.test.js`

```javascript
import { mount } from '@vue/test-utils'
import NewsCard from '@/components/NewsCard.vue'

describe('NewsCard', () => {
  const mockArticle = {
    id: 1,
    title: 'Test Article',
    sport: 'FUDBAL',
    image: 'https://example.com/image.jpg',
    category: 'fudbal',
    slug: 'test-article'
  }

  it('should render article title', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockArticle },
      global: {
        stubs: ['NuxtLink']
      }
    })

    expect(wrapper.text()).toContain('Test Article')
  })

  it('should display sport category', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockArticle },
      global: {
        stubs: ['NuxtLink']
      }
    })

    expect(wrapper.text()).toContain('FUDBAL')
  })

  it('should have proper link', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockArticle },
      global: {
        stubs: ['NuxtLink']
      }
    })

    const link = wrapper.findComponent({ name: 'NuxtLink' })
    expect(link.props('to')).toContain('/fudbal/test-article')
  })
})
```

**Target Components to Test:**
- Header.vue
- Footer.vue
- NewsCard.vue
- NewsGrid.vue
- NewsSlider.vue
- Featured.vue
- Sidebar.vue
- SearchModal.vue
- Newsletter.vue
- AdBanners.vue

---

### 2.2 Integration Tests

#### SSR Rendering Tests

**File:** `tests/integration/ssr-rendering.test.js`

```javascript
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('SSR Rendering', () => {
  await setup({
    server: true
  })

  it('should render homepage with SSR', async () => {
    const html = await $fetch('/')

    // Should have content in HTML
    expect(html).toContain('Meridian Sport')

    // Should have meta tags in SSR
    expect(html).toContain('<meta name="description"')
    expect(html).toContain('<meta property="og:title"')

    // Should have structured data
    expect(html).toContain('application/ld+json')
    expect(html).toContain('@type')
  })

  it('should render category pages with SSR', async () => {
    const html = await $fetch('/fudbal/')

    expect(html).toContain('Fudbal')
    expect(html).toContain('CollectionPage')
  })

  it('should include GTM in SSR', async () => {
    const html = await $fetch('/')

    expect(html).toContain('googletagmanager.com/gtm.js')
  })
})
```

#### API Integration Tests

**File:** `tests/integration/api.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { fetchFromApi } from '@/services/api'

const server = setupServer(
  http.get('https://meridian.mpanel.app/api/webV3/getArticles', () => {
    return HttpResponse.json({
      result: {
        articles: [
          {
            id: 1,
            title: 'Test Article',
            slug: 'test-article',
            categories: [{ slug: 'fudbal', name: 'Fudbal' }]
          }
        ]
      }
    })
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('API Integration', () => {
  it('should fetch articles', async () => {
    const response = await fetchFromApi('/getArticles')

    expect(response.result.articles).toBeDefined()
    expect(response.result.articles.length).toBeGreaterThan(0)
  })
})
```

---

### 2.3 Performance Testing

#### Lighthouse CI Setup

**File:** `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/fudbal/
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**File:** `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/fudbal/",
        "http://localhost:3000/kosarka/"
      ]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.95}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

### 2.4 Accessibility Testing

**File:** `tests/a11y/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('article page should not have accessibility violations', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1) // Should have exactly one H1
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')

    const images = await page.locator('img').all()

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeDefined()
    }
  })
})
```

---

### 2.5 Phase 2 Success Criteria

#### Deliverables
- ✅ 30+ component tests
- ✅ 10+ integration tests
- ✅ Lighthouse CI integrated
- ✅ Accessibility tests passing
- ✅ Performance budgets defined

#### Metrics
- **Coverage:** 60%+ overall
- **Lighthouse Score:** 90+ all categories
- **Accessibility:** WCAG 2.1 AA compliant
- **Test execution time:** < 10 minutes

---

## 🎨 PHASE 3: Quality Assurance & Advanced Testing
**Timeline:** Weeks 5-6
**Priority:** MEDIUM
**Goal:** Visual regression, advanced SEO, and cross-browser testing

### Objectives
1. Implement visual regression testing
2. Advanced SEO validation (Discover compliance)
3. Cross-browser testing
4. Load/stress testing

### 3.1 Visual Regression Testing

#### Using Playwright Screenshots

**File:** `tests/visual/visual-regression.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100
    })
  })

  test('article page should match snapshot', async ({ page }) => {
    await page.goto('/fudbal/test-article/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('article-page.png', {
      fullPage: true,
      maxDiffPixels: 100
    })
  })

  test('header component should match snapshot', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('header')
    await expect(header).toHaveScreenshot('header.png')
  })

  test('news card should match snapshot', async ({ page }) => {
    await page.goto('/')

    const newsCard = page.locator('.news-card').first()
    await expect(newsCard).toHaveScreenshot('news-card.png')
  })
})
```

**Update:** `playwright.config.ts`

```typescript
export default defineConfig({
  // ... existing config ...

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    // Add visual regression project
    {
      name: 'visual-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
      testMatch: /visual-regression\.spec\.ts/
    }
  ]
})
```

---

### 3.2 Advanced SEO Testing

#### Google Discover Compliance Tests

**File:** `tests/seo/discover-compliance.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Google Discover Compliance', () => {
  test('article should have high-quality image', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    // Check OG image dimensions
    const ogWidth = await page.locator('meta[property="og:image:width"]').getAttribute('content')
    const ogHeight = await page.locator('meta[property="og:image:height"]').getAttribute('content')

    const width = parseInt(ogWidth)
    const height = parseInt(ogHeight)

    // Google Discover requires minimum 1200px width
    expect(width).toBeGreaterThanOrEqual(1200)

    // Check ratio (should be close to 16:9, 4:3, or 1:1)
    const ratio = width / height
    const isGoodRatio = (
      Math.abs(ratio - 16/9) < 0.1 ||
      Math.abs(ratio - 4/3) < 0.1 ||
      Math.abs(ratio - 1) < 0.1
    )

    expect(isGoodRatio).toBeTruthy()
  })

  test('article should have image licensing', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let imageObject = null

    for (const script of scripts) {
      const content = await script.textContent()
      const data = JSON.parse(content)

      if (data['@type'] === 'NewsArticle' && data.image) {
        imageObject = data.image
        break
      }
    }

    expect(imageObject).toBeDefined()
    expect(imageObject.license).toBeDefined() // CRITICAL for Discover
    expect(imageObject.license).toMatch(/^https:\/\//)
  })

  test('article should have content quality signals', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    const scripts = await page.locator('script[type="application/ld+json"]').all()
    let newsArticle = null

    for (const script of scripts) {
      const content = await script.textContent()
      const data = JSON.parse(content)

      if (data['@type'] === 'NewsArticle') {
        newsArticle = data
        break
      }
    }

    expect(newsArticle).toBeDefined()

    // Should have word count
    expect(newsArticle.wordCount).toBeGreaterThan(100)

    // Should have speakable content
    expect(newsArticle.speakable).toBeDefined()

    // Should be accessible for free
    expect(newsArticle.isAccessibleForFree).toBe(true)
  })

  test('should validate against Google Rich Results Test', async ({ page }) => {
    await page.goto('/fudbal/test-article/')

    // Get all structured data
    const scripts = await page.locator('script[type="application/ld+json"]').all()

    for (const script of scripts) {
      const content = await script.textContent()

      // Should be valid JSON
      expect(() => JSON.parse(content)).not.toThrow()

      const data = JSON.parse(content)

      // Basic validation
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBeTruthy()

      // If NewsArticle, validate required fields
      if (data['@type'] === 'NewsArticle') {
        expect(data.headline).toBeTruthy()
        expect(data.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/)
        expect(data.author).toBeDefined()
        expect(data.author['@type']).toBe('Person')
        expect(data.publisher).toBeDefined()
        expect(data.publisher.logo).toBeDefined()
      }
    }
  })
})
```

---

### 3.3 Cross-Browser Testing

**Update:** `playwright.config.ts`

```typescript
export default defineConfig({
  // ... existing config ...

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] }
    }
  ]
})
```

---

### 3.4 Load Testing

**File:** `tests/load/k6-load-test.js`

```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01']    // Less than 1% failure rate
  }
}

export default function () {
  // Test homepage
  let res = http.get('http://49.13.133.92:3000/')
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 500ms': (r) => r.timings.duration < 500
  })

  sleep(1)

  // Test category page
  res = http.get('http://49.13.133.92:3000/fudbal/')
  check(res, {
    'category status is 200': (r) => r.status === 200
  })

  sleep(1)
}
```

---

### 3.5 Phase 3 Success Criteria

#### Deliverables
- ✅ Visual regression tests for key pages
- ✅ Google Discover compliance tests
- ✅ Cross-browser test matrix
- ✅ Load testing baseline

#### Metrics
- **Visual diffs:** 0 unexpected regressions
- **Discover compliance:** 100% passing
- **Browser support:** Chrome, Firefox, Safari, Mobile
- **Load test:** 50 concurrent users, <500ms p95

---

## 🔐 PHASE 4: Advanced Automation & Monitoring
**Timeline:** Weeks 7-8
**Priority:** LOW (Nice to have)
**Goal:** Complete automation and production monitoring

### Objectives
1. Security scanning automation
2. Dependency management automation
3. Production monitoring integration
4. Full deployment automation

### 4.1 Security Testing

**File:** `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday
  pull_request:
    branches: [main]

jobs:
  dependency-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Check for outdated packages
        run: npm outdated || true

  snyk:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  owasp-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: OWASP ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: 'http://localhost:3000'
```

---

### 4.2 Automated Dependency Updates

**File:** `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
    versioning-strategy: increase-if-necessary
```

---

### 4.3 Production Monitoring

**File:** `app/plugins/error-tracking.client.js`

```javascript
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  if (config.public.SENTRY_DSN) {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: config.public.SENTRY_DSN,
      environment: config.public.ENVIRONMENT || 'production',
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(nuxtApp.$router)
        }),
        new Sentry.Replay()
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    })
  }
})
```

---

### 4.4 Complete CI/CD Pipeline

**File:** `.github/workflows/production-deploy.yml`

```yaml
name: Production Deployment

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run all tests
        run: |
          npm run test:coverage
          npm run build
          npm run test:e2e

      - name: Security scan
        run: npm audit --audit-level=high

  deploy:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          # Add production deployment script
          echo "Deploying to production..."

      - name: Create Sentry release
        run: |
          # Track deployment in Sentry
          curl -sL https://sentry.io/get-cli/ | bash
          export SENTRY_AUTH_TOKEN=${{ secrets.SENTRY_AUTH_TOKEN }}
          export SENTRY_ORG=your-org
          export SENTRY_PROJECT=meridian-sport
          sentry-cli releases new ${{ github.ref_name }}
          sentry-cli releases set-commits ${{ github.ref_name }} --auto
          sentry-cli releases finalize ${{ github.ref_name }}

      - name: Notify team
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment successful!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

### 4.5 Phase 4 Success Criteria

#### Deliverables
- ✅ Security scanning automated
- ✅ Dependabot configured
- ✅ Production monitoring active
- ✅ Full deployment automation

#### Metrics
- **Security:** 0 high/critical vulnerabilities
- **Dependencies:** Auto-updated weekly
- **Deployment:** < 10 minutes from tag to production
- **Monitoring:** Real-time error tracking

---

## 📊 Implementation Timeline

### Week 1
- [x] Setup testing infrastructure
- [x] Write SEO composable tests
- [x] Create basic E2E tests
- [x] Setup GitHub Actions

### Week 2
- [ ] Complete unit tests
- [ ] Add SEO validation tests
- [ ] Document testing practices
- [ ] Train team

### Week 3
- [ ] Component testing
- [ ] Integration tests
- [ ] Lighthouse CI setup

### Week 4
- [ ] Accessibility testing
- [ ] Performance budgets
- [ ] Coverage targets met

### Week 5
- [ ] Visual regression setup
- [ ] Advanced SEO tests
- [ ] Cross-browser matrix

### Week 6
- [ ] Load testing
- [ ] QA validation
- [ ] Documentation complete

### Week 7
- [ ] Security automation
- [ ] Monitoring integration
- [ ] Deployment automation

### Week 8
- [ ] Final optimizations
- [ ] Team training
- [ ] Process documentation

---

## 🎯 Key Metrics & KPIs

### Code Quality
- **Test Coverage:** 60%+ overall, 80%+ critical paths
- **Test Execution Time:** < 10 minutes for full suite
- **Code Review:** All PRs require passing tests

### Performance
- **Lighthouse Score:** 90+ all categories
- **Core Web Vitals:** Green on all metrics
- **Bundle Size:** Track and prevent bloat

### SEO
- **Meta Tags:** 100% coverage on all pages
- **Structured Data:** Valid on all pages
- **Discover Compliance:** 100% on all articles

### Reliability
- **Test Flakiness:** < 1% flaky tests
- **CI Success Rate:** > 95%
- **Deployment Success:** > 98%

---

## 🛠️ Tools & Technologies

### Testing Frameworks
- **Vitest** - Fast unit testing with Vite
- **Playwright** - Reliable E2E testing
- **@vue/test-utils** - Vue component testing
- **@testing-library/vue** - User-centric testing utilities

### Quality Tools
- **Lighthouse CI** - Performance monitoring
- **@axe-core/playwright** - Accessibility testing
- **k6** - Load testing
- **Snyk** - Security scanning

### CI/CD
- **GitHub Actions** - Automation platform
- **Codecov** - Coverage tracking
- **Dependabot** - Dependency updates

### Monitoring
- **Sentry** - Error tracking
- **Google Analytics** - Usage analytics
- **Hotjar** - User behavior (optional)

---

## 📚 Best Practices

### Writing Tests
1. **Test user behavior, not implementation**
2. **Keep tests simple and focused**
3. **Use descriptive test names**
4. **Avoid testing framework internals**
5. **Mock external dependencies**

### SEO Testing
1. **Validate structured data on every page**
2. **Check meta tags are present and correct**
3. **Verify canonical URLs**
4. **Test image dimensions and licensing**
5. **Validate against Google tools**

### CI/CD
1. **Run tests on every PR**
2. **Block merges on test failures**
3. **Keep CI fast (< 10 minutes)**
4. **Provide clear feedback**
5. **Auto-deploy on success**

### Performance
1. **Set performance budgets**
2. **Monitor Core Web Vitals**
3. **Track bundle size**
4. **Test on real devices**
5. **Optimize for SEO**

---

## 🚀 Getting Started

### For Developers

1. **Clone and setup:**
```bash
git clone <repo>
cd meridian-test
npm install
```

2. **Run tests:**
```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # With coverage
```

3. **Write a test:**
```bash
# Create test file
touch tests/unit/myFeature.test.js

# Write test
# See tests/README.md for examples

# Run your test
npm test myFeature
```

4. **Before committing:**
```bash
npm test              # All tests pass?
npm run test:e2e      # E2E tests pass?
npm run build         # Build succeeds?
```

### For Team Leads

1. **Setup CI/CD:**
   - Add GitHub Actions workflows
   - Configure branch protection
   - Setup Codecov

2. **Configure tools:**
   - Lighthouse CI budgets
   - Dependabot settings
   - Sentry project

3. **Train team:**
   - Testing workshop
   - Documentation review
   - Q&A session

---

## 📞 Support & Questions

### Resources
- **Testing Docs:** `tests/README.md`
- **CI/CD Docs:** `.github/workflows/README.md`
- **SEO Guide:** `SEO_IMPROVEMENT_ROADMAP.md`

### Common Issues

**Q: Tests failing in CI but passing locally?**
A: Check environment variables and node version match

**Q: E2E tests timing out?**
A: Increase timeout or optimize page load

**Q: Coverage not meeting target?**
A: Focus on critical paths first, not 100% coverage

---

**Document End**

This comprehensive plan provides a roadmap for implementing automated testing across the Meridian Sport frontend, ensuring quality, performance, and SEO excellence.
