/**
 * Script to create real stable owners from provided data
 * Run with: npx tsx scripts/create-real-stables.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🏢 Creating real stable owners...\n");

  const stableOwners = [
    {
      email: "beitzeina@pyrarides.com", // Fixed: removed space
      fullName: "Mohamed el bana",
      phoneNumber: "+201064059606", // Fixed: removed spaces
      stable: {
        name: "Beit Zeina",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/G9JbNGyzqJvwnRuQ9?g_st=ipc",
      },
    },
    {
      email: "hooves@pyrarides.com", // Fixed: lowercase
      fullName: "Arafa",
      phoneNumber: "+201070403443", // Fixed: removed spaces
      stable: {
        name: "Hooves",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/tHu8mNYAUB7tssFY7?g_st=ipc",
      },
    },
    {
      email: "aseel@pyrarides.com", // Fixed: lowercase
      fullName: "Ibrahim",
      phoneNumber: "+201553645745", // Fixed: removed spaces
      stable: {
        name: "Aseel",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc",
      },
    },
    {
      email: "alaa@pyrarides.com", // Fixed: lowercase
      fullName: "Alaa",
      phoneNumber: "+20100622105", // Fixed: removed spaces, added leading zero
      stable: {
        name: "Alaa",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc",
      },
    },
  ];

  // Generate a secure password for each owner (you can customize this)
  const defaultPassword = await bcrypt.hash("PyraRide2024!", 10);

  for (const ownerData of stableOwners) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: ownerData.email },
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${ownerData.email}`);
        console.log(`   Updating user and stable information...`);
        
        // Update user info
        const user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullName: ownerData.fullName,
            phoneNumber: ownerData.phoneNumber,
            role: "stable_owner",
          },
        });

        // Update or create stable - find by user's stableId
        const userWithStable = await prisma.user.findUnique({
          where: { id: user.id },
          select: { stableId: true },
        });
        const existingStable = userWithStable?.stableId ? await prisma.stable.findUnique({
          where: { id: userWithStable.stableId },
        }) : null;

        if (existingStable) {
          await prisma.stable.update({
            where: { id: existingStable.id },
            data: {
              name: ownerData.stable.name,
              description: ownerData.stable.description,
              location: ownerData.stable.location,
              address: ownerData.stable.address,
              status: "approved",
            },
          });
          console.log(`   ✅ Updated stable: ${ownerData.stable.name}`);
        } else {
          const newStable = await prisma.stable.create({
            data: {
              name: ownerData.stable.name,
              description: ownerData.stable.description,
              location: ownerData.stable.location,
              address: ownerData.stable.address,
              ownerId: user.id,
              status: "approved",
            },
          });
          // Link user to stable
          await prisma.user.update({
            where: { id: user.id },
            data: { stableId: newStable.id },
          });
          console.log(`   ✅ Created stable: ${ownerData.stable.name}`);
        }
      } else {
        // Create new user
        const user = await prisma.user.create({
          data: {
            email: ownerData.email,
            passwordHash: defaultPassword,
            fullName: ownerData.fullName,
            phoneNumber: ownerData.phoneNumber,
            role: "stable_owner",
          },
        });

        console.log(`✅ Created user: ${user.email}`);

        // Create stable
        const stable = await prisma.stable.create({
          data: {
            name: ownerData.stable.name,
            description: ownerData.stable.description,
            location: ownerData.stable.location,
            address: ownerData.stable.address,
            ownerId: user.id,
            status: "approved",
          },
        });

        // Link user to stable
        await prisma.user.update({
          where: { id: user.id },
          data: { stableId: stable.id },
        });

        console.log(`   ✅ Created stable: ${stable.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${ownerData.email}:`, error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
      }
    }
  }

  console.log("\n🎉 Real stable owners creation complete!");
  console.log("\n📋 Owner Accounts Created:");
  console.log("   Default password for all accounts: PyraRide2024!");
  console.log("   (Owners should change this on first login)");
  stableOwners.forEach((owner) => {
    console.log(`   - ${owner.email} (${owner.fullName}) - ${owner.stable.name}`);
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

