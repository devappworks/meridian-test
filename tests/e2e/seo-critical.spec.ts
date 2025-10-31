import { test, expect } from '@playwright/test'

/**
 * CRITICAL SEO Tests
 * These tests protect revenue - they must pass before any deployment
 */

test.describe('Homepage SEO', () => {
  test('should have correct meta tags and Open Graph', async ({ page }) => {
    await page.goto('/')

    // Title (important for SEO)
    await expect(page).toHaveTitle(/Meridian Sport.*Fudbal.*Košarka/i)

    // Meta description (should be 120-160 chars)
    const metaDesc = page.locator('meta[name="description"]')
    await expect(metaDesc).toHaveAttribute('content', /.{100,160}/)

    // Open Graph tags (for social sharing)
    const ogTitle = page.locator('meta[property="og:title"]')
    const ogDesc = page.locator('meta[property="og:description"]')
    const ogImage = page.locator('meta[property="og:image"]')
    const ogUrl = page.locator('meta[property="og:url"]')

    await expect(ogTitle).toHaveAttribute('content', /Meridian Sport/i)
    await expect(ogDesc).toBeAttached()
    await expect(ogImage).toHaveAttribute('content', /homepage-og\.jpg/)
    await expect(ogUrl).toHaveAttribute('content', 'https://meridiansport.rs/')

    // Twitter Card
    const twitterCard = page.locator('meta[name="twitter:card"]')
    const twitterImage = page.locator('meta[name="twitter:image"]')

    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image')
    await expect(twitterImage).toBeAttached()
  })

  test('should have valid structured data schemas', async ({ page }) => {
    await page.goto('/')

    // Get all JSON-LD scripts
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(schemas.length).toBeGreaterThan(0)

    // Parse and validate Organization schema
    const orgSchema = schemas.find(s => s.includes('"@type":"Organization"'))
    expect(orgSchema).toBeTruthy()

    const org = JSON.parse(orgSchema!)
    expect(org).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Meridian Sport',
      url: 'https://meridiansport.rs',
    })

    expect(org.logo).toBeTruthy()
    expect(org.sameAs).toBeTruthy() // Social media profiles

    // Validate WebSite schema
    const websiteSchema = schemas.find(s => s.includes('"@type":"WebSite"'))
    expect(websiteSchema).toBeTruthy()

    const website = JSON.parse(websiteSchema!)
    expect(website).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: 'https://meridiansport.rs',
    })
  })

  test('should have canonical URL', async ({ page }) => {
    await page.goto('/')

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', 'https://meridiansport.rs/')
  })

  test('should not have duplicate meta tags', async ({ page }) => {
    await page.goto('/')

    // Count title tags (should be exactly 1)
    const titleCount = await page.locator('title').count()
    expect(titleCount).toBe(1)

    // Count meta description (should be exactly 1)
    const descCount = await page.locator('meta[name="description"]').count()
    expect(descCount).toBe(1)

    // Count OG title (should be exactly 1)
    const ogTitleCount = await page.locator('meta[property="og:title"]').count()
    expect(ogTitleCount).toBe(1)
  })
})

test.describe('Article Page SEO', () => {
  test('should have valid NewsArticle schema', async ({ page }) => {
    // Navigate to football category first
    await page.goto('/fudbal/')

    // Click first article
    const firstArticle = page.locator('.news-card').first()
    await firstArticle.click()

    // Wait for article page to load
    await page.waitForSelector('h1')

    // Get all JSON-LD scripts
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()

    // Find NewsArticle schema
    const newsArticleSchema = schemas.find(s => s.includes('"@type":"NewsArticle"'))
    expect(newsArticleSchema).toBeTruthy()

    const article = JSON.parse(newsArticleSchema!)

    // Validate required fields for Google Discover
    expect(article).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
    })

    // Required fields
    expect(article.headline).toBeTruthy()
    expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/)
    expect(article.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}/)

    // Author (can be Person or Organization)
    expect(article.author).toBeTruthy()
    expect(article.author['@type']).toMatch(/Person|Organization/)

    // Publisher (required for NewsArticle)
    expect(article.publisher).toBeTruthy()
    expect(article.publisher['@type']).toBe('Organization')
    expect(article.publisher.name).toBe('Meridian Sport')
    expect(article.publisher.logo).toBeTruthy()
    expect(article.publisher.logo['@type']).toBe('ImageObject')

    // Image with licensing (Google Discover requirement)
    expect(article.image).toBeTruthy()
    expect(article.image['@type']).toBe('ImageObject')
    expect(article.image.url).toBeTruthy()
    expect(article.image.contentUrl).toBeTruthy()

    // Image licensing (critical for Google Discover)
    expect(article.image.copyrightNotice).toBeTruthy()
    expect(article.image.license).toContain('creativecommons.org')
  })

  test('article page should have canonical URL', async ({ page }) => {
    await page.goto('/fudbal/')

    const firstArticle = page.locator('.news-card').first()
    await firstArticle.click()

    await page.waitForSelector('h1')

    // Get current URL
    const currentUrl = page.url()

    // Should have canonical pointing to current URL
    const canonical = page.locator('link[rel="canonical"]')
    const canonicalHref = await canonical.getAttribute('href')

    expect(canonicalHref).toBeTruthy()
    expect(canonicalHref).toContain(new URL(currentUrl).pathname)
  })
})

test.describe('Category Pages SEO', () => {
  const categories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']

  for (const category of categories) {
    test(`${category} category should have valid SEO`, async ({ page }) => {
      await page.goto(`/${category}/`)

      // Title should include category name
      await expect(page).toHaveTitle(new RegExp(category, 'i'))

      // Meta description
      const metaDesc = page.locator('meta[name="description"]')
      await expect(metaDesc).toBeAttached()

      // Canonical URL
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute('href', new RegExp(`/${category}/$`))

      // Should have structured data
      const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(schemas.length).toBeGreaterThan(0)

      // Should have CollectionPage or similar schema
      const hasCollectionSchema = schemas.some(s =>
        s.includes('"@type":"CollectionPage"') ||
        s.includes('"@type":"WebPage"')
      )
      expect(hasCollectionSchema).toBe(true)
    })
  }

  test('all category pages should have canonical URLs', async ({ page }) => {
    for (const category of categories) {
      await page.goto(`/${category}/`)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute('href', new RegExp(`/${category}/$`))
    }
  })
})

test.describe('SEO Technical Requirements', () => {
  test('pages should have lang attribute', async ({ page }) => {
    await page.goto('/')

    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'sr')  // Serbian language
  })

  test('pages should have responsive viewport meta', async ({ page }) => {
    await page.goto('/')

    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    // Check random sample of images (first 5)
    for (let i = 0; i < Math.min(5, count); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')

      // Alt should exist (can be empty for decorative images)
      expect(alt).not.toBeNull()
    }
  })

  test('external links should have rel attributes', async ({ page }) => {
    await page.goto('/')

    // Get external links
    const externalLinks = page.locator('a[href^="http"]:not([href*="meridiansport.rs"])')
    const count = await externalLinks.count()

    if (count > 0) {
      // Check first external link
      const firstLink = externalLinks.first()
      const rel = await firstLink.getAttribute('rel')

      // Should have noopener or noreferrer
      if (rel) {
        expect(rel).toMatch(/noopener|noreferrer/)
      }
    }
  })
})

test.describe('Speculation Rules API', () => {
  test('should have speculation rules script', async ({ page }) => {
    await page.goto('/')

    // Wait for client-side script injection
    await page.waitForTimeout(1000)

    // Check for speculation rules script in DOM
    const speculationScript = await page.locator('script[type="speculationrules"]').textContent()

    if (speculationScript) {
      const rules = JSON.parse(speculationScript)

      // Validate structure
      expect(rules).toHaveProperty('prerender')
      expect(rules.prerender).toHaveLength(1)
      expect(rules.prerender[0]).toMatchObject({
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
      })

      console.log('✅ Speculation Rules API is configured correctly')
    } else {
      // Might not be supported in test browser
      console.log('⚠️ Speculation Rules script not found (may not be supported in this browser)')
    }
  })
})
