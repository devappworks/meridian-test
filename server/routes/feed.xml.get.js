export default defineEventHandler(async (event) => {
  try {
    // Get optional page parameter from query string
    const query = getQuery(event);
    const page = query.page || '1'; // Default to page 1 if not specified

    console.log(`📰 RSS Feed requested - page: ${page}`);

    // Fetch RSS feed from backend API
    const apiUrl = `https://meridian.mpanel.app/api/webV3/rss${page !== '1' ? `?page=${page}` : ''}`;
    console.log(`📡 Fetching RSS from: ${apiUrl}`);

    const response = await $fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    console.log(`✅ RSS Feed fetched successfully`);

    // Set proper content type for XML/RSS
    setResponseHeaders(event, {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900, must-revalidate', // Cache for 15 minutes
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
