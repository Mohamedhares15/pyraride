/**
 * List all stable owners and their details
 * Run: node scripts/list-stable-owners.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listStableOwners() {
  try {
    console.log("🔍 Fetching all stable owners...\n");
    
    const stableOwners = await prisma.user.findMany({
      where: {
        role: 'stable_owner',
      },
      include: {
        stable: {
          select: {
            id: true,
            name: true,
            location: true,
            status: true,
            isHidden: true,
            _count: {
              select: {
                horses: true,
                bookings: true,
              },
            },
          },
        },
      },
      orderBy: {
        email: 'asc',
      },
    });

    if (stableOwners.length === 0) {
      console.log("❌ No stable owners found in database.");
      return;
    }

    console.log(`✅ Found ${stableOwners.length} stable owner(s):\n`);
    console.log("=" .repeat(80));
    
    stableOwners.forEach((owner, index) => {
      console.log(`\n${index + 1}. ${owner.fullName || 'No Name'}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Phone: ${owner.phoneNumber || 'Not set'}`);
      console.log(`   User ID: ${owner.id}`);
      console.log(`   Password Hash: ${owner.passwordHash ? owner.passwordHash.substring(0, 30) + '...' : 'NOT SET'}`);
      
      if (owner.stable) {
        console.log(`   Stable: ${owner.stable.name}`);
        console.log(`   Location: ${owner.stable.location}`);
        console.log(`   Status: ${owner.stable.status}`);
        console.log(`   Hidden: ${owner.stable.isHidden ? 'Yes' : 'No'}`);
        console.log(`   Horses: ${owner.stable._count.horses}`);
        console.log(`   Bookings: ${owner.stable._count.bookings}`);
      } else {
        console.log(`   Stable: ❌ No stable registered`);
      }
      
      console.log("-".repeat(80));
    });

    console.log("\n💡 Note: Passwords are hashed with bcrypt and cannot be retrieved.");
    console.log("   Use scripts/reset-stable-owner-passwords.js to set new passwords.");
    console.log("\n");

  } catch (error) {
    console.error("❌ Error fetching stable owners:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listStableOwners();

