-- Fix horse image to use Google's thumbnail endpoint (lh3.googleusercontent.com)
-- This endpoint is specifically designed for embedding and doesn't have CORS restrictions

UPDATE "Horse"
SET "imageUrls" = ARRAY['https://lh3.googleusercontent.com/d/1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV']
WHERE name = 'صعب';

-- Verify the update
SELECT name, "imageUrls", "availabilityStatus" 
FROM "Horse" 
WHERE name = 'صعب';

