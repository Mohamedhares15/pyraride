import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRatings } from "@/lib/leaderboard";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized - Stable owner access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, riderId, ridingSkillLevel, behaviorRating, comment } = body;

    // Validate inputs
    if (!bookingId || !riderId || !ridingSkillLevel || !behaviorRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        rider: {
          select: {
            id: true,
            rankPoints: true,
            rank: {
              select: {
                name: true,
              },
            },
          },
        },
        horse: {
          select: {
            id: true,
            adminTier: true, // Admin-locked tier
          },
        },
        stable: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify ownership - check if user is owner of this stable
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stableId: true, role: true },
    });

    if (!user || user.role !== "stable_owner" || user.stableId !== booking.stableId) {
      return NextResponse.json(
        { error: "You can only review riders from your own stable" },
        { status: 403 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.riderReview.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "This booking has already been reviewed" },
        { status: 400 }
      );
    }

    // Verify horse has adminTier set (required for scoring)
    if (!booking.horse.adminTier) {
      return NextResponse.json(
        { error: "Horse admin tier must be set by an administrator before scoring" },
        { status: 400 }
      );
    }

    // Calculate new ratings using Payoff Matrix
    // ridingSkillLevel (1-10) is used as RPS
    const ratingUpdate = calculateRatings({
      riderId: booking.rider.id,
      horseId: booking.horse.id,
      rps: ridingSkillLevel,
      riderRankPoints: booking.rider.rankPoints,
      horseAdminTier: booking.horse.adminTier as "Beginner" | "Intermediate" | "Advanced",
    });

    // Determine rider's new tier based on updated points
    const newRiderTier = ratingUpdate.riderTier;

    // Get or create rider rank record
    let riderRank = await prisma.riderRank.findFirst({
      where: { name: newRiderTier },
    });

    if (!riderRank) {
      // Create rank if it doesn't exist (should exist from seed)
      const tierLimits: Record<string, { min: number; max: number }> = {
        Beginner: { min: 0, max: 1300 },
        Intermediate: { min: 1301, max: 1700 },
        Advanced: { min: 1701, max: 9999 },
      };
      riderRank = await prisma.riderRank.create({
        data: {
          name: newRiderTier,
          minPoints: tierLimits[newRiderTier].min,
          maxPoints: tierLimits[newRiderTier].max,
        },
      });
    }

    // Transaction: Create Review + Create RideResult + Update User Points
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create RiderReview
      const review = await tx.riderReview.create({
        data: {
          bookingId,
          riderId,
          ownerId: session.user.id,
          ridingSkillLevel,
          behaviorRating,
          comment,
        },
      });

      // 2. Update Rider Points & Tier
      await tx.user.update({
        where: { id: riderId },
        data: {
          rankPoints: ratingUpdate.newRiderPoints,
          rankId: riderRank.id,
        },
      });

      // 3. Create RideResult (for historical tracking of points)
      const rideResult = await tx.rideResult.create({
        data: {
          bookingId,
          riderId,
          horseId: booking.horse.id,
          stableId: booking.stableId,
          rps: ridingSkillLevel,
          pointsChange: ratingUpdate.riderPointsChange,
        },
      });

      return { review, rideResult };
    });

    return NextResponse.json({
      success: true,
      review: result.review,
      leaderboard: {
        pointsChange: ratingUpdate.riderPointsChange,
        newPoints: ratingUpdate.newRiderPoints,
        newTier: newRiderTier,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error submitting rider review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
