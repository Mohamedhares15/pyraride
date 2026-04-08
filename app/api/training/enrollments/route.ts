import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/training/enrollments — Get rider's training enrollments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { riderId: session.user.id },
      include: {
        academy: {
          select: { id: true, name: true, location: true, address: true, imageUrl: true },
        },
        program: {
          select: {
            id: true, name: true, skillLevel: true, totalSessions: true,
            sessionDuration: true, price: true,
          },
        },
        sessions: {
          orderBy: { sessionNumber: "asc" },
          include: {
            review: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}
