-- SQL Code to add a Stable Owner, a Stable, and 5 Horses

-- 1. Insert Stable Owner (Password is 'password123')
INSERT INTO "User" ("id", "email", "phoneNumber", "passwordHash", "fullName", "role", "createdAt")
VALUES (
  'owner-uuid-123456', 
  'testowner@pyraride.com', 
  '+201000000000', 
  '$2b$10$EpWaTucFF9y.qjFv.WjHO.qjFv.WjHO.qjFv.WjHO.qjFv.WjHO', -- Placeholder hash for 'password123'
  'Test Stable Owner', 
  'stable_owner', 
  NOW()
);

-- 2. Insert Stable
INSERT INTO "Stable" ("id", "name", "description", "location", "address", "ownerId", "status", "minLeadTimeHours", "createdAt", "updatedAt")
VALUES (
  'stable-uuid-123456', 
  'Pyramids Royal Stable', 
  'Experience the magic of the pyramids with our premium horses. Best view of the Sphinx.', 
  'Giza', 
  'Nazlet El Semman, Giza Plateau', 
  'owner-uuid-123456', 
  'approved', 
  2, 
  NOW(), 
  NOW()
);

-- 3. Insert 5 Horses
INSERT INTO "Horse" ("id", "stableId", "name", "description", "pricePerHour", "skillLevel", "isActive", "createdAt", "updatedAt")
VALUES 
(
  'horse-uuid-001', 
  'stable-uuid-123456', 
  'Thunder', 
  'Strong and energetic Arabian stallion. Perfect for galloping in the desert.', 
  500.00, 
  'ADVANCED', 
  true, 
  NOW(), 
  NOW()
),
(
  'horse-uuid-002', 
  'stable-uuid-123456', 
  'Bella', 
  'Gentle and calm mare. Ideal for first-time riders and photoshoots.', 
  350.00, 
  'BEGINNER', 
  true, 
  NOW(), 
  NOW()
),
(
  'horse-uuid-003', 
  'stable-uuid-123456', 
  'Spirit', 
  'Responsive and well-trained. Great for intermediate riders looking for a smooth ride.', 
  400.00, 
  'INTERMEDIATE', 
  true, 
  NOW(), 
  NOW()
),
(
  'horse-uuid-004', 
  'stable-uuid-123456', 
  'Sultan', 
  'Majestic white Arabian horse. The star of our stable.', 
  600.00, 
  'ADVANCED', 
  true, 
  NOW(), 
  NOW()
),
(
  'horse-uuid-005', 
  'stable-uuid-123456', 
  'Luna', 
  'Sweet and patient. Loves children and relaxing sunset rides.', 
  300.00, 
  'BEGINNER', 
  true, 
  NOW(), 
  NOW()
);
