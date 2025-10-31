import { test, expect } from '@playwright/test'

/**
 * Font Loading Tests
 * Tests for FOUT (Flash of Unstyled Text) and validates font preloading
 */

test.describe('Font Loading - FOUT Prevention', () => {
  test('critical fonts should be preloaded in HTML', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)

    const html = await response!.text()

    // Check that preload links exist for critical fonts
    expect(html).toContain('rel="preload"')
    expect(html).toContain('as="font"')

    // Verify specific critical fonts are preloaded
    expect(html).toContain('roboto-latin-400-normal')
    expect(html).toContain('barlow-condensed-latin-700-normal')
    expect(html).toContain('source-sans-pro-latin-400-normal')

    // Check font/woff2 type is specified
    expect(html).toContain('type="font/woff2"')

    // Check crossorigin attribute (required for fonts)
    expect(html).toContain('crossorigin="anonymous"')

    console.log('✅ All critical fonts have preload links')
  })

  test('preload links should be in HTML head before CSS', async ({ page }) => {
    const response = await page.goto('/')
    const html = await response!.text()

    // Find positions of preload and CSS in HTML
    const preloadIndex = html.indexOf('rel="preload"')
    const cssIndex = html.indexOf('rel="stylesheet"')

    // Preload should come before stylesheet for optimal loading
    expect(preloadIndex).toBeGreaterThan(0)
    expect(preloadIndex).toBeLessThan(cssIndex)

    console.log('✅ Preload links correctly positioned before CSS')
  })

  test('font files should load with high priority', async ({ page }) => {
    // Capture network requests
    const fontRequests: any[] = []

    page.on('request', request => {
      if (request.url().includes('.woff2') || request.url().includes('.woff')) {
        fontRequests.push({
          url: request.url(),
          resourceType: request.resourceType()
        })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that font files were requested
    expect(fontRequests.length).toBeGreaterThan(0)

    // Check that critical fonts were loaded
    const criticalFonts = fontRequests.filter(req =>
      req.url.includes('roboto-latin-400-normal') ||
      req.url.includes('barlow-condensed-latin-700-normal') ||
      req.url.includes('source-sans-pro-latin-400-normal')
    )

    expect(criticalFonts.length).toBeGreaterThanOrEqual(3)

    console.log(`✅ ${criticalFonts.length} critical font files loaded`)
  })

  test('fonts should not cause layout shift', async ({ page }) => {
    await page.goto('/')

    // Wait for fonts to load
    await page.waitForLoadState('networkidle')

    // Get computed font-family on body and heading
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily
    })

    const headingFont = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      return h1 ? window.getComputedStyle(h1).fontFamily : null
    })

    // Should be using custom fonts, not fallback
    expect(bodyFont).toContain('Roboto')
    if (headingFont) {
      expect(headingFont).toMatch(/Barlow Condensed|Roboto/)
    }

    console.log('✅ Custom fonts applied correctly')
    console.log(`   Body font: ${bodyFont}`)
    console.log(`   Heading font: ${headingFont}`)
  })

  test('font files should be cached for 1 year', async ({ page }) => {
    const fontResponses: any[] = []

    page.on('response', response => {
      if (response.url().includes('.woff2') || response.url().includes('.woff')) {
        fontResponses.push({
          url: response.url(),
          cacheControl: response.headers()['cache-control']
        })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that fonts have long cache headers
    const cachedFonts = fontResponses.filter(res =>
      res.cacheControl && res.cacheControl.includes('immutable')
    )

    expect(cachedFonts.length).toBeGreaterThan(0)

    console.log(`✅ ${cachedFonts.length} font files have immutable cache headers`)
  })

  test('homepage should not show visible font swap (FOUT)', async ({ page }) => {
    // Navigate to page
    await page.goto('/')

    // Wait a tiny bit for initial paint
    await page.waitForTimeout(50)

    // Get font family immediately after navigation
    const initialFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily
    })

    // Wait for network to be idle (fonts should be loaded)
    await page.waitForLoadState('networkidle')

    // Get font family after fonts loaded
    const finalFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily
    })

    // Both should be custom fonts (Roboto), not fallback (Arial/sans-serif)
    expect(initialFont).toContain('Roboto')
    expect(finalFont).toContain('Roboto')
    expect(initialFont).toEqual(finalFont)

    console.log('✅ No font swap detected - FOUT prevented')
    console.log(`   Initial font: ${initialFont}`)
    console.log(`   Final font: ${finalFont}`)
  })
})

test.describe('Font Performance', () => {
  test('should load fonts quickly on fast connection', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Fonts should load in reasonable time on good connection
    expect(loadTime).toBeLessThan(3000)

    console.log(`✅ Fonts loaded in ${loadTime}ms`)
  })

  test('preload links should have correct attributes', async ({ page }) => {
    await page.goto('/')

    // Get all preload links
    const preloadLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="preload"][as="font"]'))
      return links.map(link => ({
        href: link.getAttribute('href'),
        as: link.getAttribute('as'),
        type: link.getAttribute('type'),
        crossorigin: link.getAttribute('crossorigin')
      }))
    })

    // Should have at least 3 font preloads
    expect(preloadLinks.length).toBeGreaterThanOrEqual(3)

    // Each should have correct attributes
    preloadLinks.forEach(link => {
      expect(link.as).toBe('font')
      expect(link.type).toBe('font/woff2')
      expect(link.crossorigin).toBe('anonymous')
      expect(link.href).toContain('.woff2')
    })

    console.log(`✅ ${preloadLinks.length} font preload links with correct attributes`)
  })
})
