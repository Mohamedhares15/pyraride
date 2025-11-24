import { prisma } from "./prisma";

let schemaEnsured = false;

export async function ensureAuthSchema() {
  if (schemaEnsured) {
    return;
  }

  try {
    // Ensure phoneNumber column exists on User table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_phoneNumber_key"
      ON "User"("phoneNumber");
    `);

    // Add premium AI columns if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "hasPremiumAI" BOOLEAN DEFAULT false;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "premiumAIExpiresAt" TIMESTAMP(3);
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Horse"
      ADD COLUMN IF NOT EXISTS "pricePerHour" NUMERIC(10,2) DEFAULT 500;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Horse"
      ADD COLUMN IF NOT EXISTS "age" INTEGER;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Horse"
      ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Horse"
      SET "pricePerHour" = COALESCE("pricePerHour", 500)
      WHERE "pricePerHour" IS NULL;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HorseMediaType') THEN
          CREATE TYPE "HorseMediaType" AS ENUM ('image', 'video');
        END IF;
      END
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "HorseMedia" (
        "id" TEXT PRIMARY KEY,
        "horseId" TEXT NOT NULL,
        "type" "HorseMediaType" NOT NULL,
        "url" TEXT NOT NULL,
        "thumbnailUrl" TEXT,
        "sortOrder" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "HorseMedia_horseId_idx"
        ON "HorseMedia"("horseId");
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'HorseMedia_horseId_fkey'
        ) THEN
          ALTER TABLE "HorseMedia"
          ADD CONSTRAINT "HorseMedia_horseId_fkey"
          FOREIGN KEY ("horseId") REFERENCES "Horse"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
        "id" TEXT PRIMARY KEY,
        "token" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx"
        ON "PasswordResetToken"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'PasswordResetToken_userId_fkey'
        ) THEN
          ALTER TABLE "PasswordResetToken"
          ADD CONSTRAINT "PasswordResetToken_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);
  } catch (error) {
    console.error("Failed to ensure authentication schema:", error);
    throw error;
  }

  schemaEnsured = true;
}

