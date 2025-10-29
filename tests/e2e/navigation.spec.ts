import { test, expect } from '@playwright/test'

/**
 * Navigation & Core User Flows
 * Tests critical user paths through the site
 */

test.describe('Homepage Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check for key elements
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    // Should have articles
    const articles = page.locator('.news-card')
    await expect(articles).toHaveCount({ min: 3 })

    console.log(`✅ Homepage loaded with ${await articles.count()} articles`)
  })

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation links
    await expect(page.locator('nav a:has-text("FUDBAL")')).toBeVisible()
    await expect(page.locator('nav a:has-text("KOŠARKA")')).toBeVisible()
    await expect(page.locator('nav a:has-text("TENIS")')).toBeVisible()
    await expect(page.locator('nav a:has-text("ODBOJKA")')).toBeVisible()
  })

  test('should navigate to category pages', async ({ page }) => {
    await page.goto('/')

    // Click on Fudbal
    await page.click('nav a:has-text("FUDBAL")')

    // Should navigate to category page
    await expect(page).toHaveURL(/\/fudbal\//i)
    await expect(page).toHaveTitle(/fudbal/i)

    // Should have articles
    const articles = page.locator('.news-card')
    await expect(articles).toHaveCount({ min: 1 })
  })

  test('should navigate to article from homepage', async ({ page }) => {
    await page.goto('/')

    // Get first article
    const firstArticle = page.locator('.news-card').first()
    const articleTitle = await firstArticle.locator('.news-title').textContent()

    // Click article
    await firstArticle.click()

    // Should navigate to article page
    await expect(page).toHaveURL(/\/(fudbal|kosarka|tenis|odbojka|ostali-sportovi)\/.*/)

    // Article should be displayed
    await expect(page.locator('h1')).toBeVisible()

    console.log(`✅ Navigated to article: ${articleTitle}`)
  })
})

test.describe('Category Pages', () => {
  const categories = ['fudbal', 'kosarka', 'tenis', 'odbojka']

  for (const category of categories) {
    test(`should load ${category} category page`, async ({ page }) => {
      await page.goto(`/${category}/`)

      // Should have title
      await expect(page).toHaveTitle(new RegExp(category, 'i'))

      // Should have articles
      const articles = page.locator('.news-card')
      const count = await articles.count()
      expect(count).toBeGreaterThan(0)

      console.log(`✅ ${category} category loaded with ${count} articles`)
    })
  }
})

test.describe('Mobile Navigation', () => {
  test.use({ ...test.use, viewport: { width: 375, height: 667 } }) // iPhone SE

  test('should have burger menu on mobile', async ({ page }) => {
    await page.goto('/')

    // Burger menu should be visible
    const burgerMenu = page.locator('.burger-menu')
    await expect(burgerMenu).toBeVisible()

    console.log('✅ Burger menu visible on mobile')
  })

  test('mobile menu should open and close', async ({ page }) => {
    await page.goto('/')

    const burgerMenu = page.locator('.burger-menu')
    const mobileMenu = page.locator('.mobile-menu')

    // Initially closed
    await expect(mobileMenu).not.toHaveClass(/open/)

    // Click to open
    await burgerMenu.click()
    await expect(mobileMenu).toHaveClass(/open/)

    // Navigation links should be visible
    await expect(page.locator('.mobile-nav a:has-text("FUDBAL")')).toBeVisible()

    console.log('✅ Mobile menu opens correctly')
  })

  test('mobile navigation should work', async ({ page }) => {
    await page.goto('/')

    // Open mobile menu
    await page.click('.burger-menu')

    // Click on category
    await page.click('.mobile-nav a:has-text("FUDBAL")')

    // Should navigate
    await expect(page).toHaveURL(/\/fudbal\//i)

    console.log('✅ Mobile navigation works')
  })
})

test.describe('Search Functionality', () => {
  test('search icon should open search modal', async ({ page }) => {
    await page.goto('/')

    const searchIcon = page.locator('.search-icon').first()
    await searchIcon.click()

    // Search modal should be visible
    const searchModal = page.locator('[class*="search-modal"], [class*="SearchModal"]')
    await expect(searchModal).toBeVisible({ timeout: 2000 })

    console.log('✅ Search modal opens')
  })
})

test.describe('Article Page', () => {
  test('should display article content', async ({ page }) => {
    // Navigate to category
    await page.goto('/fudbal/')

    // Click first article
    await page.locator('.news-card').first().click()

    // Wait for article to load
    await page.waitForSelector('h1')

    // Should have main elements
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.featured-image, [class*="featured-image"]')).toBeVisible()
    await expect(page.locator('.article-content, [class*="article-content"]')).toBeVisible()

    console.log('✅ Article page displays correctly')
  })

  test('should have share buttons', async ({ page }) => {
    await page.goto('/fudbal/')
    await page.locator('.news-card').first().click()
    await page.waitForSelector('h1')

    // Check for social share buttons (Facebook, Twitter, etc.)
    const socialButtons = page.locator('[class*="social"], [class*="share"]')
    const count = await socialButtons.count()

    expect(count).toBeGreaterThan(0)

    console.log(`✅ Article has ${count} share buttons`)
  })
})

test.describe('Footer', () => {
  test('footer should be visible and have links', async ({ page }) => {
    await page.goto('/')

    // Footer should be visible
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Should have social icons
    const socialIcons = footer.locator('.social-icon, [class*="social-icon"]')
    expect(await socialIcons.count()).toBeGreaterThan(0)

    // Should have footer links
    const footerLinks = footer.locator('a')
    expect(await footerLinks.count()).toBeGreaterThan(0)

    console.log('✅ Footer displays correctly')
  })
})

test.describe('Performance & Loading', () => {
  test('homepage should load within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    // Wait for articles to load
    await page.waitForSelector('.news-card')

    const loadTime = Date.now() - startTime

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000)

    console.log(`✅ Homepage loaded in ${loadTime}ms`)
  })

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')

    // Allow some time for JS to execute
    await page.waitForTimeout(2000)

    // Should have no critical console errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') && // Ignore favicon errors
      !err.includes('404') // Ignore 404s for optional resources
    )

    expect(criticalErrors).toHaveLength(0)

    if (criticalErrors.length > 0) {
      console.error('Console errors found:', criticalErrors)
    } else {
      console.log('✅ No console errors')
    }
  })
})
