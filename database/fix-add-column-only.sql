-- Add availabilityStatus column to Horse table
-- (The enum type already exists, so we only need to add the column)

ALTER TABLE "Horse" 
ADD COLUMN "availabilityStatus" "AvailabilityStatus" DEFAULT 'available';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Horse' AND column_name = 'availabilityStatus';

