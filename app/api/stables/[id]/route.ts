import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// In-memory cache — Fly.io has no CDN, so we cache in the Node process
// Stable details rarely change, 1 hour TTL is safe
const stableDetailCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    const isAdmin = session?.user?.role === "admin";
    const isOwner = session?.user?.role === "stable_owner";

    // Serve from memory cache if valid (skip cache for admin/owner)
    if (!isAdmin && !isOwner) {
      const cached = stableDetailCache.get(params.id);
      if (cached && Date.now() < cached.expiresAt) {
        return NextResponse.json(cached.data, {
          headers: { 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'HIT' },
        });
      }
    }

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
            adminTier: true,
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
            reviewMedias: {
              select: {
                url: true,
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
    const isActualOwner = session?.user?.role === "stable_owner" && stable.ownerId === session.user.id;
    if (stable.isHidden && !isAdmin && !isActualOwner) {
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
      skillLevel: horse.adminTier || "Beginner",
      media: Array.isArray(horse.media) ? horse.media : [],
    }));

    const result = {
      ...stable,
      horses,
      rating: Number(avgStableRating.toFixed(1)),
      totalBookings: stable._count.bookings,
      totalReviews: stable._count.reviews,
    };

    // Store in cache (only for public requests)
    if (!isAdmin && !isActualOwner) {
      stableDetailCache.set(params.id, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'MISS' },
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
