import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const minRating = searchParams.get("minRating");

    // Build where clause
    const where: any = {
      status: "approved",
    };

    // Filter by location
    if (location && location !== "all") {
      where.location = location;
    }

    // Filter by search term (name or description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get stables with their reviews for rating calculation
    const stables = await prisma.stable.findMany({
      where,
      include: {
        owner: {
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
        horses: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            imageUrls: true,
          },
          take: 1, // Just get first horse for image
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: "completed",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average ratings and add horse count + image
    const stablesWithRating = stables.map((stable: any) => {
      const avgRating =
        stable.reviews.length > 0
          ? stable.reviews.reduce((sum: number, r: any) => sum + r.stableRating, 0) /
            stable.reviews.length
          : 0;

      // Get image from first horse if available
      const imageUrl = stable.horses.length > 0 && stable.horses[0].imageUrls?.length > 0
        ? stable.horses[0].imageUrls[0]
        : "/hero-bg.webp";

      return {
        id: stable.id,
        name: stable.name,
        description: stable.description,
        location: stable.location,
        address: stable.address,
        owner: stable.owner,
        rating: Number(avgRating.toFixed(1)),
        totalBookings: stable._count.bookings,
        horseCount: stable.horses.length,
        imageUrl: imageUrl,
        createdAt: stable.createdAt,
      };
    });

    // Filter by minimum rating if provided
    let filteredStables = stablesWithRating;
    if (minRating) {
      filteredStables = stablesWithRating.filter(
        (s: any) => s.rating >= Number(minRating)
      );
    }

    return NextResponse.json({ stables: filteredStables });
  } catch (error) {
    console.error("Error fetching stables:", error);
    return NextResponse.json(
      { error: "Failed to fetch stables" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, location, address } = body;

    // Check if user already has a stable
    const existingStable = await prisma.stable.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existingStable) {
      return NextResponse.json(
        { error: "You already have a stable registered" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !description || !location || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create stable
    const stable = await prisma.stable.create({
      data: {
        name,
        description,
        location,
        address,
        ownerId: session.user.id,
        status: "pending_approval",
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ stable }, { status: 201 });
  } catch (error) {
    console.error("Error creating stable:", error);
    return NextResponse.json(
      { error: "Failed to create stable" },
      { status: 500 }
    );
  }
}

