-- Debug: Check if horse's stableId matches any stable
SELECT 
  h.id as horse_id,
  h.name as horse_name,
  h."stableId" as horse_stable_id,
  h."isActive" as horse_is_active,
  h."availabilityStatus" as horse_status,
  s.id as stable_id,
  s.name as stable_name,
  s."ownerId" as stable_owner_id,
  u.email as owner_email
FROM "Horse" h
LEFT JOIN "Stable" s ON h."stableId" = s.id
LEFT JOIN "User" u ON s."ownerId" = u.id
WHERE h.name = 'صعب';

