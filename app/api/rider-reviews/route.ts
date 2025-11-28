import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRatings } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

// Create a rider review (Stable Owner only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Only stable owners can review riders" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingId, riderId, ridingSkillLevel, behaviorRating, comment } = body;

    // Validate required fields
    if (!bookingId || !riderId || !ridingSkillLevel || !behaviorRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating ranges
    if (ridingSkillLevel < 1 || ridingSkillLevel > 10) {
      return NextResponse.json(
        { error: "Riding skill level must be between 1 and 10" },
        { status: 400 }
      );
    }

    if (behaviorRating < 1 || behaviorRating > 5) {
      return NextResponse.json(
        { error: "Behavior rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to owner's stable
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        stable: {
          select: {
            ownerId: true,
            id: true,
          },
        },
        rider: {
          select: {
            id: true,
            rankPoints: true,
            rank: { select: { name: true } },
          },
        },
        horse: {
          select: {
            id: true,
            adminTier: true,
            rankPoints: true,
          },
        },
        rideResult: true, // Check if already scored
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.stable.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review riders from your own stable" },
        { status: 403 }
      );
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review riders for completed bookings" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.riderReview.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this rider" },
        { status: 400 }
      );
    }

    // Check if ride has already been scored (leaderboard calculation)
    if (booking.rideResult) {
      return NextResponse.json(
        { error: "This ride has already been scored for the leaderboard" },
        { status: 400 }
      );
    }

    // Check if horse has adminTier set (required for leaderboard)
    if (!booking.horse.adminTier) {
      return NextResponse.json(
        { error: "Cannot score this ride: Horse difficulty tier not set by admin" },
        { status: 400 }
      );
    }

    // Create rider review and calculate leaderboard points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create rider review
      const riderReview = await tx.riderReview.create({
        data: {
          bookingId,
          riderId,
          ownerId: session.user.id,
          ridingSkillLevel,
          behaviorRating,
          comment: comment || null,
        },
      });

      // Calculate leaderboard points using ridingSkillLevel as RPS (Rider Performance Score)
      const ratingUpdate = calculateRatings({
        riderId: booking.rider.id,
        horseId: booking.horse.id,
        rps: ridingSkillLevel, // Use ridingSkillLevel (1-10) as RPS
        riderRankPoints: booking.rider.rankPoints,
        horseAdminTier: booking.horse.adminTier as "Beginner" | "Intermediate" | "Advanced",
      });

      // Update rider's rank points
      await tx.user.update({
        where: { id: booking.rider.id },
        data: { rankPoints: ratingUpdate.newRiderPoints },
      });

      // Create ride result for leaderboard tracking
      await tx.rideResult.create({
        data: {
          bookingId,
          riderId: booking.rider.id,
          horseId: booking.horse.id,
          stableId: booking.stable.id,
          rps: ridingSkillLevel,
          pointsChange: ratingUpdate.riderPointsChange,
        },
      });

      return { riderReview, ratingUpdate };
    });

    return NextResponse.json(
      {
        riderReview: result.riderReview,
        leaderboard: {
          pointsChange: result.ratingUpdate.riderPointsChange,
          newRiderPoints: result.ratingUpdate.newRiderPoints,
          riderTier: result.ratingUpdate.riderTier,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rider review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// Get rider reviews (for admin or to check if review exists)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const riderId = searchParams.get("riderId");
    const bookingId = searchParams.get("bookingId");

    const where: any = {};

    // If riderId specified, get all reviews for that rider
    if (riderId) {
      where.riderId = riderId;
    }

    // If bookingId specified, get review for that booking
    if (bookingId) {
      where.bookingId = bookingId;
    }

    // Stable owners can only see reviews they wrote
    if (session.user.role === "stable_owner") {
      where.ownerId = session.user.id;
    }

    const reviews = await prisma.riderReview.findMany({
      where,
      include: {
        booking: {
          include: {
            stable: {
              select: {
                name: true,
              },
            },
            horse: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching rider reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

