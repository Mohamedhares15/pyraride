import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAuthSchema } from "@/lib/ensure-auth-schema";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureAuthSchema();

    const session = await getServerSession();
    const isAdmin = session?.user?.role === "admin";

    // First, get the stable without the hidden filter
    const stable = await prisma.stable.findFirst({
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
          select: {
            id: true,
            name: true,
            description: true,
            imageUrls: true,
            pricePerHour: true,
            age: true,
            skills: true,
            isActive: true,
            media: {
              select: {
                url: true,
                type: true,
                thumbnailUrl: true,
                sortOrder: true,
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            stableRating: true,
            horseRating: true,
            comment: true,
            createdAt: true,
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

    // Check if stable is hidden (unless admin or stable owner viewing their own stable)
    const isOwner = session?.user?.role === "stable_owner" && stable.ownerId === session.user.id;
    if (stable.isHidden && !isAdmin && !isOwner) {
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

    const horses = stable.horses.map((horse: any) => ({
      ...horse,
      pricePerHour:
        horse.pricePerHour !== null && horse.pricePerHour !== undefined
          ? Number(horse.pricePerHour)
          : null,
      skills: horse.skills ?? [],
      media: Array.isArray(horse.media) ? horse.media : [],
    }));

    return NextResponse.json({
      ...stable,
      horses,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stable = await prisma.stable.findUnique({
      where: { id: params.id },
    });

    if (!stable || stable.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Stable not found or unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, address, location, imageUrl } = body;

    const updatedStable = await prisma.stable.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(location !== undefined && { location }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(body.minLeadTimeHours !== undefined && { minLeadTimeHours: Number(body.minLeadTimeHours) }),
      },
    });

    return NextResponse.json({ stable: updatedStable });
  } catch (error) {
    console.error("Error updating stable:", error);
    return NextResponse.json(
      { error: "Failed to update stable" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return PATCH(req, { params });
}
