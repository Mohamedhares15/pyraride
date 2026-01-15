-- ============================================
-- Clean Slate: Remove and Recreate Mahmoud Account
-- ============================================

BEGIN;

-- 1. Delete existing stable owned by Mahmoud (if exists)
DELETE FROM "Stable" 
WHERE "ownerId" IN (
    SELECT id FROM "User" WHERE email = 'Mahmoud@pyrarides.com'
);

-- 2. Delete existing Mahmoud user account (if exists)
DELETE FROM "User" WHERE email = 'Mahmoud@pyrarides.com';

-- 2. Create new User (Stable Owner)
WITH new_user AS (
    INSERT INTO "User" (
        id,
        email,
        "passwordHash",
        "fullName",
        role,
        "createdAt"
    )
    VALUES (
        gen_random_uuid(),
        'Mahmoud@pyrarides.com',
        '$2a$10$CqaA9T9CJ3XIR8xhS/w67egpfHD1Zl./AvON.f29hu/dmGQ34tYvK', -- Password: Mohamedhares15
        'Mahmoud',
        'stable_owner',
        NOW()
    )
    RETURNING id
),
-- 3. Create new Stable
new_stable AS (
    INSERT INTO "Stable" (
        id,
        name,
        description,
        location,
        address,
        status,
        "commissionRate",
        "ownerId",
        "createdAt"
    )
    SELECT
        gen_random_uuid(),
        'Marbat EL Khayal',
        'Experience the authentic Arabian horse riding at Marbat EL Khayal.',
        'Giza',
        'Giza Plateau, near the Pyramids',
        'approved',
        0.15,
        new_user.id,
        NOW()
    FROM new_user
    RETURNING id
)
-- 4. Link User to Stable
UPDATE "User"
SET "stableId" = (SELECT id FROM new_stable)
WHERE id = (SELECT id FROM new_user);

COMMIT;

-- ============================================
-- Verify the account was created
-- ============================================
SELECT 
    u.email,
    u."fullName",
    u.role,
    s.name as "stableName",
    s.status as "stableStatus"
FROM "User" u
LEFT JOIN "Stable" s ON u."stableId" = s.id
WHERE u.email = 'Mahmoud@pyrarides.com';
