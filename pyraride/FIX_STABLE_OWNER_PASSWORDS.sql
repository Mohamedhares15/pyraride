-- 🔧 FIX: Update Stable Owner Passwords with Real Bcrypt Hashes
-- Run this in Neon Console to fix login issues
-- Password for all: Test123!

-- Update password for ahmed@giza-pyramids.com
UPDATE "User" 
SET "passwordHash" = '$2a$10$dfl7DdTXRo3gipuea4xQmeFe1VoSx.5RJ/..bAAgXN0LklETCfRLC'
WHERE email = 'ahmed@giza-pyramids.com';

-- Update password for mohamed@giza-desert.com
UPDATE "User" 
SET "passwordHash" = '$2a$10$15aREEdSOoA65p6HI/LjOOat3o7vg.LjGFQ4Xg3Pnc77s8zzX.Bre'
WHERE email = 'mohamed@giza-desert.com';

-- Update password for fatima@saqqara-stables.com
UPDATE "User" 
SET "passwordHash" = '$2a$10$6aCoMnYbTOP2oSd6WxYoDuTEj6qvFZuf58vPjN7o8OJDuOTx9MkoK'
WHERE email = 'fatima@saqqara-stables.com';

-- Update password for omar@royal-rides.com
UPDATE "User" 
SET "passwordHash" = '$2a$10$51BlUsgpdRnb4X6k1qNBWeRdpdCrYZaInyPf2lzLI91dkdgcK6oL2'
WHERE email = 'omar@royal-rides.com';

-- Update password for nour@ancient-paths.com
UPDATE "User" 
SET "passwordHash" = '$2a$10$sKTx4shjrf5Tbsf5kSnNAep6OHRY8FRq3wnEiHXnPRbz6gq3vlqp6'
WHERE email = 'nour@ancient-paths.com';

-- Verify the updates
SELECT email, role, LEFT("passwordHash", 10) as "passwordHash_preview" 
FROM "User" 
WHERE email IN (
  'ahmed@giza-pyramids.com',
  'mohamed@giza-desert.com',
  'fatima@saqqara-stables.com',
  'omar@royal-rides.com',
  'nour@ancient-paths.com'
);

-- ✅ After running this, you can sign in with:
-- Email: ahmed@giza-pyramids.com
-- Password: Test123!

