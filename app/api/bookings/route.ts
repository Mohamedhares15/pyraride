import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only riders can create bookings
    if (session.user.role !== "rider") {
      return NextResponse.json(
        { error: "Only riders can create bookings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { stableId, horseId, startTime, endTime } = body;

    // Validate required fields
    if (!stableId || !horseId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Check that end time is after start time
    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check if stable exists and is approved
    const stable = await prisma.stable.findUnique({
      where: {
        id: stableId,
        status: "approved",
      },
    });

    if (!stable) {
      return NextResponse.json(
        { error: "Stable not found or not approved" },
        { status: 404 }
      );
    }

    // Check if horse exists and is active
    const horse = await prisma.horse.findUnique({
      where: {
        id: horseId,
        isActive: true,
      },
    });

    if (!horse) {
      return NextResponse.json(
        { error: "Horse not found or not available" },
        { status: 404 }
      );
    }

    // Check if horse belongs to stable
    if (horse.stableId !== stableId) {
      return NextResponse.json(
        { error: "Horse does not belong to this stable" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        horseId,
        status: {
          in: ["confirmed", "completed"],
        },
        OR: [
          {
            startTime: {
              lte: end,
            },
            endTime: {
              gte: start,
            },
          },
        ],
      },
    });

    if (overlappingBookings) {
      return NextResponse.json(
        { error: "This horse is already booked for the selected time" },
        { status: 400 }
      );
    }

    // Calculate price (50 USD per hour)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalPrice = hours * 50;
    const commission = totalPrice * 0.2; // 20% commission

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        riderId: session.user.id,
        stableId,
        horseId,
        startTime,
        endTime,
        totalPrice,
        commission,
        status: "confirmed",
      },
      include: {
        stable: {
          select: {
            name: true,
            location: true,
          },
        },
        horse: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get bookings for the current user
    const bookings = await prisma.booking.findMany({
      where: {
        riderId: session.user.id,
      },
      include: {
        stable: {
          select: {
            name: true,
            location: true,
          },
        },
        horse: {
          select: {
            name: true,
          },
        },
        review: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add hasReview flag to each booking
    const bookingsWithReviewStatus = bookings.map((booking: any) => ({
      ...booking,
      hasReview: !!booking.review,
    }));

    return NextResponse.json({ bookings: bookingsWithReviewStatus });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
