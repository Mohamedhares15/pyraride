-- 🏢 Create Complete Test Data for Stable Owners
-- Run this in Neon Console: https://console.neon.tech

-- First, hash passwords (use bcrypt - this is just for testing)
-- Password for all test users: "Test123!"
-- In production, use: bcrypt.hash("Test123!", 10)

-- ============================================
-- CREATE STABLE OWNER USERS (with hashed passwords)
-- ============================================

-- Stable Owner 1: Giza Pyramid Tours
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'ahmed@giza-pyramids.com',
  '$2a$10$dfl7DdTXRo3gipuea4xQmeFe1VoSx.5RJ/..bAAgXN0LklETCfRLC',
  'Ahmed Ali',
  'stable_owner',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'stable_owner', "passwordHash" = '$2a$10$dfl7DdTXRo3gipuea4xQmeFe1VoSx.5RJ/..bAAgXN0LklETCfRLC';

-- Stable Owner 2: Giza Desert Adventures
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'mohamed@giza-desert.com',
  '$2a$10$15aREEdSOoA65p6HI/LjOOat3o7vg.LjGFQ4Xg3Pnc77s8zzX.Bre',
  'Mohamed Hassan',
  'stable_owner',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'stable_owner', "passwordHash" = '$2a$10$15aREEdSOoA65p6HI/LjOOat3o7vg.LjGFQ4Xg3Pnc77s8zzX.Bre';

-- Stable Owner 3: Saqqara Stables
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'fatima@saqqara-stables.com',
  '$2a$10$6aCoMnYbTOP2oSd6WxYoDuTEj6qvFZuf58vPjN7o8OJDuOTx9MkoK',
  'Fatima Mahmoud',
  'stable_owner',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'stable_owner', "passwordHash" = '$2a$10$6aCoMnYbTOP2oSd6WxYoDuTEj6qvFZuf58vPjN7o8OJDuOTx9MkoK';

-- Stable Owner 4: Royal Horse Rides
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'omar@royal-rides.com',
  '$2a$10$51BlUsgpdRnb4X6k1qNBWeRdpdCrYZaInyPf2lzLI91dkdgcK6oL2',
  'Omar Khaled',
  'stable_owner',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'stable_owner', "passwordHash" = '$2a$10$51BlUsgpdRnb4X6k1qNBWeRdpdCrYZaInyPf2lzLI91dkdgcK6oL2';

-- Stable Owner 5: Ancient Paths Stables
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'nour@ancient-paths.com',
  '$2a$10$sKTx4shjrf5Tbsf5kSnNAep6OHRY8FRq3wnEiHXnPRbz6gq3vlqp6',
  'Nour Abdelrahman',
  'stable_owner',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'stable_owner', "passwordHash" = '$2a$10$sKTx4shjrf5Tbsf5kSnNAep6OHRY8FRq3wnEiHXnPRbz6gq3vlqp6';

-- ============================================
-- CREATE STABLES
-- ============================================

-- Stable 1: Giza Pyramid Tours
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Giza Pyramid Tours',
  'Experience the magic of the Pyramids on horseback! Our professional guides offer safe, memorable rides with well-trained Arabian horses. Perfect for sunrise and sunset tours.',
  'Giza',
  'Pyramid Road, Giza Plateau, Giza 12613, Egypt',
  'approved',
  NOW()
FROM "User" u
WHERE u.email = 'ahmed@giza-pyramids.com'
ON CONFLICT ("ownerId") DO NOTHING;

-- Stable 2: Giza Desert Adventures
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Giza Desert Adventures',
  'Premium horse riding experiences in the Giza desert. Our stables are certified and our horses are cared for with the highest standards. Book your unforgettable adventure today!',
  'Giza',
  'Desert Road, Giza, Egypt',
  'approved',
  NOW()
FROM "User" u
WHERE u.email = 'mohamed@giza-desert.com'
ON CONFLICT ("ownerId") DO NOTHING;

-- Stable 3: Saqqara Stables
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Saqqara Historical Stables',
  'Ride through history at Saqqara! Our experienced guides will take you on a journey around the Step Pyramid and ancient tombs. Family-friendly and safe.',
  'Saqqara',
  'Saqqara Road, Memphis, Giza Governorate, Egypt',
  'approved',
  NOW()
FROM "User" u
WHERE u.email = 'fatima@saqqara-stables.com'
ON CONFLICT ("ownerId") DO NOTHING;

-- Stable 4: Royal Horse Rides
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Royal Horse Rides',
  'Luxury horse riding experiences with beautiful views of the pyramids. Our horses are purebred Arabians, trained for safety and comfort. Professional photography included!',
  'Saqqara',
  'Memphis Road, Saqqara, Egypt',
  'approved',
  NOW()
FROM "User" u
WHERE u.email = 'omar@royal-rides.com'
ON CONFLICT ("ownerId") DO NOTHING;

-- Stable 5: Ancient Paths Stables
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Ancient Paths Stables',
  'Discover the ancient wonders of Egypt on horseback. Expert guides, certified safety standards, and unforgettable memories. Special sunrise and sunset tours available.',
  'Saqqara',
  'Historical Path, Saqqara Necropolis, Egypt',
  'approved',
  NOW()
FROM "User" u
WHERE u.email = 'nour@ancient-paths.com'
ON CONFLICT ("ownerId") DO NOTHING;

-- ============================================
-- CREATE HORSES FOR EACH STABLE
-- ============================================

-- Horses for Giza Pyramid Tours
INSERT INTO "Horse" (id, "stableId", name, description, "imageUrls", "isActive")
SELECT 
  gen_random_uuid(),
  s.id,
  'Luna',
  'Beautiful gray Arabian mare, gentle and experienced. Perfect for beginners and experienced riders.',
  ARRAY['/gallery1.jpg', '/gallery2.jpg'],
  true
FROM "Stable" s
WHERE s.name = 'Giza Pyramid Tours'
LIMIT 1;

INSERT INTO "Horse" (id, "stableId", name, description, "imageUrls", "isActive")
SELECT 
  gen_random_uuid(),
  s.id,
  'Thunder',
  'Strong, majestic black Arabian stallion. Great for adventurous riders who want an energetic ride.',
  ARRAY['/gallery3.jpg'],
  true
FROM "Stable" s
WHERE s.name = 'Giza Pyramid Tours'
LIMIT 1;

INSERT INTO "Horse" (id, "stableId", name, description, "imageUrls", "isActive")
SELECT 
  gen_random_uuid(),
  s.id,
  'Desert Rose',
  'Elegant chestnut Arabian mare with a calm temperament. Ideal for families and photo sessions.',
  ARRAY['/gallery4.jpeg', '/gallery5.jpeg'],
  true
FROM "Stable" s
WHERE s.name = 'Giza Pyramid Tours'
LIMIT 1;

-- Horses for Giza Desert Adventures
INSERT INTO "Horse" (id, "stableId", name, description, "imageUrls", "isActive")
SELECT 
  gen_random_uuid(),
  s.id,
  'Apollo',
  'Golden palomino Arabian gelding. Friendly, patient, and loves meeting new people.',
  ARRAY['/gallery1.jpg'],
  true
FROM "Stable" s
WHERE s.name = 'Giza Desert Adventures'
LIMIT 1;

INSERT INTO "Horse" (id, "stableId", name, description, "imageUrls", "isActive")
SELECT 
  gen_random_uuid(),
  s.id,
  'Sahara',
  'Beautiful bay Arabian mare with excellent stamina. Perfect for longer desert tours.',
  ARRAY['/gallery2.jpg'],
  true
FROM "Stable" s
WHERE s.name = 'Giza Desert Adventures'
LIMIT 1;

INSERT INTO "Horse" (id, "stableId", name, description, "imageUrls", "isActive")
SELECT 
  gen_random_uuid(),
  s.id,
  'Phoenix',
  'Strong and confident Arabian stallion. Experienced riders will love his spirited nature.',
  ARRAY['/gallery3.jpg'],
  true
FROM "Stable" s
WHERE s.name = 'Giza Desert Adventures'
LIMIT 1;

-- Horses for Saqqara Stables (Repeat pattern for other stables)
-- Add similar horse inserts for remaining 3 stables...

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all stable owners
SELECT u.id, u.email, u."fullName", u.role, s.name as stable_name, s.status
FROM "User" u
LEFT JOIN "Stable" s ON s."ownerId" = u.id
WHERE u.role = 'stable_owner';

-- Check all stables
SELECT s.id, s.name, s.location, s.status, u.email as owner_email, COUNT(h.id) as horse_count
FROM "Stable" s
JOIN "User" u ON u.id = s."ownerId"
LEFT JOIN "Horse" h ON h."stableId" = s.id
GROUP BY s.id, s.name, s.location, s.status, u.email;

-- ============================================
-- RESET TEST DATA (if needed)
-- ============================================

-- Uncomment to delete test data:
-- DELETE FROM "Horse" WHERE "stableId" IN (SELECT id FROM "Stable" WHERE name LIKE '%Giza%' OR name LIKE '%Saqqara%');
-- DELETE FROM "Stable" WHERE name IN ('Giza Pyramid Tours', 'Giza Desert Adventures', 'Saqqara Historical Stables', 'Royal Horse Rides', 'Ancient Paths Stables');
-- DELETE FROM "User" WHERE email LIKE '%@giza%' OR email LIKE '%@saqqara%' OR email LIKE '%@royal%' OR email LIKE '%@ancient%';

