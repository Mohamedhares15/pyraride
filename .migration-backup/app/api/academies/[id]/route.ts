import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/academies/[id] — Get a single academy with full details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const academy = await prisma.academy.findUnique({
      where: { id: params.id },
      include: {
        captain: {
          select: {
            id: true,
            fullName: true,
            profileImageUrl: true,
            bio: true,
          },
        },
        programs: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: "active" },
            },
          },
        },
      },
    });

    if (!academy || academy.isHidden) {
      return NextResponse.json(
        { error: "Academy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(academy);
  } catch (error) {
    console.error("Error fetching academy:", error);
    return NextResponse.json(
      { error: "Failed to fetch academy" },
      { status: 500 }
    );
  }
}
