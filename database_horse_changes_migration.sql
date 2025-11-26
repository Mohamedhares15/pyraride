-- Migration: Add HorseChangeRequest model for admin approval of horse price/description changes
-- Date: 2025-01-XX
-- Description: When stable owners change horse prices or descriptions, these changes now require admin approval

-- Create enum type for HorseChangeRequestStatus
CREATE TYPE "HorseChangeRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- Create HorseChangeRequest table
CREATE TABLE IF NOT EXISTS "HorseChangeRequest" (
    "id" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "status" "HorseChangeRequestStatus" NOT NULL DEFAULT 'pending',
    "proposedName" TEXT,
    "proposedDescription" TEXT,
    "proposedPricePerHour" DECIMAL(10,2),
    "proposedImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HorseChangeRequest_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "HorseChangeRequest_status_idx" ON "HorseChangeRequest"("status");
CREATE INDEX IF NOT EXISTS "HorseChangeRequest_horseId_idx" ON "HorseChangeRequest"("horseId");

-- Add foreign key constraint for horseId (relation mode may not use actual FKs, but good to have for reference)
-- Note: In relationMode = "prisma", foreign keys are not enforced by the database
-- But the relation is maintained at the application level

-- Add foreign key constraint for reviewedBy (references User.id)
-- Note: In relationMode = "prisma", foreign keys are not enforced by the database

-- Optional: Add comments for documentation
COMMENT ON TABLE "HorseChangeRequest" IS 'Tracks pending changes to horse prices and descriptions that require admin approval';
COMMENT ON COLUMN "HorseChangeRequest"."status" IS 'Current status: pending, approved, or rejected';
COMMENT ON COLUMN "HorseChangeRequest"."proposedPricePerHour" IS 'New price per hour proposed by stable owner';
COMMENT ON COLUMN "HorseChangeRequest"."proposedDescription" IS 'New description proposed by stable owner';

