import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/captain/trainees — List all trainees for captain's academy
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const academy = await prisma.academy.findUnique({
      where: { captainId: session.user.id },
    });

    if (!academy) {
      return NextResponse.json({ error: "No academy assigned" }, { status: 404 });
    }

    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { academyId: academy.id },
      include: {
        rider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImageUrl: true,
          },
        },
        program: {
          select: { name: true, skillLevel: true, totalSessions: true },
        },
        sessions: {
          orderBy: { sessionNumber: "asc" },
          include: { review: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching trainees:", error);
    return NextResponse.json({ error: "Failed to fetch trainees" }, { status: 500 });
  }
}
