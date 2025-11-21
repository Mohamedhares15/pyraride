-- Add availabilityStatus field to Horse table
-- Run this in Neon Console SQL Editor

-- Step 1: Create the enum type
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'injured', 'unavailable');

-- Step 2: Add column to Horse table
ALTER TABLE "Horse" 
ADD COLUMN "availabilityStatus" "AvailabilityStatus" DEFAULT 'available';

-- Step 3: Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Horse' AND column_name = 'availabilityStatus';

