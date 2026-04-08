import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/academies — List all active, visible academies with their programs
export async function GET() {
  try {
    const academies = await prisma.academy.findMany({
      where: {
        isActive: true,
        isHidden: false,
      },
      include: {
        captain: {
          select: {
            id: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
        programs: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            skillLevel: true,
            price: true,
            totalSessions: true,
            sessionDuration: true,
            validityDays: true,
            availableDays: true,
            startTime: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: "active" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(academies);
  } catch (error) {
    console.error("Error fetching academies:", error);
    return NextResponse.json(
      { error: "Failed to fetch academies" },
      { status: 500 }
    );
  }
}
