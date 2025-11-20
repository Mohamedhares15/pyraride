-- SQL script to clean up stable data but KEEP user accounts
-- Run this BEFORE running create-real-stables.sql
-- This version keeps the user accounts and just removes stable-related data

-- Step 1: Delete all bookings related to stables
DELETE FROM "Booking" WHERE "stableId" IN (SELECT id FROM "Stable");

-- Step 2: Delete all reviews related to stables
DELETE FROM "Review" WHERE "stableId" IN (SELECT id FROM "Stable");

-- Step 3: Delete all horses (this will cascade to HorseMedia via onDelete: Cascade)
DELETE FROM "Horse" WHERE "stableId" IN (SELECT id FROM "Stable");

-- Step 4: Delete all stables
DELETE FROM "Stable";

-- Note: User accounts are preserved. 
-- The ON CONFLICT clauses in create-real-stables.sql will update existing users
-- or you can manually reset their role if needed:
-- UPDATE "User" SET role = 'rider' WHERE role = 'stable_owner' AND email NOT IN (
--   'beitzeina@pyrarides.com',
--   'hooves@pyrarides.com',
--   'aseel@pyrarides.com',
--   'alaa@pyrarides.com'
-- );


