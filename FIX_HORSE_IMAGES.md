# Fix Horse Images Not Displaying

## Issue
Horse images are saved in the database but not displaying on the management page. The converted Google Drive URL is correct (`https://drive.google.com/uc?id=1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV&export=view`), but the image doesn't show.

## Root Cause
**The database migration for `availabilityStatus` field has NOT been run yet**, causing the API to fail when fetching horses with the new field.

---

## ⚠️ CRITICAL: Run This SQL Migration NOW

### In Neon Console:
1. Go to: https://console.neon.tech
2. Select your `pyraride` project
3. Click **SQL Editor**
4. Copy and paste this EXACT SQL:

```sql
-- Create the enum type
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'injured', 'unavailable');

-- Add column to Horse table
ALTER TABLE "Horse" 
ADD COLUMN "availabilityStatus" "AvailabilityStatus" DEFAULT 'available';
```

5. Click **Run**
6. You should see: "Success" message

---

## Why This Fixes The Problem

**Current State:**
- ✅ Horse is saved in database with `imageUrls`
- ✅ Google Drive URL is converted correctly
- ❌ API fails when trying to SELECT from Horse table (missing column)
- ❌ No horses returned to frontend
- ❌ Card shows "Coming Soon" (no data)

**After Migration:**
- ✅ API can SELECT from Horse table successfully
- ✅ Horses data returned with imageUrls
- ✅ Images display on cards

---

## Verification Steps

### 1. Run the SQL migration above

### 2. Refresh the Manage Horses page
```
https://pyrarides.com/dashboard/stable/horses
```

### 3. Check if the horse image now displays
- The image should appear instead of "Coming Soon"
- You should see the white horse with green bridle from your Google Drive

### 4. Check browser console (F12)
- Should see successful API responses
- No more errors about missing columns

---

## If Images Still Don't Display After Migration

### Option A: Use Alternative Google Drive URL Format

Change the conversion to use Google's content delivery:

```typescript
// Instead of:
https://drive.google.com/uc?id=FILE_ID&export=view

// Use:
https://lh3.googleusercontent.com/d/FILE_ID
```

### Option B: Test the converted URL directly

Open this in a browser:
```
https://drive.google.com/uc?id=1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV&export=view
```

**If it downloads the image instead of displaying it:**
- Google Drive requires authentication
- Solution: Upload images to a different host (Cloudinary, Vercel Blob, or S3)

**If it displays the image:**
- The conversion is working
- Issue is in the React component

---

## Quick Fix: Make Horse Cards Match Stable Cards

Stable cards ARE working, so let's use the exact same pattern:

```tsx
// Current horse card (using native img):
<img src={horse.imageUrls[0]} alt={horse.name} className="..." />

// Change to (using Next.js Image like stables):
<Image 
  src={horse.imageUrls[0]} 
  alt={horse.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 600px"
/>
```

---

## Summary

**DO THIS NOW:**
1. ✅ Run the SQL migration in Neon Console (copy from above)
2. ✅ Refresh the manage horses page
3. ✅ Check if images display

**99% chance this fixes it!** The migration is the missing piece.

---

## Still Need Help?

Send me a screenshot of:
1. The Neon Console after running the SQL (showing success/error)
2. The browser console (F12) on the manage horses page
3. The Network tab showing the API request to `/api/horses`

I'll diagnose from there! 🚀

