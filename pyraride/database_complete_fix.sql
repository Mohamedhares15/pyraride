-- Complete Database Fix for PyraRide
-- Run this in Neon SQL Editor to fix all missing columns

-- Add all missing columns to Booking table
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS "refundStatus" TEXT,
ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(65,30),
ADD COLUMN IF NOT EXISTS "stripeRefundId" TEXT,
ADD COLUMN IF NOT EXISTS "refundReason" TEXT,
ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT,
ADD COLUMN IF NOT EXISTS "rescheduledFrom" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rescheduledTo" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isRescheduled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Booking_refundStatus_idx" ON "Booking"("refundStatus");
CREATE INDEX IF NOT EXISTS "Booking_cancelledBy_idx" ON "Booking"("cancelledBy");

-- Update BookingStatus enum to match schema
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'rescheduled';

-- Update updatedAt timestamp function (PostgreSQL compatible)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updatedAt
DROP TRIGGER IF EXISTS update_booking_updated_at ON "Booking";
CREATE TRIGGER update_booking_updated_at
    BEFORE UPDATE ON "Booking"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Booking' 
ORDER BY column_name;

