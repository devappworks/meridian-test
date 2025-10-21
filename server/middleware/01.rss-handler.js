/**
 * RSS Feed Handler Middleware
 * Intercepts RSS feed requests and handles them before they reach the page router
 * Dynamically fetches category ID from backend API based on category slug
 */

// In-memory cache for category RSS feeds
const categoryRssCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;

  console.log('🟡 RSS Middleware: Checking path:', pathname);

  // Check if this is a category RSS feed request (e.g., /fudbal/feed.xml)
  const categoryRssMatch = pathname.match(/^\/([^\/]+)\/feed\.xml$/);

  if (categoryRssMatch) {
    console.log('🟡 RSS Middleware: MATCHED category RSS pattern!');
    const categorySlug = categoryRssMatch[1];
    console.log(`📰 RSS Middleware: Intercepted RSS request for category: ${categorySlug}`);

    // Special case: najnovije-vesti redirects to general feed
    if (categorySlug === 'najnovije-vesti') {
      console.log(`📍 RSS Middleware: Category is najnovije-vesti, redirecting to general feed`);
      return sendRedirect(event, `/feed.xml${url.search}`, 301);
    }

    // Fetch category ID dynamically from the backend API
    const config = useRuntimeConfig();
    const backendUrl = config.public.BACKEND_URL;
    const apiKey = config.public.API_KEY;

    let categoryId;

    try {
      console.log(`🔍 RSS Middleware: Fetching category ID for slug: ${categorySlug}`);

      // Fetch categories from backend to get the ID
      const categoriesResponse = await $fetch(`${backendUrl}/getAllCategories`, {
        headers: apiKey ? { 'Authorization': apiKey } : {},
        timeout: 5000
      });

      // The API returns { success: true, categories: [...] }
      // NOT { result: { categories: [...] } }
      const categories = categoriesResponse?.categories || [];

      console.log('🔍 RSS Middleware: API returned categories:', {
        success: categoriesResponse?.success,
        categoryCount: categories.length,
        firstCategorySample: categories[0]?.name
      });

      console.log(`🔍 RSS Middleware: Looking for '${categorySlug}' in ${categories.length} categories`);
      console.log(`🔍 RSS Middleware: Available category slugs:`, categories.slice(0, 10).map(c => c.slug));

      const category = categories.find(
        cat => cat.slug?.toLowerCase() === categorySlug.toLowerCase()
      );

      if (!category) {
        console.log(`⚠️ RSS Middleware: Category '${categorySlug}' not found`);
        console.log(`⚠️ RSS Middleware: All available slugs:`, categories.map(c => c.slug).join(', '));
        throw createError({
          statusCode: 404,
          statusMessage: 'Category not found',
          fatal: false
        });
      }

      categoryId = category.id;
      console.log(`✅ RSS Middleware: Found category ID ${categoryId} for ${categorySlug}`);

    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      console.error('❌ RSS Middleware: Error fetching category ID:', error.message);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error loading RSS feed',
        fatal: false
      });
    }

    // Get page parameter from query string
    const page = url.searchParams.get('page') || '1';

    // Build API URL with category filter
    let apiUrl = `https://meridian.mpanel.app/api/webV3/rss?category=${categoryId}`;
    if (page !== '1') {
      apiUrl += `&page=${page}`;
    }

    console.log(`📡 RSS Middleware: Fetching RSS from: ${apiUrl}`);

    // Check server-side cache first
    const cacheKey = `rss-category-${categoryId}-page-${page}`;
    const cached = categoryRssCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ RSS Middleware: Served from server cache for ${categorySlug} (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);

      // Set proper content type for XML/RSS
      setResponseHeaders(event, {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900', // Cache for 15 minutes
        'X-Cache': 'HIT',
        'Age': String(Math.round((Date.now() - cached.timestamp) / 1000)),
      });

      return cached.data;
    }

    try {
      const response = await $fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      console.log(`✅ RSS Middleware: RSS Feed fetched successfully from backend for ${categorySlug}`);

      // Store in server-side cache
      categoryRssCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      // Set proper content type for XML/RSS
      setResponseHeaders(event, {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900', // Cache for 15 minutes
        'X-Cache': 'MISS',
      });

      // Return the XML response
      return response;

    } catch (error) {
      console.error('❌ RSS Middleware: Error fetching RSS feed:', error);

      // Set error response headers
      setResponseHeaders(event, {
        'Content-Type': 'application/xml; charset=UTF-8'
      });

      // Return error XML
      return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error - Meridian Sport ${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} RSS Feed</title>
    <link>https://meridiansport.rs/${categorySlug}/</link>
    <description>Error loading RSS feed</description>
    <item>
      <title>Error</title>
      <description>Unable to load RSS feed at this time. Please try again later.</description>
    </item>
  </channel>
</rss>`;
    }
  }

  // Not an RSS feed request, continue to next handler
});
