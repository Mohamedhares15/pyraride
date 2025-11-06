-- Create test accounts for PyraRide
-- Run this in Neon SQL Editor

-- Note: Password hash is for "password123"
-- You can use bcrypt to generate your own hash if needed

-- 1. Create a Rider (already exists if you signed up)
-- Users created through signup are automatically riders

-- 2. Update an existing user to Stable Owner
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'YOUR_EMAIL_HERE'
  AND role = 'rider';

-- Replace YOUR_EMAIL_HERE with your actual email

-- 3. Update an existing user to Admin
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE'
  AND role = 'rider';

-- Replace YOUR_EMAIL_HERE with your actual email

-- 4. Check your current role
SELECT id, email, role, "fullName" FROM "User";

-- 5. Create multiple test accounts (optional)
-- Uncomment below to create test users

/*
-- Test Rider
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'rider@test.com',
  '$2a$10$KIXrBY7XCt.5M5YHKLHmOuDJ5HqYqHbL7QqyEV5yY9qXvqFqHqHqH',
  'Test Rider',
  'rider',
  NOW()
);

-- Test Stable Owner
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'owner@test.com',
  '$2a$10$KIXrBY7XCt.5M5YHKLHmOuDJ5HqYqHbL7QqyEV5yY9qXvqFqHqHqH',
  'Test Stable Owner',
  'stable_owner',
  NOW()
);

-- Test Admin
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  '$2a$10$KIXrBY7XCt.5M5YHKLHmOuDJ5HqYqHbL7QqyEV5yY9qXvqFqHqHqH',
  'Test Admin',
  'admin',
  NOW()
);
*/

-- After running this:
-- 1. Sign out from your current session
-- 2. Sign back in
-- 3. Your role will be updated!

