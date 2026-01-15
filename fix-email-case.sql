-- Fix email case to match auth normalization
UPDATE "User"
SET email = 'mahmoud@pyrarides.com'
WHERE email = 'Mahmoud@pyrarides.com';

-- Verify the change
SELECT email, "fullName", role 
FROM "User" 
WHERE email = 'mahmoud@pyrarides.com';
