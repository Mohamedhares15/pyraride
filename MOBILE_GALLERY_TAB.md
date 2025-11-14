# Mobile Gallery Tab - Hidden

## Status
The Gallery tab is currently **hidden on mobile navigation** (viewport 375-428px) but remains visible on desktop (>=769px).

## How to Re-enable Gallery Tab on Mobile

To show the Gallery tab on mobile navigation:

1. **Open `app/globals.css`**
2. **Find the mobile media query** `@media (max-width: 428px)`
3. **Locate the Gallery tab hiding rule**:
   ```css
   /* Hide Gallery tab on mobile navigation */
   .nav-gallery {
     display: none !important;
   }
   ```
4. **Remove or comment out** this rule:
   ```css
   /* Gallery tab re-enabled on mobile */
   /* .nav-gallery {
     display: none !important;
   } */
   ```
5. **Adjust nav distribution** (if needed): Remove or adjust the nav spacing rules below the `.nav-gallery` rule if you want different spacing with 4 items.

## Implementation Details

- The Gallery tab is hidden via CSS class `.nav-gallery` applied to the Gallery Link component
- Only affects mobile viewports (max-width: 428px)
- Desktop navigation remains unchanged
- The Gallery page (`/gallery`) is still accessible via direct URL or other navigation methods

## Testing

To verify Gallery tab is hidden:
1. Open the app on a mobile device or browser dev tools (375-428px width)
2. Check the bottom navigation bar
3. You should see: HOME, BROWSE, PROFILE/DASHBOARD (3 items, not 4)

To verify Gallery tab re-enablement:
1. Remove the CSS rule as described above
2. Refresh the mobile view
3. You should see: HOME, BROWSE, GALLERY, PROFILE/DASHBOARD (4 items)

