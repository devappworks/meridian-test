# Three-Segment URL Redirect Implementation

## Problem

Legacy URLs with three segments (e.g., `/fudbal/liga-evrope/article-slug/`) need to redirect to the new two-segment format (`/fudbal/article-slug/`).

The middle segment represents a sub-category that should be removed from the URL structure.

## Solution

Created a new server middleware: `server/middleware/04.three-segment-redirect.js`

### How It Works

1. **Detects three-segment URLs**: Matches pattern `/segment1/segment2/segment3/`
2. **Validates main category**: Checks if first segment is a main category (fudbal, kosarka, tenis, odbojka, ostali-sportovi)
3. **Validates sub-category**: Checks if second segment is a known sub-category of the main category
4. **Performs 301 redirect**: Redirects to `/segment1/segment3/` format

### Middleware Order

The middleware is numbered `04` to run after:
- `00.url-normalization.js` - URL cleanup
- `01.invalid-categories.js` - Invalid category blocking
- `02.category-redirect.js` - Single-segment category redirects
- `03.page-redirect.js` - Page-level redirects

## Sub-Categories Handled

### Football (fudbal)
- domaci-fudbal, domai-fudbal
- reprezentacije, reprezentacije-fudbal
- evropska-takmicenja
- liga-sampiona, liga-sampi ona
- liga-evrope, liga-europa
- liga-konferencija, liga-konferencije
- superligasrbije, super-liga-srbije, superliga-srbije-domaci-fudbal
- lige-petice
- ostalo

### Basketball (kosarka)
- domaca-kosarka
- aba-liga
- evroliga, evrobasket, eurobasket
- nba

### Tennis (tenis)
- atp, wta
- grand-slam
- masters
- davis-cup

### Volleyball (odbojka)
- domaca-odbojka
- liga-sampiona-odbojka

### Other Sports (ostali-sportovi)
- rukomet, atletika, plivanje, gimnastika
- borilacke-vestine, automoto, biciklizam
- zimski-sportovi, esports
- intervjui, sport-fokus, sportska-geografija

## Examples

### Will Redirect (301)
- `/fudbal/liga-evrope/article-slug/` → `/fudbal/article-slug/`
- `/fudbal/liga-sampiona/zvezda-pobeda/` → `/fudbal/zvezda-pobeda/`
- `/kosarka/nba/latest-news/` → `/kosarka/latest-news/`

### Will NOT Redirect
- `/fudbal/article-slug/` - Already correct format (2 segments)
- `/tag/partizan/page/` - Tag routes preserved
- `/article/12345/` - Article ID routes preserved
- `/fudbal/` - Category pages preserved
- `/najnovije-vesti/` - Single-segment routes preserved

## Safety Features

1. **Only handles known categories**: Won't redirect unknown first segments
2. **Only handles known sub-categories**: Won't redirect unknown second segments
3. **Preserves query strings**: Maintains any URL parameters
4. **Prevents redirect loops**: Only redirects valid three-segment patterns
5. **Doesn't break existing routes**: Tag, article, and special routes are preserved

## Testing

All 17 provided URLs were tested:
- ✅ 16 URLs will redirect correctly
- ✅ 1 URL already in correct format (no action needed)
- ✅ All existing two-segment URLs unaffected
- ✅ Tag routes work correctly
- ✅ Article ID routes work correctly
- ✅ Category pages work correctly

## SEO Impact

- **301 Permanent Redirect**: Tells search engines the URL has permanently moved
- **Link Equity Preserved**: SEO value transfers to new URL
- **No Duplicate Content**: Old URLs redirect, preventing duplicate content issues
- **Clean URL Structure**: Simpler, cleaner URLs for better UX and SEO

## Implementation Notes

- Middleware runs on every request (server-side)
- Minimal performance impact (simple regex matching)
- Logging enabled for monitoring redirects
- Can be extended with more sub-categories as needed

## Adding New Sub-Categories

To add new sub-categories, edit `server/middleware/04.three-segment-redirect.js`:

```javascript
const subCategories = {
  'fudbal': [
    // ... existing ...
    'new-subcategory',  // Add here
  ],
}
```

## Monitoring

Watch server logs for:
```
[3-SEGMENT REDIRECT] Redirecting legacy URL:
[3-SEGMENT REDIRECT]   From: /fudbal/liga-evrope/article-slug/
[3-SEGMENT REDIRECT]   To:   /fudbal/article-slug/
[3-SEGMENT REDIRECT]   Reason: "liga-evrope" is a sub-category of "fudbal"
```
