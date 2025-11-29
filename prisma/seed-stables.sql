-- Create Stables and Link to Owners

-- 1. Arafa -> Hooves
WITH target_user AS (
    SELECT id FROM "User" WHERE "fullName" ILIKE '%Arafa%' LIMIT 1
),
new_stable AS (
    INSERT INTO "Stable" ("id", "name", "description", "location", "address", "status", "ownerId", "createdAt")
    SELECT 
        gen_random_uuid(), 
        'Hooves', 
        'Welcome to Hooves, a premier horse riding stable.', 
        'Saqqara', 
        'Saqqara, Egypt', 
        'approved'::"StableStatus", 
        id,
        NOW()
    FROM target_user
    RETURNING "id", "ownerId"
)
UPDATE "User"
SET "stableId" = (SELECT "id" FROM new_stable), "role" = 'stable_owner'::"Role"
WHERE "id" = (SELECT "ownerId" FROM new_stable);

-- 2. Alaa -> Wadi EL Kheil
WITH target_user AS (
    SELECT id FROM "User" WHERE "fullName" ILIKE '%Alaa%' LIMIT 1
),
new_stable AS (
    INSERT INTO "Stable" ("id", "name", "description", "location", "address", "status", "ownerId", "createdAt")
    SELECT 
        gen_random_uuid(), 
        'Wadi EL Kheil', 
        'Welcome to Wadi EL Kheil, a premier horse riding stable.', 
        'Saqqara', 
        'Saqqara, Egypt', 
        'approved'::"StableStatus", 
        id,
        NOW()
    FROM target_user
    RETURNING "id", "ownerId"
)
UPDATE "User"
SET "stableId" = (SELECT "id" FROM new_stable), "role" = 'stable_owner'::"Role"
WHERE "id" = (SELECT "ownerId" FROM new_stable);

-- 3. Mohamed EL Bana -> Beit Zeina
WITH target_user AS (
    SELECT id FROM "User" WHERE "fullName" ILIKE '%Mohamed EL Bana%' LIMIT 1
),
new_stable AS (
    INSERT INTO "Stable" ("id", "name", "description", "location", "address", "status", "ownerId", "createdAt")
    SELECT 
        gen_random_uuid(), 
        'Beit Zeina', 
        'Welcome to Beit Zeina, a premier horse riding stable.', 
        'Saqqara', 
        'Saqqara, Egypt', 
        'approved'::"StableStatus", 
        id,
        NOW()
    FROM target_user
    RETURNING "id", "ownerId"
)
UPDATE "User"
SET "stableId" = (SELECT "id" FROM new_stable), "role" = 'stable_owner'::"Role"
WHERE "id" = (SELECT "ownerId" FROM new_stable);

-- 4. Ibrahim -> Aseel
WITH target_user AS (
    SELECT id FROM "User" WHERE "fullName" ILIKE '%Ibrahim%' LIMIT 1
),
new_stable AS (
    INSERT INTO "Stable" ("id", "name", "description", "location", "address", "status", "ownerId", "createdAt")
    SELECT 
        gen_random_uuid(), 
        'Aseel', 
        'Welcome to Aseel, a premier horse riding stable.', 
        'Saqqara', 
        'Saqqara, Egypt', 
        'approved'::"StableStatus", 
        id,
        NOW()
    FROM target_user
    RETURNING "id", "ownerId"
)
UPDATE "User"
SET "stableId" = (SELECT "id" FROM new_stable), "role" = 'stable_owner'::"Role"
WHERE "id" = (SELECT "ownerId" FROM new_stable);
