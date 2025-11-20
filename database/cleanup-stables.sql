-- SQL script to clean up all existing stable data
-- Run this BEFORE running create-real-stables.sql
-- WARNING: This will permanently delete all stable-related data!

-- Step 1: Delete all bookings related to stables
DELETE FROM "Booking" WHERE "stableId" IN (SELECT id FROM "Stable");

-- Step 2: Delete all reviews related to stables
DELETE FROM "Review" WHERE "stableId" IN (SELECT id FROM "Stable");

-- Step 3: Delete all horses (this will cascade to HorseMedia via onDelete: Cascade)
DELETE FROM "Horse" WHERE "stableId" IN (SELECT id FROM "Stable");

-- Step 4: Delete all stables
DELETE FROM "Stable";

-- Step 5: Delete stable owner users (OPTIONAL - only if you want to remove the user accounts too)
-- Uncomment the line below if you want to delete the user accounts as well
-- WARNING: This will also delete any other data related to these users (bookings as riders, etc.)
-- DELETE FROM "User" WHERE role = 'stable_owner';

-- Alternative: Keep users but reset their role to 'rider' instead of deleting
-- Uncomment this if you prefer to keep the accounts but change their role:
-- UPDATE "User" SET role = 'rider' WHERE role = 'stable_owner';


