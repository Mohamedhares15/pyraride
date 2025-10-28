import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stable = await prisma.stable.findUnique({
      where: {
        id: params.id,
        status: "approved",
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        horses: {
          where: {
            isActive: true,
          },
        },
        reviews: {
          include: {
            rider: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: "completed",
              },
            },
            reviews: true,
          },
        },
      },
    });

    if (!stable) {
      return NextResponse.json(
        { error: "Stable not found" },
        { status: 404 }
      );
    }

    // Calculate average ratings
    const avgStableRating =
      stable.reviews.length > 0
        ? stable.reviews.reduce((sum: number, r: any) => sum + r.stableRating, 0) /
          stable.reviews.length
        : 0;

    return NextResponse.json({
      ...stable,
      rating: Number(avgStableRating.toFixed(1)),
      totalBookings: stable._count.bookings,
      totalReviews: stable._count.reviews,
    });
  } catch (error) {
    console.error("Error fetching stable:", error);
    return NextResponse.json(
      { error: "Failed to fetch stable" },
      { status: 500 }
    );
  }
}

