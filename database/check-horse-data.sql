-- Check what horse data actually exists in the database
SELECT 
  id,
  name,
  "imageUrls",
  "availabilityStatus",
  "isActive",
  "stableId"
FROM "Horse"
WHERE name = 'صعب'
LIMIT 5;

