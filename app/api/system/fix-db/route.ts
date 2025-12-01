import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Create Table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "availability_slots" (
          "id" TEXT NOT NULL,
          "stableId" TEXT NOT NULL,
          "horseId" TEXT,
          "date" DATE NOT NULL,
          "startTime" TIMESTAMP(3) NOT NULL,
          "endTime" TIMESTAMP(3) NOT NULL,
          "isBooked" BOOLEAN NOT NULL DEFAULT false,
          "bookingId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
      );
    `);

        // 2. Create Indices (ignoring errors if they exist)
        try {
            await prisma.$executeRawUnsafe(`CREATE INDEX "availability_slots_stableId_idx" ON "availability_slots"("stableId");`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`CREATE INDEX "availability_slots_horseId_idx" ON "availability_slots"("horseId");`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`CREATE INDEX "availability_slots_date_idx" ON "availability_slots"("date");`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "availability_slots_bookingId_key" ON "availability_slots"("bookingId");`);
        } catch (e) { }

        // 3. Add Foreign Keys (checking if they exist first would be better, but try/catch works for "if not exists" logic)
        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_stableId_fkey" FOREIGN KEY ("stableId") REFERENCES "Stable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
        } catch (e) { }

        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
        } catch (e) { }

        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `);
        } catch (e) { }

        return NextResponse.json({ success: true, message: "Database fixed: availability_slots table created" });
    } catch (error) {
        console.error("Fix DB Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
