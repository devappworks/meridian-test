# Date Parsing Fix - "Invalid time value" Error

## Problem
Articles were failing to load with a **500 Server Error: "Invalid time value"** when trying to render the page. The error occurred during SSR (Server-Side Rendering) when generating meta tags.

## Root Cause
The backend API returns articles with two date fields:
- `publish_date`: ISO format string (e.g., `"2025-08-23T12:04:00.000000Z"`) ✅ Valid
- `date`: Human-readable format (e.g., `"23/08/2025, 14:05"`) ❌ Invalid for `new Date()`

The code was using `a.date` **first** before `a.publish_date`, which caused the date parsing to fail because the human-readable format cannot be reliably parsed by JavaScript's `new Date()` constructor.

## Error Details
```
ERROR  Error: Invalid time value
⁃ (app/pages/[category]/[slug].vue:126:68)
```

The error occurred in the `useHead()` function when trying to:
```javascript
const publishedTime = a?.date || a?.publish_date || undefined;
const publishedTimeISO = publishedTime ? new Date(publishedTime).toISOString() : undefined;
```

When `a.date = "23/08/2025, 14:05"` was passed to `new Date()`, it resulted in an invalid date object, and calling `.toISOString()` on it threw the "Invalid time value" error.

## Solution

### 1. Fixed `pages/[category]/[slug].vue`
**Changed:**
- Reversed the priority: Use `publish_date` (ISO format) **before** `date` (formatted string)
- Added proper error handling with try-catch
- Added validation to check if the date is valid before converting to ISO

**Before:**
```javascript
const publishedTime = a?.date || a?.publish_date || undefined;
const publishedTimeISO = publishedTime ? new Date(publishedTime).toISOString() : undefined;
```

**After:**
```javascript
// Use publish_date first (ISO format), fallback to date field
const publishedTime = a?.publish_date || a?.date || undefined;

// Convert publishedTime to ISO 8601 format with error handling
let publishedTimeISO = undefined;
if (publishedTime) {
  try {
    const dateObj = new Date(publishedTime);
    // Check if date is valid
    if (!isNaN(dateObj.getTime())) {
      publishedTimeISO = dateObj.toISOString();
    } else {
      console.warn('🟢 Invalid date value for article:', publishedTime);
    }
  } catch (err) {
    console.warn('🟢 Error parsing date for article:', publishedTime, err);
  }
}
```

### 2. Fixed `composables/useNewsArticleSchema.js`
Applied the same fix to the news article schema composable to prevent similar issues in other parts of the application.

**Before:**
```javascript
const publishDate = article.publish_date || article.date;
const datePublishedISO = publishDate ? new Date(publishDate).toISOString() : undefined;
```

**After:**
```javascript
const publishDate = article.publish_date || article.date;

// Helper function to safely parse dates
const safeParseDate = (dateString) => {
  if (!dateString) return undefined;
  try {
    const dateObj = new Date(dateString);
    return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : undefined;
  } catch (err) {
    console.warn('Failed to parse date:', dateString);
    return undefined;
  }
};

const datePublishedISO = safeParseDate(publishDate);
```

## Benefits
1. ✅ Articles now load successfully without 500 errors
2. ✅ Dates are parsed safely with proper error handling
3. ✅ Graceful degradation - if date parsing fails, the page still loads (just without the date meta tag)
4. ✅ Proper logging to help debug future date issues

## Testing
Test these previously failing URLs:
- https://meridiansport.rs/fudbal/posle-163-vecitog-derbija-fss-kaznjavao-i-zvezdu-i-partizan/
- https://meridiansport.rs/fudbal/aleksandar-stankovic-i-andrej-ilic-na-piksijevom-spisku/
- https://meridiansport.rs/fudbal/tuzna-prica-sa-marakane/

Expected behavior:
- Articles load successfully ✅
- No "Invalid time value" errors ✅
- Proper meta tags with dates ✅
- SEO data correctly formatted ✅

## Files Modified
1. `app/pages/[category]/[slug].vue` - Fixed date parsing in useHead()
2. `app/composables/useNewsArticleSchema.js` - Added safe date parsing helper

## What Was Discovered from Debug Logs
The comprehensive debug logging revealed:
- ✅ Article fetching works perfectly (resolve API finds articles correctly)
- ✅ The API tries multiple categories as intended
- ✅ Articles are returned with complete data
- ❌ The crash happened AFTER fetching, during meta tag generation
- ❌ The specific issue was date format incompatibility

This shows the value of comprehensive logging - it immediately pinpointed that the problem was NOT with article fetching or routing, but with date parsing in the meta tags.

