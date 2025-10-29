# 🔧 **COMPLETE DATABASE FIX - Run This SQL Now**

## ❌ **The Problem:**

Your Neon database is missing columns that the Prisma schema expects:
- `refundStatus`
- `refundAmount`
- `stripeRefundId`
- `refundReason`
- `cancellationReason`
- `rescheduledFrom`
- `rescheduledTo`
- `isRescheduled`
- `cancelledBy`
- `updatedAt`

## ✅ **THE FIX:**

Go to your Neon SQL Editor and run this SQL to add the missing columns:

```sql
-- Add missing columns to Booking table
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS "refundStatus" TEXT,
ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(65,30),
ADD COLUMN IF NOT EXISTS "stripeRefundId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "refundReason" TEXT,
ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT,
ADD COLUMN IF NOT EXISTS "rescheduledFrom" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rescheduledTo" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isRescheduled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Create index for refund status
CREATE INDEX IF NOT EXISTS "Booking_refundStatus_idx" ON "Booking"("refundStatus");

-- Set default for updatedAt to auto-update
-- Note: PostgreSQL doesn't have auto-update, but we can handle this in the application
```

---

## 🚀 **Steps to Fix:**

1. **Go to**: https://console.neon.tech
2. **Click**: SQL Editor
3. **Click**: New Query
4. **Paste**: The SQL above
5. **Click**: Run
6. **Wait**: 2 seconds
7. **Refresh**: https://pyraride.vercel.app/dashboard/rider

---

## ✅ **After Running This:**

- Bookings will work
- No more 500 errors
- All features functional

**Run this SQL now!**

