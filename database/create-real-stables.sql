-- SQL INSERT statements for PyraRide Stables
-- Run this directly in your PostgreSQL database

-- Password for all accounts: PyraRide2024!
-- Owners should change this password on first login

-- Creating stable owner: Mohamed el bana (beitzeina@pyrarides.com)
INSERT INTO "User" (id, email, "phoneNumber", "passwordHash", "fullName", role, "createdAt")
VALUES (gen_random_uuid(), 'beitzeina@pyrarides.com', '+201064059606', '$2a$10$FabRrMd.ZxnGSEz0dvUfZO/vK.JzzGn0G.oDbUkvuFh.SFutZnju.', 'Mohamed el bana', 'stable_owner', NOW())
ON CONFLICT (email) DO UPDATE 
SET "phoneNumber" = EXCLUDED."phoneNumber",
    "fullName" = EXCLUDED."fullName",
    role = 'stable_owner'
RETURNING id;

-- Creating stable: Beit Zeina
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email = 'beitzeina@pyrarides.com'), 'Beit Zeina', 'Professional horse riding stable in Saqqara. Experience and description coming soon.', 'Saqqara', 'https://maps.app.goo.gl/G9JbNGyzqJvwnRuQ9?g_st=ipc', 'approved', NOW())
ON CONFLICT ("ownerId") DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    status = 'approved';

-- Creating stable owner: Arafa (hooves@pyrarides.com)
INSERT INTO "User" (id, email, "phoneNumber", "passwordHash", "fullName", role, "createdAt")
VALUES (gen_random_uuid(), 'hooves@pyrarides.com', '+201070403443', '$2a$10$FabRrMd.ZxnGSEz0dvUfZO/vK.JzzGn0G.oDbUkvuFh.SFutZnju.', 'Arafa', 'stable_owner', NOW())
ON CONFLICT (email) DO UPDATE 
SET "phoneNumber" = EXCLUDED."phoneNumber",
    "fullName" = EXCLUDED."fullName",
    role = 'stable_owner'
RETURNING id;

-- Creating stable: Hooves
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email = 'hooves@pyrarides.com'), 'Hooves', 'Professional horse riding stable in Saqqara. Experience and description coming soon.', 'Saqqara', 'https://maps.app.goo.gl/tHu8mNYAUB7tssFY7?g_st=ipc', 'approved', NOW())
ON CONFLICT ("ownerId") DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    status = 'approved';

-- Creating stable owner: Ibrahim (aseel@pyrarides.com)
INSERT INTO "User" (id, email, "phoneNumber", "passwordHash", "fullName", role, "createdAt")
VALUES (gen_random_uuid(), 'aseel@pyrarides.com', '+201553645745', '$2a$10$FabRrMd.ZxnGSEz0dvUfZO/vK.JzzGn0G.oDbUkvuFh.SFutZnju.', 'Ibrahim', 'stable_owner', NOW())
ON CONFLICT (email) DO UPDATE 
SET "phoneNumber" = EXCLUDED."phoneNumber",
    "fullName" = EXCLUDED."fullName",
    role = 'stable_owner'
RETURNING id;

-- Creating stable: Aseel
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email = 'aseel@pyrarides.com'), 'Aseel', 'Professional horse riding stable in Saqqara. Experience and description coming soon.', 'Saqqara', 'https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc', 'approved', NOW())
ON CONFLICT ("ownerId") DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    status = 'approved';

-- Creating stable owner: Alaa (alaa@pyrarides.com)
INSERT INTO "User" (id, email, "phoneNumber", "passwordHash", "fullName", role, "createdAt")
VALUES (gen_random_uuid(), 'alaa@pyrarides.com', '+20100622105', '$2a$10$FabRrMd.ZxnGSEz0dvUfZO/vK.JzzGn0G.oDbUkvuFh.SFutZnju.', 'Alaa', 'stable_owner', NOW())
ON CONFLICT (email) DO UPDATE 
SET "phoneNumber" = EXCLUDED."phoneNumber",
    "fullName" = EXCLUDED."fullName",
    role = 'stable_owner'
RETURNING id;

-- Creating stable: Alaa
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email = 'alaa@pyrarides.com'), 'Alaa', 'Professional horse riding stable in Saqqara. Experience and description coming soon.', 'Saqqara', 'https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc', 'approved', NOW())
ON CONFLICT ("ownerId") DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    status = 'approved';

