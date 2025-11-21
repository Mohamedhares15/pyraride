-- Fix horse image URL to use thumbnail endpoint for better reliability
-- This converts the existing Google Drive URL to the thumbnail format

UPDATE "Horse"
SET "imageUrls" = ARRAY['https://drive.google.com/thumbnail?id=1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV&sz=w2000']
WHERE name = 'صعب'
AND "imageUrls" @> ARRAY['https://drive.google.com/uc?id=1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV&export=view'];

-- Verify the update
SELECT 
  name,
  "imageUrls",
  "availabilityStatus"
FROM "Horse"
WHERE name = 'صعب';

