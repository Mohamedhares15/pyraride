import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stables
 * Admin-only endpoint to get all stables (including hidden ones)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    // Only admins can access this endpoint
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Get all stables (including hidden ones)
    const stables = await prisma.stable.findMany({
      include: {
        owners: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviews: {
          select: {
            stableRating: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            horses: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average ratings
    const stablesWithRatings = stables.map((stable) => {
      const avgRating =
        stable.reviews.length > 0
          ? stable.reviews.reduce(
            (sum, r) => sum + r.stableRating,
            0
          ) / stable.reviews.length
          : 0;

      return {
        id: stable.id,
        name: stable.name,
        description: stable.description,
        location: stable.location,
        address: stable.address,
        imageUrl: stable.imageUrl,
        status: stable.status,
        isHidden: stable.isHidden,
        commissionRate: stable.commissionRate ? Number(stable.commissionRate) : 0.15, // Default to 15% if not set
        createdAt: stable.createdAt.toISOString(),
        owners: stable.owners,
        rating: Number(avgRating.toFixed(1)),
        _count: stable._count,
      };
    });

    return NextResponse.json({
      stables: stablesWithRatings,
      total: stablesWithRatings.length,
      visible: stablesWithRatings.filter((s) => !s.isHidden).length,
      hidden: stablesWithRatings.filter((s) => s.isHidden).length,
    });
  } catch (error) {
    console.error("Error fetching stables for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch stables" },
      { status: 500 }
    );
  }
}

