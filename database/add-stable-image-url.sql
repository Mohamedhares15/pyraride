-- Add imageUrl field to Stable table
-- Run this in Neon Console to fix the "Failed to fetch stable data" error

-- Add the new column
ALTER TABLE "Stable" 
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Stable'
ORDER BY ordinal_position;

-- ✅ After running this, refresh your dashboard page!

