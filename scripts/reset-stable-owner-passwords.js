/**
 * Reset passwords for all stable owners to a single password
 * Run: node scripts/reset-stable-owner-passwords.js
 * 
 * Usage:
 *   node scripts/reset-stable-owner-passwords.js
 *   node scripts/reset-stable-owner-passwords.js "MyNewPassword123!"
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    // Get password from command line argument or use default
    const newPassword = process.argv[2] || "PyraRide2024!";
    
    console.log("🔐 Resetting passwords for all stable owners...\n");
    console.log(`New password: ${newPassword}\n`);
    
    // Get all stable owners
    const stableOwners = await prisma.user.findMany({
      where: {
        role: 'stable_owner',
      },
      include: {
        stable: {
          select: {
            name: true,
          },
        },
      },
    });

    if (stableOwners.length === 0) {
      console.log("❌ No stable owners found in database.");
      return;
    }

    console.log(`Found ${stableOwners.length} stable owner(s) to update:\n`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update all stable owners
    const updatePromises = stableOwners.map(owner => 
      prisma.user.update({
        where: { id: owner.id },
        data: { passwordHash: hashedPassword },
      })
    );

    await Promise.all(updatePromises);

    console.log("✅ Successfully updated passwords for:\n");
    stableOwners.forEach((owner, index) => {
      const stableName = owner.stable ? owner.stable.name : 'No stable';
      console.log(`   ${index + 1}. ${owner.email} (${owner.fullName || 'No name'}) - ${stableName}`);
    });

    console.log(`\n🔑 All stable owners can now log in with:`);
    console.log(`   Password: ${newPassword}\n`);
    
    console.log("📋 Login credentials:\n");
    stableOwners.forEach((owner) => {
      console.log(`   Email: ${owner.email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   ---`);
    });

  } catch (error) {
    console.error("❌ Error resetting passwords:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();

