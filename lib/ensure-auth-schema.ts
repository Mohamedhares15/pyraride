import { prisma } from "./prisma";

let schemaEnsured = false;

export async function ensureAuthSchema() {
  if (schemaEnsured) {
    return;
  }

  try {
    // Ensure phoneNumber column exists on User table
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'User'
            AND column_name = 'phoneNumber'
        ) THEN
          ALTER TABLE "User"
            ADD COLUMN "phoneNumber" TEXT;
        END IF;
      END
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_phoneNumber_key"
      ON "User"("phoneNumber");
    `);

    // Ensure PasswordResetToken table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
        "id" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key"
        ON "PasswordResetToken"("token");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx"
        ON "PasswordResetToken"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PasswordResetToken"
      ADD CONSTRAINT IF NOT EXISTS "PasswordResetToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  } catch (error) {
    console.error("Failed to ensure authentication schema:", error);
    throw error;
  }

  schemaEnsured = true;
}

