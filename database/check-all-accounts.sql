-- 🔍 CHECK ALL ACCOUNTS IN DATABASE
-- Run this in Neon Console to see all users with their roles and passwords
-- This will show you what accounts actually exist in your database

-- ============================================
-- ALL USERS WITH THEIR ROLES
-- ============================================
SELECT 
  u.id,
  u.email,
  u."phoneNumber",
  u."fullName",
  u.role,
  s.name as stable_name,
  s.status as stable_status,
  u."createdAt"
FROM "User" u
LEFT JOIN "Stable" s ON s."ownerId" = u.id
ORDER BY u."createdAt" DESC;

-- ============================================
-- ONLY STABLE OWNERS
-- ============================================
SELECT 
  u.email,
  u."phoneNumber",
  u."fullName",
  u.role,
  s.name as stable_name,
  s.location,
  s.status as stable_status
FROM "User" u
LEFT JOIN "Stable" s ON s."ownerId" = u.id
WHERE u.role = 'stable_owner'
ORDER BY s.name;

-- ============================================
-- ONLY RIDERS
-- ============================================
SELECT 
  u.email,
  u."fullName",
  u.role,
  u."createdAt"
FROM "User" u
WHERE u.role = 'rider'
ORDER BY u."createdAt" DESC;

-- ============================================
-- ONLY ADMINS
-- ============================================
SELECT 
  u.email,
  u."fullName",
  u.role,
  u."createdAt"
FROM "User" u
WHERE u.role = 'admin'
ORDER BY u."createdAt" DESC;

