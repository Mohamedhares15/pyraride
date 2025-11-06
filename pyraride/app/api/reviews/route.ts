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

    const body = await req.json();
    const { bookingId, stableRating, horseRating, comment } = body;

    // Validate required fields
    if (!bookingId || !stableRating || !horseRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate ratings (1-5)
    if (stableRating < 1 || stableRating > 5 || horseRating < 1 || horseRating > 5) {
      return NextResponse.json(
        { error: "Ratings must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        riderId: session.user.id,
      },
      include: {
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if booking has been completed
    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    // Check if review already exists
    if (booking.review) {
      return NextResponse.json(
        { error: "This booking already has a review" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        riderId: session.user.id,
        stableId: booking.stableId,
        horseId: booking.horseId,
        stableRating,
        horseRating,
        comment: comment || "",
      },
      include: {
        rider: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stableId = searchParams.get("stableId");

    if (!stableId) {
      return NextResponse.json(
        { error: "stableId is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        stableId,
      },
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
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

