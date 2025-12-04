import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only stable owners can view their own stable's bookings
    if (session.user.role !== "stable_owner" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Verify stable belongs to owner (for stable owners)
    const stable = await prisma.stable.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    if (!stable) {
      return NextResponse.json(
        { error: "Stable not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (session.user.role === "stable_owner" && stable.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only view your own stable's bookings" },
        { status: 403 }
      );
    }

    // Fetch bookings for this stable
    const bookings = await prisma.booking.findMany({
      where: {
        stableId: params.id,
      },
      include: {
        horse: {
          select: {
            name: true,
          },
        },
        rider: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        riderReview: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching stable bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

