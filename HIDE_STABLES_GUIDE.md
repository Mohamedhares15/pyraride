# How to Hide/Show Stables

## Quick Toggle

To hide all stables from public view (e.g., while uploading images):

### In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add or update: `SHOW_STABLES` = `false`
3. Redeploy the app

### In Local Development:
1. Create/edit `.env.local` file
2. Add: `SHOW_STABLES=false`
3. Restart your dev server

## To Show Stables Again:
- Set `SHOW_STABLES=true` (or remove the variable entirely - default is true)
- Redeploy/restart

## What This Does:
- When `SHOW_STABLES=false`:
  - Browse stables page shows "No stables found"
  - Search returns empty results
  - AI chatbot won't show stable listings
  - Stable owners can still see their own stable

- When `SHOW_STABLES=true` (default):
  - All approved stables are visible
  - Normal operation

## Notes:
- This doesn't affect the database
- Stable owners can always access their own stable dashboard
- Admins can always access analytics
- This is just a visibility toggle for public browsing

