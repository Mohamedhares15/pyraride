import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/academies — List all academies for admin management
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const academies = await prisma.academy.findMany({
      include: {
        captain: {
          select: { id: true, fullName: true, email: true, profileImageUrl: true },
        },
        programs: {
          select: { id: true, name: true, price: true, isActive: true, totalSessions: true },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get pending price change requests
    const pendingPriceChanges = await prisma.academyPriceChangeRequest.count({
      where: { status: "pending" },
    });

    return NextResponse.json({ academies, pendingPriceChanges });
  } catch (error) {
    console.error("Error fetching academies:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST /api/admin/academies — Create a new academy
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, location, address, captainId, imageUrl, googleMapsUrl } = body;

    if (!name || !description || !location || !address || !captainId) {
      return NextResponse.json(
        { error: "name, description, location, address, and captainId are required" },
        { status: 400 }
      );
    }

    // Verify captain exists and set role
    const captain = await prisma.user.findUnique({ where: { id: captainId } });
    if (!captain) {
      return NextResponse.json({ error: "Captain user not found" }, { status: 404 });
    }

    // Update user role to captain if not already
    if (captain.role !== "captain") {
      await prisma.user.update({
        where: { id: captainId },
        data: { role: "captain" },
      });
    }

    const academy = await prisma.academy.create({
      data: {
        name,
        description,
        location,
        address,
        captainId,
        imageUrl: imageUrl || null,
        googleMapsUrl: googleMapsUrl || null,
      },
      include: {
        captain: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Notify captain
    await prisma.notification.create({
      data: {
        userId: captainId,
        type: "academy_assigned",
        title: "Academy Assigned",
        message: `You've been assigned as captain of ${name}. Log in to your dashboard to manage your academy.`,
        data: { academyId: academy.id },
      },
    });

    return NextResponse.json(academy, { status: 201 });
  } catch (error) {
    console.error("Error creating academy:", error);
    return NextResponse.json({ error: "Failed to create academy" }, { status: 500 });
  }
}
