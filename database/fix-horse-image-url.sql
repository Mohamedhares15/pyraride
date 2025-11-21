-- Fix Google Drive URL format for horse images
-- The current URL uses &export=view which might not work
-- Change it to /uc?export=view&id= format

UPDATE "Horse"
SET "imageUrls" = ARRAY['https://drive.google.com/uc?export=view&id=1iMr_0Rmu-4d2Gzv1xq0DQhCgoO6CvCKV']
WHERE name = 'صعب';

-- Verify the update
SELECT name, "imageUrls" FROM "Horse" WHERE name = 'صعب';
