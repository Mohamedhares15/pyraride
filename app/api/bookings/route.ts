import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Check that start time is in the future
    if (start < now) {
      return NextResponse.json(
        { error: "Booking start time must be in the future" },
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

    // Check minimum booking duration (at least 1 hour)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours < 1) {
      return NextResponse.json(
        { error: "Minimum booking duration is 1 hour" },
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

    // Feature 5: Check lead time (minimum hours before booking)
    const minLeadTimeHours = stable.minLeadTimeHours || 8; // Default 8 hours
    const leadTimeMs = minLeadTimeHours * 60 * 60 * 1000; // Convert to milliseconds
    const earliestAllowedStart = new Date(now.getTime() + leadTimeMs);

    if (start < earliestAllowedStart) {
      return NextResponse.json(
        {
          error: `Bookings must be made at least ${minLeadTimeHours} hours in advance`,
          details: `Earliest available booking time: ${earliestAllowedStart.toLocaleString()}`
        },
        { status: 400 }
      );
    }

    // Get commission rate from stable (default to 0.15 if not set)
    const commissionRate = stable.commissionRate
      ? Number(stable.commissionRate)
      : 0.15; // Default 15%

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

    // Check for overlapping bookings (only confirmed, excluding cancelled and completed past bookings)
    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        horseId,
        status: "confirmed", // Only check confirmed bookings (not completed or cancelled)
        AND: [
          {
            // Booking starts before our end time
            startTime: {
              lte: end,
            },
          },
          {
            // Booking ends after our start time
            endTime: {
              gte: start,
            },
          },
        ],
      },
    });

    if (overlappingBookings) {
      // Get details of the conflicting booking for better error message
      const conflictStart = new Date(overlappingBookings.startTime).toLocaleString();
      const conflictEnd = new Date(overlappingBookings.endTime).toLocaleString();
      return NextResponse.json(
        {
          error: "This horse is already booked for the selected time",
          details: `Conflicting booking: ${conflictStart} - ${conflictEnd}. Please choose a different time.`
        },
        { status: 400 }
      );
    }

    // Calculate price using horse's actual price per hour
    const pricePerHour = Number(horse.pricePerHour ?? 50); // Default to 50 if not set
    const totalPrice = hours * pricePerHour;
    const commission = totalPrice * commissionRate;

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
        rider: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          }
        }
      },
    });

    // Send email notification to stable owner(s)
    // Feature 2 & 3: Support multiple owners
    const owners = await prisma.user.findMany({
      where: {
        stableId: stableId,
        role: "stable_owner",
      },
      select: {
        email: true,
      }
    });

    if (owners.length > 0) {
      const { sendOwnerBookingNotification } = await import("@/lib/email");

      // Send email to all owners
      await Promise.all(owners.map(owner =>
        sendOwnerBookingNotification({
          ownerEmail: owner.email,
          riderName: booking.rider.fullName || "Guest Rider",
          riderEmail: booking.rider.email,
          riderPhone: booking.rider.phoneNumber || undefined,
          horseName: booking.horse.name,
          date: booking.startTime.toISOString(),
          startTime: new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          endTime: new Date(booking.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          totalPrice: Number(booking.totalPrice),
          bookingId: booking.id,
        })
      ));
    }

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
      // Return empty array instead of error for unauthenticated users
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const ownerOnly = searchParams.get("ownerOnly") === "true";
    const statusFilter = searchParams.get("status"); // e.g., "completed"

    let where: any = {};

    // If ownerOnly is true, get bookings for stable owner's stable
    if (ownerOnly && session.user.role === "stable_owner") {
      // Get user's stableId
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stableId: true },
      });

      if (user?.stableId) {
        where.stableId = user.stableId;
      } else {
        return NextResponse.json({ bookings: [] }, { status: 200 });
      }
    } else {
      // Default: Get bookings for the current rider
      where.riderId = session.user.id;
    }

    // Filter by status if provided
    if (statusFilter) {
      where.status = statusFilter;
    }

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
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
            adminTier: true, // Include adminTier for scoring
          },
        },
        rider: ownerOnly ? {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        } : undefined,
        review: {
          select: {
            id: true,
          },
        },
        rideResult: {
          select: {
            id: true, // Check if already scored
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out already scored bookings if ownerOnly
    let filteredBookings = bookings;
    if (ownerOnly) {
      filteredBookings = bookings.filter((booking: any) => !booking.rideResult);
    }

    // Add hasReview flag to each booking
    const bookingsWithReviewStatus = filteredBookings.map((booking: any) => ({
      ...booking,
      hasReview: !!booking.review,
      alreadyScored: !!booking.rideResult,
    }));

    return NextResponse.json({ bookings: bookingsWithReviewStatus });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

