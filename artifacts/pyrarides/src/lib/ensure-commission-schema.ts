import { prisma } from "@/lib/prisma";

/**
 * Ensure commissionRate column exists in Stable table
 * This will be run on server startup or first access
 */
export async function ensureCommissionSchema() {
  try {
    // Check if commissionRate column exists by trying to query it
    const testStable = await prisma.stable.findFirst({
      select: {
        id: true,
        commissionRate: true,
      },
    });

    // If query succeeds, column exists
    if (testStable !== null) {
      return; // Column already exists
    }
  } catch (error: any) {
    // If error mentions commissionRate, column doesn't exist - we need to add it
    if (error.message?.includes("commissionRate") || error.message?.includes("Unknown column")) {
      console.log("Adding commissionRate column to Stable table...");
      
      try {
        // Add commissionRate column with default value of 0.15 (15%)
        await prisma.$executeRaw`
          ALTER TABLE "Stable" 
          ADD COLUMN IF NOT EXISTS "commissionRate" DECIMAL(5, 4) DEFAULT 0.15;
        `;
        
        // Update existing stables to have 15% commission if they're null
        await prisma.$executeRaw`
          UPDATE "Stable" 
          SET "commissionRate" = 0.15 
          WHERE "commissionRate" IS NULL;
        `;
        
        console.log("✅ commissionRate column added successfully");
        
        // Regenerate Prisma client to include new field
        // Note: In production, you should run `npx prisma generate` manually
      } catch (migrationError) {
        console.error("❌ Error adding commissionRate column:", migrationError);
        // Don't throw - allow app to continue, but log the error
      }
    } else {
      // Different error - rethrow it
      throw error;
    }
  }
}

