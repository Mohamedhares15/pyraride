# 🚀 Deployment Instructions

## ✅ Code Deployed!

Your changes have been committed and pushed to GitHub. If Vercel is connected to your repository, it should automatically deploy.

---

## 📋 Important: Run Database Migration

**Before testing, you MUST run the database migration** to add the `commissionRate` column.

### Option 1: Run Migration via Neon Dashboard (Recommended)

1. Go to your **Neon Console**: https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Add commissionRate column
ALTER TABLE "Stable" 
ADD COLUMN IF NOT EXISTS "commissionRate" DECIMAL(5, 4) DEFAULT 0.15;

-- Update existing stables to have 15% commission
UPDATE "Stable" 
SET "commissionRate" = 0.15 
WHERE "commissionRate" IS NULL;
```

5. Click **Run**

### Option 2: Run Migration via CLI

```bash
# Set your DATABASE_URL
export DATABASE_URL="your-neon-database-url"

# Run migration
npx prisma migrate deploy
```

---

## ✅ After Migration - Test Checklist

1. **Check Commission Rate:**
   - Go to `/dashboard/admin/stables` (as admin)
   - Verify you see commission rate displayed for each stable
   - Click "Set Commission" and test changing it

2. **Test Booking:**
   - Create a new booking
   - Check that commission is calculated at 15% (or custom rate)
   - Verify in database that commission is correct

3. **Test Analytics Charts:**
   - Go to `/dashboard/analytics`
   - Verify "Bookings Over Time" chart displays
   - Verify "Revenue Over Time" chart displays
   - Check that charts show data correctly

---

## 🐛 Troubleshooting

### If migration fails:
- Check that DATABASE_URL is set correctly in Vercel
- Verify you have write permissions in Neon
- Check Neon logs for errors

### If charts don't show:
- Verify there's booking/revenue data in the database
- Check browser console for errors
- Verify analytics API is returning data

### If commission still shows 20%:
- Clear browser cache
- Verify migration ran successfully
- Check that new bookings use the updated code

---

## 📊 What Was Deployed

✅ Commission fixed to 15% (was 20%)
✅ Per-stable commission management
✅ Admin dashboard commission settings
✅ Analytics charts (Bookings & Revenue Over Time)
✅ SEO optimizations
✅ FAQ page enhancements

---

**Next:** Run the database migration in Neon, then test everything!

