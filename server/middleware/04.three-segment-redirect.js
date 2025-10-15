// Three-Segment URL Redirect Middleware
// Handles legacy URLs with format: /main-category/sub-category/slug/
// Redirects to: /main-category/slug/
// Example: /fudbal/liga-evrope/article-slug/ → /fudbal/article-slug/
export default defineEventHandler(async (event) => {
  const url = event.node.req.url

  // Only handle GET and HEAD requests
  if (!['GET', 'HEAD'].includes(event.node.req.method)) {
    return
  }

  // Skip API routes, assets, and internal Nuxt routes
  if (url.startsWith('/api/') ||
      url.startsWith('/_nuxt/') ||
      url.startsWith('/__nuxt') ||
      url.startsWith('/_ipx/')) {
    return
  }

  // Skip files with extensions
  const hasExtension = /\.[a-z0-9]+(\?.*)?$/i.test(url)
  if (hasExtension) {
    return
  }

  // Parse the URL
  const [pathname, queryString] = url.split('?')

  // Match three-segment paths: /segment1/segment2/segment3 or /segment1/segment2/segment3/
  // Remove trailing slash for consistent matching
  const normalizedPath = pathname.replace(/\/+$/, '')
  const threeSegmentMatch = normalizedPath.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/i)

  if (!threeSegmentMatch) {
    return // Not a three-segment path
  }

  const [, firstSegment, secondSegment, thirdSegment] = threeSegmentMatch

  console.log(`[3-SEGMENT REDIRECT] Detected three-segment URL: ${pathname}`)
  console.log(`[3-SEGMENT REDIRECT] Segments: [${firstSegment}] / [${secondSegment}] / [${thirdSegment}]`)

  // Define main categories - these are valid first segments
  const mainCategories = ['fudbal', 'kosarka', 'tenis', 'odbojka', 'ostali-sportovi']

  // Define known sub-categories that should be removed
  const subCategories = {
    // Football subcategories
    'fudbal': [
      'domaci-fudbal', 'domai-fudbal', 'reprezentacije', 'reprezentacije-fudbal',
      'evropska-takmicenja', 'liga-sampiona', 'liga-sampi ona',
      'liga-evrope', 'liga-europa', 'liga-konferencija', 'liga-konferencije',
      'superligasrbije', 'super-liga-srbije', 'superliga-srbije-domaci-fudbal',
      'lige-petice', 'ostalo', 'leh-zvezda-mikael-isak-izjava'
    ],
    // Basketball subcategories
    'kosarka': [
      'domaca-kosarka', 'aba-liga', 'evroliga', 'evrobasket', 'eurobasket', 'nba'
    ],
    // Tennis subcategories
    'tenis': [
      'atp', 'wta', 'grand-slam', 'masters', 'davis-cup'
    ],
    // Volleyball subcategories
    'odbojka': [
      'domaca-odbojka', 'liga-sampiona-odbojka'
    ],
    // Other sports subcategories
    'ostali-sportovi': [
      'rukomet', 'atletika', 'plivanje', 'gimnastika',
      'borilacke-vestine', 'automoto', 'biciklizam',
      'zimski-sportovi', 'esports', 'intervjui',
      'sport-fokus', 'sportska-geografija'
    ]
  }

  // Check if first segment is a main category
  if (mainCategories.includes(firstSegment.toLowerCase())) {
    // Check if second segment is a known sub-category for this main category
    const knownSubCategories = subCategories[firstSegment.toLowerCase()] || []

    if (knownSubCategories.includes(secondSegment.toLowerCase())) {
      // This is a legacy three-segment URL - redirect to two-segment format
      const redirectPath = `/${firstSegment}/${thirdSegment}/`
      const redirectUrl = redirectPath + (queryString ? '?' + queryString : '')

      console.log(`[3-SEGMENT REDIRECT] Redirecting legacy URL:`)
      console.log(`[3-SEGMENT REDIRECT]   From: ${pathname}`)
      console.log(`[3-SEGMENT REDIRECT]   To:   ${redirectPath}`)
      console.log(`[3-SEGMENT REDIRECT]   Reason: "${secondSegment}" is a sub-category of "${firstSegment}"`)

      return sendRedirect(event, redirectUrl, 301)
    } else {
      // Second segment is not a known sub-category
      // This might be a valid three-segment structure we don't recognize yet
      // Log it but don't redirect (let it potentially 404 if invalid)
      console.log(`[3-SEGMENT REDIRECT] Unknown second segment "${secondSegment}" under "${firstSegment}"`)
      console.log(`[3-SEGMENT REDIRECT] Not redirecting - may be a valid URL structure`)
    }
  } else {
    // First segment is not a main category
    // Could be /tag/something/something or other valid three-segment structure
    console.log(`[3-SEGMENT REDIRECT] First segment "${firstSegment}" is not a main category`)
    console.log(`[3-SEGMENT REDIRECT] Not redirecting - may be a valid URL structure (e.g., /tag/ route)`)
  }

  // Not a legacy three-segment URL - continue processing
})
