/**
 * Script to create test stable owners with complete data
 * Run with: npx tsx scripts/create-test-stable-owners.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🏢 Creating test stable owners...\n");

  const stableOwners = [
    {
      email: "ahmed@giza-pyramids.com",
      fullName: "Ahmed Ali",
      stable: {
        name: "Giza Pyramid Tours",
        description: "Experience the magic of the Pyramids on horseback! Our professional guides offer safe, memorable rides with well-trained Arabian horses. Perfect for sunrise and sunset tours.",
        location: "Giza",
        address: "Pyramid Road, Giza Plateau, Giza 12613, Egypt",
      },
      horses: [
        {
          name: "Luna",
          description: "Beautiful gray Arabian mare, gentle and experienced. Perfect for beginners and experienced riders.",
          imageUrls: ["/gallery1.jpg", "/gallery2.jpg"],
        },
        {
          name: "Thunder",
          description: "Strong, majestic black Arabian stallion. Great for adventurous riders who want an energetic ride.",
          imageUrls: ["/gallery3.jpg"],
        },
        {
          name: "Desert Rose",
          description: "Elegant chestnut Arabian mare with a calm temperament. Ideal for families and photo sessions.",
          imageUrls: ["/gallery4.jpeg", "/gallery5.jpeg"],
        },
      ],
    },
    {
      email: "mohamed@giza-desert.com",
      fullName: "Mohamed Hassan",
      stable: {
        name: "Giza Desert Adventures",
        description: "Premium horse riding experiences in the Giza desert. Our stables are certified and our horses are cared for with the highest standards. Book your unforgettable adventure today!",
        location: "Giza",
        address: "Desert Road, Giza, Egypt",
      },
      horses: [
        {
          name: "Apollo",
          description: "Golden palomino Arabian gelding. Friendly, patient, and loves meeting new people.",
          imageUrls: ["/gallery1.jpg"],
        },
        {
          name: "Sahara",
          description: "Beautiful bay Arabian mare with excellent stamina. Perfect for longer desert tours.",
          imageUrls: ["/gallery2.jpg"],
        },
        {
          name: "Phoenix",
          description: "Strong and confident Arabian stallion. Experienced riders will love his spirited nature.",
          imageUrls: ["/gallery3.jpg"],
        },
      ],
    },
    {
      email: "fatima@saqqara-stables.com",
      fullName: "Fatima Mahmoud",
      stable: {
        name: "Saqqara Historical Stables",
        description: "Ride through history at Saqqara! Our experienced guides will take you on a journey around the Step Pyramid and ancient tombs. Family-friendly and safe.",
        location: "Saqqara",
        address: "Saqqara Road, Memphis, Giza Governorate, Egypt",
      },
      horses: [
        {
          name: "Cleopatra",
          description: "Regal white Arabian mare. Graceful and calm, perfect for historical tours.",
          imageUrls: ["/gallery4.jpeg"],
        },
        {
          name: "Pharaoh",
          description: "Noble bay Arabian stallion. Strong and steady, ideal for longer rides.",
          imageUrls: ["/gallery5.jpeg"],
        },
        {
          name: "Nefertiti",
          description: "Elegant black Arabian mare with a gentle spirit. Great for all skill levels.",
          imageUrls: ["/gallery1.jpg"],
        },
      ],
    },
    {
      email: "omar@royal-rides.com",
      fullName: "Omar Khaled",
      stable: {
        name: "Royal Horse Rides",
        description: "Luxury horse riding experiences with beautiful views of the pyramids. Our horses are purebred Arabians, trained for safety and comfort. Professional photography included!",
        location: "Saqqara",
        address: "Memphis Road, Saqqara, Egypt",
      },
      horses: [
        {
          name: "Sultan",
          description: "Magnificent chestnut Arabian stallion. Premium experience for discerning riders.",
          imageUrls: ["/gallery2.jpg"],
        },
        {
          name: "Princess",
          description: "Beautiful gray Arabian mare. Elegant and well-trained for luxury tours.",
          imageUrls: ["/gallery3.jpg"],
        },
        {
          name: "King",
          description: "Imposing black Arabian stallion. Perfect for experienced riders seeking excitement.",
          imageUrls: ["/gallery4.jpeg"],
        },
      ],
    },
    {
      email: "nour@ancient-paths.com",
      fullName: "Nour Abdelrahman",
      stable: {
        name: "Ancient Paths Stables",
        description: "Discover the ancient wonders of Egypt on horseback. Expert guides, certified safety standards, and unforgettable memories. Special sunrise and sunset tours available.",
        location: "Saqqara",
        address: "Historical Path, Saqqara Necropolis, Egypt",
      },
      horses: [
        {
          name: "Horizon",
          description: "Sunset-colored palomino Arabian mare. Perfect for early morning and evening rides.",
          imageUrls: ["/gallery5.jpeg"],
        },
        {
          name: "Desert Wind",
          description: "Swift bay Arabian gelding. Energetic and perfect for adventure seekers.",
          imageUrls: ["/gallery1.jpg"],
        },
        {
          name: "Golden Hour",
          description: "Beautiful golden Arabian mare. Calm and photogenic for memorable experiences.",
          imageUrls: ["/gallery2.jpg"],
        },
      ],
    },
  ];

  const password = await bcrypt.hash("Test123!", 10);

  for (const ownerData of stableOwners) {
    try {
      // Create or update user
      const user = await prisma.user.upsert({
        where: { email: ownerData.email },
        update: {
          role: "stable_owner",
          fullName: ownerData.fullName,
        },
        create: {
          email: ownerData.email,
          passwordHash: password,
          fullName: ownerData.fullName,
          role: "stable_owner",
        },
      });

      console.log(`✅ Created/Updated user: ${user.email}`);

      // Check if stable exists
      const existingStable = await prisma.stable.findUnique({
        where: { ownerId: user.id },
      });

      if (existingStable) {
        console.log(`   ⚠️  Stable already exists: ${existingStable.name}`);
      } else {
        // Create stable
        const stable = await prisma.stable.create({
          data: {
            name: ownerData.stable.name,
            description: ownerData.stable.description,
            location: ownerData.stable.location,
            address: ownerData.stable.address,
            ownerId: user.id,
            status: "approved", // Auto-approve for testing
          },
        });

        console.log(`   ✅ Created stable: ${stable.name}`);

        // Create horses
        for (const horseData of ownerData.horses) {
          const horse = await prisma.horse.create({
            data: {
              name: horseData.name,
              description: horseData.description,
              imageUrls: horseData.imageUrls,
              stableId: stable.id,
              isActive: true,
            },
          });
          console.log(`      ✅ Created horse: ${horse.name}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating ${ownerData.email}:`, error);
    }
  }

  console.log("\n🎉 Test stable owners creation complete!");
  console.log("\n📋 Test Accounts:");
  console.log("   All passwords: Test123!");
  stableOwners.forEach((owner) => {
    console.log(`   - ${owner.email} (${owner.fullName})`);
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

