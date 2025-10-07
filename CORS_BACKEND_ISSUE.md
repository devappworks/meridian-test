# CORS Configuration Issue - Backend Fix Required

## Problem

The browser console shows CORS (Cross-Origin Resource Sharing) warnings for API requests to `https://meridian.mpanel.app`:

```
Cross-Origin Request Warning: The Same Origin Policy will disallow reading the remote resource at 
https://meridian.mpanel.app/api/webV3/getWebSettings soon. (Reason: When the 'Access-Control-Allow-Headers' 
is '*', the 'Authorization' header is not covered. To include the 'Authorization' header, it must be 
explicitly listed in CORS header 'Access-Control-Allow-Headers').
```

This warning appears for all API endpoints:
- `/api/webV3/getWebSettings`
- `/api/webV3/getYoutubeVideo`
- `/api/webV3/getHelperNav`
- `/api/webV3/getOrders`
- `/api/webV3/getFooterMenu`

## Root Cause

The backend API server is currently configured with:
```
Access-Control-Allow-Headers: *
```

When using the wildcard (`*`), the CORS specification does NOT cover credential headers like:
- `Authorization`
- `Cookie`
- `Jwt-token`

Our frontend application sends the `Authorization` header with every API request (see `nuxt-app/app/services/api.js`).

## Required Backend Fix

The backend server must be updated to explicitly list the headers instead of using a wildcard.

### Current (Incorrect) Configuration:
```javascript
// ❌ This doesn't work with Authorization header
Access-Control-Allow-Headers: *
```

### Required Configuration:
```javascript
// ✅ Explicitly list all headers including Authorization
Access-Control-Allow-Headers: Content-Type, Authorization, Jwt-token, X-Requested-With
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Origin: https://meridiansport.rs
Access-Control-Allow-Credentials: true
```

## Implementation Examples

### Express.js (Node.js)
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://meridiansport.rs');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Jwt-token, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

### PHP
```php
<?php
header('Access-Control-Allow-Origin: https://meridiansport.rs');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Jwt-token, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://meridiansport.rs"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, Jwt-token, X-Requested-With"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### Nginx
```nginx
add_header 'Access-Control-Allow-Origin' 'https://meridiansport.rs' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Jwt-token, X-Requested-With' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

if ($request_method = 'OPTIONS') {
    return 200;
}
```

## Impact

### Current Impact:
- **Warning only** - The API still works, but browsers are showing deprecation warnings
- Future browser versions may block these requests entirely

### Future Impact (if not fixed):
- API requests will be **blocked** by the browser
- Application will **break** completely
- Users won't be able to:
  - Load articles
  - Post comments
  - Login/Register
  - Access any dynamic content

## Testing After Fix

After implementing the backend fix, verify using browser DevTools:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Click on any API request (e.g., `getWebSettings`)
5. Check the Response Headers:
   - Should see `Access-Control-Allow-Headers: Content-Type, Authorization, Jwt-token, X-Requested-With`
   - Should NOT see `Access-Control-Allow-Headers: *`
6. Verify no CORS warnings in Console tab

## Priority

**HIGH** - This should be fixed as soon as possible before browsers start blocking these requests.

## Additional Resources

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: Access-Control-Allow-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers)
- [CORS Specification](https://fetch.spec.whatwg.org/#http-cors-protocol)

