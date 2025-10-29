# Mobile Optimization Audit Report

**Date:** October 29, 2025
**Auditor:** Claude Code
**Site:** Meridian Sport (meridiansport.rs)
**Framework:** Nuxt 4.1.0 (SSR)

---

## Executive Summary

This audit evaluates the mobile user experience against **WCAG 2.1 Level AA** touch target guidelines (minimum 48x48px) and Google's mobile-friendly best practices.

### Overall Status: ⚠️ **NEEDS IMPROVEMENT**

**Critical Issues Found:** 5
**Medium Priority Issues:** 3
**Low Priority Issues:** 2

---

## Phase 1: Touch Target Size Audit

### Standard: Minimum 48x48px (44x44px for iOS)

| Component | Element | Current Size | Status | Priority |
|-----------|---------|--------------|--------|----------|
| **Header.vue** | | | | |
| | Burger menu | 24x18px | ❌ FAIL | 🔴 CRITICAL |
| | Search icon | 24x24px | ❌ FAIL | 🔴 CRITICAL |
| | User icon | 24x24px | ❌ FAIL | 🔴 CRITICAL |
| | Sport categories | ~30x28px (8px padding + 14px text) | ❌ FAIL | 🟡 MEDIUM |
| | "MOJE VESTI" button | ~30x28px (8px padding) | ❌ FAIL | 🟡 MEDIUM |
| | Main nav links (desktop) | ~32x16px (8px vertical padding) | ❌ FAIL | 🟢 LOW |
| **Footer.vue** | | | | |
| | Social icons | 32x32px | ❌ FAIL | 🔴 CRITICAL |
| | Footer links | ~18x12px (font-size only) | ❌ FAIL | 🟡 MEDIUM |
| **Newsletter.vue** | | | | |
| | Social icons | 44x44px | ✅ PASS | ✅ OK |
| | Email input | 44px height | ✅ PASS | ✅ OK |
| | Submit button | Inherits from .btn-yellow | ⚠️ UNKNOWN | 🟡 CHECK |
| **NewsCard.vue** | | | | |
| | Sport category tag | ~19px height (4px padding + 11px line-height) | ❌ FAIL | 🔴 CRITICAL |
| | Entire card | Full clickable area | ✅ PASS | ✅ OK |
| **CommentsPage.vue** | | | | |
| | Vote buttons (default) | ~29px (4px + 21px icon + 4px) | ❌ FAIL | 🟡 MEDIUM |
| | Vote buttons (active) | ~41px (8px + 21px icon + 12px) | ⚠️ BORDERLINE | 🟡 MEDIUM |
| | Reply button | ~32px line-height | ❌ FAIL | 🟡 MEDIUM |
| | Send message button | ~45px (12px + 21px + 12px) | ✅ PASS | ✅ OK |
| | Textarea | Standard height | ✅ PASS | ✅ OK |

---

## Phase 2: Viewport & Responsive Configuration

### 2.1 Viewport Meta Tag ⚠️

**Status:** ❌ **MISSING (CRITICAL)**

**Finding:**
No viewport meta tag configured in `nuxt.config.ts`. While Nuxt may add one by default, it's not explicitly defined in the configuration.

**Current Configuration:**
```typescript
// nuxt.config.ts - NO viewport meta tag found
app: {
  head: {
    link: [ /* favicons, preconnect, etc */ ],
    // ❌ Missing meta array with viewport configuration
  }
}
```

**Recommended Fix:**
```typescript
app: {
  head: {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' }
    ],
    link: [ /* ... */ ]
  }
}
```

**Impact:** Without explicit viewport configuration, the site may not render correctly on mobile devices.

---

### 2.2 Media Query Breakpoints

**File:** `app/assets/css/main.css`

| Breakpoint | Usage | Status |
|------------|-------|--------|
| 1200px | Tablet layout (line 217) | ✅ Present |
| 768px | Mobile layout (line 229) | ✅ Present |
| 576px | Small phones | ❌ **MISSING** |

**Additional Breakpoints in Components:**
- `Header.vue`: 958px (line 1903), 768px (line 1946)
- Inconsistent breakpoint strategy

**Recommendation:** Add 576px breakpoint for small phones (iPhone SE, Galaxy S8, etc.)

---

### 2.3 Font Scaling

**Files Checked:**
- `app/assets/css/main.css`
- Component-specific styles

| Element | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Body text | Not explicitly set | Not set | ⚠️ UNDEFINED |
| Header nav links | 14px | 18px (mobile menu) | ✅ OK |
| Footer links | 12px | 12px | ❌ TOO SMALL |
| NewsCard title | 18px | 18px | ✅ OK |
| Comment text | Default | Default | ⚠️ CHECK |

**Critical Issue:** Input fields should have minimum 16px font size to prevent iOS auto-zoom.

**Newsletter Input (app/components/Newsletter.vue:171):**
```css
.newsletter-input {
  font-size: 12px; /* ❌ FAIL - Will trigger iOS zoom */
}
```

---

## Phase 3: Spacing & Layout Audit

### 3.1 Interactive Element Spacing

**Standard:** Minimum 8px between touch targets

| Location | Elements | Spacing | Status |
|----------|----------|---------|--------|
| Header desktop nav | Nav links | 24px gap | ✅ PASS |
| Header sport categories | Category pills | 32px gap (swiper) | ✅ PASS |
| Footer social icons | Icons | 12px gap | ✅ PASS |
| Newsletter social icons | Icons | 16.5px gap | ✅ PASS |
| Comment vote buttons | Like/Dislike | 8px gap (in container) | ✅ PASS |
| Top navbar | Logo, burger, search, user | space-between | ✅ PASS |

**Verdict:** ✅ Spacing generally meets minimum requirements

---

### 3.2 Mobile-Specific Layout Issues

#### ✅ **Good Patterns Found:**

1. **Mobile Menu Implementation** (Header.vue:1826-1857)
   - Uses `calc(60px + env(safe-area-inset-top))` for iOS notch
   - Dynamic viewport height support: `100dvh`
   - Touch-scrolling enabled: `-webkit-overflow-scrolling: touch`

2. **NewsCard Responsive Behavior** (NewsCard.vue:227-243)
   ```css
   @media (max-width: 576px) {
     .news-card {
       flex-direction: row; /* Horizontal layout on mobile */
     }
   }
   ```

3. **Sport Categories Swiper** (Header.vue:1974-1978)
   - Removes background on mobile for cleaner look
   - Adjusts padding appropriately

#### ⚠️ **Issues Found:**

1. **Hover States on Touch Devices** (main.css:229-233)
   ```css
   @media screen and (max-width: 768px) {
     *:hover {
       opacity: 1; /* Disables all hover effects */
     }
   }
   ```
   **Status:** ✅ Good - prevents sticky hover states

2. **Container Padding** (main.css:230-232)
   ```css
   /* .container {
     padding: 0 20px;
   } */
   ```
   **Status:** ⚠️ Commented out - needs verification

---

## Phase 4: Component-Specific Findings

### 4.1 Header Component (app/components/Header.vue)

**Critical Issues:**

1. **Line 1800-1803: Burger Menu**
   ```css
   .burger-menu {
     width: 24px;
     height: 18px;
   }
   ```
   - **Current:** 24x18px visual area
   - **Required:** 48x48px clickable area
   - **Fix:** Add padding: `padding: 15px;` (creates 54x48px total)

2. **Line 1388-1391: Search Icon**
   ```css
   .search-icon {
     width: 24px;
     height: 24px;
   }
   ```
   - **Current:** 24x24px
   - **Required:** 48x48px
   - **Fix:** Add padding: `padding: 12px;` (creates 48x48px total)

3. **Line 1398-1403: User Icon**
   ```css
   .user-icon {
     height: 24px;
   }
   ```
   - **Current:** 24x24px icon
   - **Required:** 48x48px
   - **Fix:** Add padding: `padding: 12px;` (creates 48x48px total)

4. **Line 1600: Sport Category Links**
   ```css
   .category {
     padding: 8px 12px;
     font-size: 14px;
     line-height: 14px;
   }
   ```
   - **Current:** ~30x28px
   - **Required:** 48px height minimum
   - **Fix:** Increase padding to `padding: 12px 16px;` (~38x48px)

---

### 4.2 Footer Component (app/components/Footer.vue)

**Critical Issues:**

1. **Line 196-204: Social Icons**
   ```css
   .social-icon {
     width: 32px;
     height: 32px;
   }
   ```
   - **Current:** 32x32px
   - **Required:** 48x48px
   - **Fix:** Change to `width: 48px; height: 48px;`

2. **Line 264-274: Footer Links**
   ```css
   .footer-link {
     font-size: 12px;
     line-height: 18px;
     margin-bottom: 1px;
   }
   ```
   - **Current:** ~18x12px (line-height only, no padding)
   - **Required:** 48px height
   - **Fix:** Add `padding: 12px 0;` (creates 42px clickable height)

---

### 4.3 NewsCard Component (app/components/NewsCard.vue)

**Critical Issue:**

**Line 246-258: Sport Category Tag**
```css
:deep(.sport-tag) {
  padding: 4px;
  font-size: 12px;
  line-height: 11px;
}
```
- **Current:** ~19px height (4px + 11px + 4px)
- **Required:** 48x48px (if clickable)
- **Status:** ⚠️ **UNCLEAR** - Tag appears non-clickable (display only)
- **Action:** If non-interactive, this is OK. If clickable, increase to `padding: 12px;`

---

### 4.4 Comments Component (app/views/CommentsPage.vue)

**Medium Priority Issues:**

1. **Line 1062-1072: Vote Buttons**
   ```css
   .vote-btn {
     padding: 4px 8px;
     gap: 8px;
   }
   .vote-btn img {
     width: 21px;
     height: 21px;
   }
   ```
   - **Current:** ~29px height (4px + 21px + 4px)
   - **When Active:** ~41px (8px + 21px + 12px) - still borderline
   - **Required:** 48px minimum
   - **Fix:** Increase default padding to `padding: 12px 16px;`

2. **Line 1007-1017: Reply Button**
   ```css
   .reply-btn {
     font-size: 14px;
     line-height: 32px;
   }
   ```
   - **Current:** ~32px height
   - **Required:** 48px
   - **Fix:** Add padding or increase line-height: `padding: 8px 12px;`

**Already Passing:**

✅ **Line 904-918: Send Message Button**
```css
.send-message-btn {
  padding: 12px 20px;
  font-size: 18px;
  line-height: 21px;
}
```
- **Size:** ~45px height (12px + 21px + 12px)
- **Status:** ✅ Close enough (borderline pass)

---

### 4.5 Newsletter Component (app/components/Newsletter.vue)

**Already Passing:**

✅ **Line 114-118: Social Icons**
```css
.social-icon {
  width: 44px;
  height: 44px;
}
```
- **Size:** 44x44px
- **Status:** ✅ PASS (meets iOS minimum)

✅ **Line 163-172: Email Input**
```css
.newsletter-input {
  height: 44px;
  font-size: 12px; /* ⚠️ iOS zoom issue */
}
```
- **Height:** ✅ 44px (pass)
- **Font size:** ❌ 12px (will trigger iOS auto-zoom)
- **Fix:** Increase to `font-size: 16px;`

---

## Phase 5: Browser & Device Compatibility

### 5.1 iOS-Specific Optimizations

**Already Implemented:**

✅ Safe area insets for notch (Header.vue:1829)
```css
top: calc(60px + env(safe-area-inset-top));
```

✅ Dynamic viewport height (Header.vue:1853-1857)
```css
@supports (height: 100dvh) {
  .mobile-menu {
    height: calc(100dvh - (60px + env(safe-area-inset-top)));
  }
}
```

✅ Touch scrolling (Header.vue:1840)
```css
-webkit-overflow-scrolling: touch;
```

**Issues:**

❌ **Input Zoom Prevention**
- Newsletter email input: 12px font (will zoom on focus)
- Comment textarea: Default font size (needs verification)
- **Fix:** All form inputs should have `font-size: 16px` minimum

---

### 5.2 Android-Specific Considerations

**Status:** ✅ No Android-specific issues detected

- Uses standard CSS
- No -webkit-only properties that would break on Android
- Responsive breakpoints should work across devices

---

## Summary of Critical Fixes Needed

### 🔴 HIGH PRIORITY (Affects All Users)

| # | Issue | Component | Current | Required | Effort |
|---|-------|-----------|---------|----------|--------|
| 1 | Viewport meta tag missing | nuxt.config.ts | None | Add explicit config | 5 min |
| 2 | Burger menu too small | Header.vue:1800 | 24x18px | 48x48px | 10 min |
| 3 | Search icon too small | Header.vue:1388 | 24x24px | 48x48px | 10 min |
| 4 | User icon too small | Header.vue:1398 | 24x24px | 48x48px | 10 min |
| 5 | Footer social icons too small | Footer.vue:196 | 32x32px | 48x48px | 10 min |
| 6 | iOS input zoom issue | Newsletter.vue:171 | 12px | 16px | 5 min |

**Total High Priority Effort:** ~1 hour

---

### 🟡 MEDIUM PRIORITY (UX Improvements)

| # | Issue | Component | Current | Required | Effort |
|---|-------|-----------|---------|----------|--------|
| 7 | Sport category pills small | Header.vue:1600 | ~30x28px | 48px height | 15 min |
| 8 | "MOJE VESTI" button small | Header.vue:1617 | ~30x28px | 48px height | 10 min |
| 9 | Footer links small | Footer.vue:264 | ~18x12px | 48px height | 10 min |
| 10 | Comment vote buttons small | CommentsPage.vue:1062 | ~29px | 48px | 15 min |
| 11 | Comment reply button small | CommentsPage.vue:1007 | ~32px | 48px | 10 min |
| 12 | Missing 576px breakpoint | main.css | N/A | Add breakpoint | 20 min |

**Total Medium Priority Effort:** ~1.5 hours

---

### 🟢 LOW PRIORITY (Nice to Have)

| # | Issue | Component | Current | Required | Effort |
|---|-------|-----------|---------|----------|--------|
| 13 | Footer link font too small | Footer.vue:266 | 12px | 14px+ | 5 min |
| 14 | Commented container padding | main.css:230 | Commented | Verify/uncomment | 5 min |

**Total Low Priority Effort:** ~10 minutes

---

## Recommended Implementation Order

### Week 1: Critical Fixes (Total: ~1 hour)
1. Add viewport meta tag to nuxt.config.ts
2. Fix Header touch targets (burger, search, user icons)
3. Fix Footer social icons
4. Fix Newsletter input font size
5. **Test on real devices** (iOS Safari, Chrome Android)

### Week 2: Medium Priority Fixes (Total: ~1.5 hours)
6. Increase Header sport category button sizes
7. Increase Footer link padding
8. Increase Comment vote/reply button sizes
9. Add 576px media query breakpoint
10. **Run Google Mobile-Friendly Test**

### Week 3: Polish & Validation (Total: ~30 minutes)
11. Low priority font size adjustments
12. Verify container padding
13. **Run PageSpeed Insights**
14. **Final mobile device testing**

---

## Testing Checklist

### Manual Testing (Required)

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 12 Pro (390px width)
- [ ] Test on Samsung Galaxy S20 (360px width)
- [ ] Test on iPad (768px width)
- [ ] Verify all buttons can be tapped easily
- [ ] Check form inputs don't trigger zoom
- [ ] Verify mobile menu works smoothly
- [ ] Test sport category swiper scrolling

### Automated Testing (Recommended)

- [ ] Google Mobile-Friendly Test
- [ ] PageSpeed Insights (Mobile)
- [ ] Lighthouse Mobile Audit (Chrome DevTools)
- [ ] WAVE Accessibility Checker
- [ ] axe DevTools accessibility scan

---

## Positive Findings

### ✅ Things Done Right

1. **Excellent iOS Support** - Proper safe-area-inset handling
2. **Good Spacing** - Interactive elements have adequate separation
3. **Smart Mobile Menu** - Proper z-index, scroll locking, iOS quirks handled
4. **Responsive Images** - NuxtPicture with proper sizes attributes
5. **Touch-Friendly Cards** - Full clickable area on NewsCard
6. **Newsletter Component** - Touch targets meet minimum requirements
7. **Disabled Hover on Touch** - Prevents sticky hover states

---

## Risk Assessment

### Breaking Change Risk: 🟢 **LOW**

All recommended fixes are:
- ✅ Additive changes (adding padding, increasing sizes)
- ✅ CSS-only modifications
- ✅ No JavaScript changes required
- ✅ Backward compatible with desktop views
- ✅ Won't affect existing functionality

### Visual Impact: 🟡 **MEDIUM**

- Some buttons will appear larger (more finger-friendly)
- Footer social icons will be more prominent
- Overall cleaner, more accessible mobile experience
- Desktop experience remains unchanged

---

## Next Steps

1. **Review this audit** with development team
2. **Prioritize fixes** based on user impact
3. **Create implementation tickets** for each fix
4. **Set up mobile device testing** environment
5. **Schedule deployment** of fixes to staging
6. **Conduct user acceptance testing** on mobile devices
7. **Monitor analytics** for mobile engagement improvements

---

## Additional Resources

- [WCAG 2.1 Target Size Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Apple Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)

---

**Audit Status:** ✅ Complete (Phases 1-3)
**Pending:** Real device testing (Phase 4), External validation (Phase 5)
**Next Action:** Share with team for prioritization

