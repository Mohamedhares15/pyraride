import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/admin/academies/programs — Create a new training program for an academy
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "captain")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      academyId,
      name,
      description,
      skillLevel,
      price,
      totalSessions,
      sessionDuration,
      validityDays,
      availableDays,
      startTime,
    } = body;

    if (!academyId || !name || !description || !price || !totalSessions || !availableDays?.length) {
      return NextResponse.json(
        { error: "academyId, name, description, price, totalSessions, and availableDays are required" },
        { status: 400 }
      );
    }

    // Verify academy exists
    const academy = await prisma.academy.findUnique({ where: { id: academyId } });
    if (!academy) {
      return NextResponse.json({ error: "Academy not found" }, { status: 404 });
    }

    // If captain, verify they own this academy
    if (session.user.role === "captain" && academy.captainId !== session.user.id) {
      return NextResponse.json({ error: "You can only add programs to your own academy" }, { status: 403 });
    }

    const program = await prisma.trainingProgram.create({
      data: {
        academyId,
        name,
        description,
        skillLevel: skillLevel || "BEGINNER",
        price: parseFloat(price),
        totalSessions: parseInt(totalSessions),
        sessionDuration: parseFloat(sessionDuration || "1"),
        validityDays: parseInt(validityDays || "60"),
        availableDays,
        startTime: startTime || "10:00",
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
