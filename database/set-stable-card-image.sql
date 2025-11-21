-- Set stable card image for Beit Zeina
-- This will be displayed on the stable browsing page and as the hero banner

UPDATE "Stable"
SET "imageUrl" = 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_DRIVE_FILE_ID'
WHERE name = 'Beit Zeina';

-- Example with a real Google Drive link:
-- 1. Upload your stable image to Google Drive
-- 2. Right-click → "Get link" → Set to "Anyone with the link"
-- 3. Copy the FILE_ID from the URL (the part after /d/ and before /view)
-- 4. Replace YOUR_GOOGLE_DRIVE_FILE_ID above with your actual FILE_ID

-- Or use the dashboard:
-- Go to: https://pyrarides.com/dashboard/stable/manage
-- Paste your Google Drive URL and click "Apply"
-- Then click "Save Changes"

-- Verify the update:
SELECT name, "imageUrl" FROM "Stable" WHERE name = 'Beit Zeina';

