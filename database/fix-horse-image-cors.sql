-- Fix horse image URL to use CORS-friendly Google Drive format
-- This changes from drive.google.com/uc (blocked by CORS) 
-- to drive.usercontent.google.com/download (no CORS restrictions)

UPDATE "Horse"
SET "imageUrls" = ARRAY['https://drive.usercontent.google.com/download?id=1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV&export=view&authuser=0']
WHERE name = 'صعب';

-- Verify the update
SELECT name, "imageUrls", "availabilityStatus" 
FROM "Horse" 
WHERE name = 'صعب';

