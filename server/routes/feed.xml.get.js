// In-memory cache for RSS feeds
const rssCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default defineEventHandler(async (event) => {
  try {
    // Get optional page parameter from query string
    const query = getQuery(event);
    const page = query.page || '1'; // Default to page 1 if not specified

    console.log(`📰 RSS Feed requested - page: ${page}`);

    // Check server-side cache first
    const cacheKey = `rss-index-page-${page}`;
    const cached = rssCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ RSS Feed served from server cache (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);

      // Set proper content type for XML/RSS
      setResponseHeaders(event, {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900', // Cache for 15 minutes
        'X-Cache': 'HIT',
        'Age': String(Math.round((Date.now() - cached.timestamp) / 1000)),
      });

      return cached.data;
    }

    // Fetch RSS feed from backend API
    const apiUrl = `https://meridian.mpanel.app/api/webV3/rss${page !== '1' ? `?page=${page}` : ''}`;
    console.log(`📡 Fetching RSS from backend API: ${apiUrl}`);

    const response = await $fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    console.log(`✅ RSS Feed fetched successfully from backend`);

    // Store in server-side cache
    rssCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    // Set proper content type for XML/RSS
    setResponseHeaders(event, {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900', // Cache for 15 minutes
      'X-Cache': 'MISS',
    });

    // Return the XML response as-is
    return response;

  } catch (error) {
    console.error('❌ Error fetching RSS feed:', error);

    // Set error response headers
    setResponseHeaders(event, {
      'Content-Type': 'application/xml; charset=UTF-8'
    });

    // Return error XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error - Meridian Sport RSS Feed</title>
    <link>https://meridiansport.rs</link>
    <description>Error loading RSS feed</description>
    <item>
      <title>Error</title>
      <description>Unable to load RSS feed at this time. Please try again later.</description>
    </item>
  </channel>
</rss>`;
  }
});
