# Mobile Home Screen Fix - QA Checklist

## Files Changed
1. `app/globals.css` - Mobile-only CSS overrides
2. `components/shared/MobileFooter.tsx` - Added nav-gallery class for hiding
3. `app/page.tsx` - Updated stat card structure for compact layout
4. `MOBILE_GALLERY_TAB.md` - Documentation for re-enabling Gallery tab

## Mobile-Only Scope Verification
- ✅ All changes wrapped in `@media (max-width: 428px)`
- ✅ Desktop (>=769px) code untouched
- ✅ No modifications to `md:` or `lg:` breakpoints

## QA Checklist

### Home Screen (375px & 428px viewports)

#### Hero Section
- [ ] Hero height is 70vh (not 100vh)
- [ ] Hero overlay provides >= 4.5:1 contrast for white text
- [ ] Headlines have strong text-shadow (3-layer shadow for maximum contrast)
- [ ] Headlines are white (#ffffff) for maximum readability
- [ ] Paragraph text is rgba(255,255,255,0.98) with shadow

#### Search Card
- [ ] Search card positioned above bottom nav (with safe-area spacing)
- [ ] Input fields have 48px height (fixed)
- [ ] Input fields have 12px border-radius
- [ ] Select dropdown has 48px height and 12px border-radius
- [ ] "Find My Ride" button has min-height 48px (fixed to 48px)
- [ ] "Find My Ride" button has 12px border-radius
- [ ] All inputs have proper padding (14px vertical, 16px horizontal)
- [ ] Touch targets >= 48×48dp verified

#### Quick Stats Carousel
- [ ] Stats cards are 120px wide (reduced from 140px)
- [ ] Stats cards have reduced padding (12px vertical, 8px horizontal)
- [ ] Icon size is 20px (reduced from 24px)
- [ ] Value text is 1.25rem (20px, reduced from 24px)
- [ ] Label text is 0.6875rem (11px, reduced from 12px)
- [ ] Cards have 12px gap between them
- [ ] Horizontal scroll works smoothly
- [ ] Cards snap to positions during scroll

#### Bottom Navigation
- [ ] Bottom nav height is exactly 56px + env(safe-area-inset-bottom)
- [ ] Gallery tab is hidden (only 3 tabs visible: HOME, BROWSE, PROFILE/DASHBOARD)
- [ ] Remaining 3 tabs are evenly distributed
- [ ] Icons are 24px with 48px touch targets
- [ ] Active state shows filled icon
- [ ] Safe-area insets applied correctly (notches/home bars)

#### FAB (Floating Action Button)
- [ ] FAB is hidden on Home screen (verify no floating button visible)
- [ ] No overlap with bottom nav or search card

#### Spacing & Layout
- [ ] Content has proper padding-bottom to avoid overlap with bottom nav (72px + safe-area)
- [ ] Sticky CTA ("BOOK YOUR RIDE NOW") positioned correctly above nav
- [ ] Safe-area wrapper applied to main content
- [ ] No horizontal overflow or scrollbars

### Accessibility
- [ ] All interactive elements are >= 48×48dp
- [ ] Headline contrast ratio >= 4.5:1 (verified with overlay and text-shadow)
- [ ] Input fields have aria-labels (implicit via labels)
- [ ] Buttons have accessible text
- [ ] Navigation items have proper semantics

### Performance
- [ ] Images lazy-loaded (if any on home page)
- [ ] Animations use CSS transitions (not heavy JS)
- [ ] Stats carousel scroll is smooth (60fps)
- [ ] No layout shift during page load

### Desktop Verification (>=769px)
- [ ] Desktop layout unchanged
- [ ] All 4 tabs visible in desktop navigation (HOME, BROWSE, GALLERY, PROFILE)
- [ ] Hero section works normally on desktop
- [ ] Search card works normally on desktop
- [ ] Stats display as grid, not carousel
- [ ] FAB visible on desktop (unless on Home page)

## Visual Testing

### Before Screenshots (Current State)
- Take screenshots at 375px width
- Take screenshots at 428px width
- Document current Gallery tab visibility

### After Screenshots (After Fix)
- Take screenshots at 375px width showing:
  - Hero with enhanced contrast
  - Search card with 48px inputs
  - Compact stats carousel (120px cards)
  - Bottom nav with 3 tabs (no Gallery)
  - No FAB visible
- Take screenshots at 428px width (same as above)
- Document Gallery tab hidden state

## Browser Testing
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile (Android)
- [ ] Edge Mobile (Android)

## Device Testing
- [ ] iPhone 12/13/14/15 (375px - 428px range)
- [ ] Android devices (375px - 428px range)
- [ ] Devices with notches (safe-area verification)
- [ ] Devices with home bars (safe-area verification)

## Regression Testing
- [ ] Desktop navigation unchanged (4 tabs including Gallery)
- [ ] Desktop layout unchanged
- [ ] Other mobile pages (Browse, Profile, Dashboard) unaffected
- [ ] Gallery page still accessible via direct URL

