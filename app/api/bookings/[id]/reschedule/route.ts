import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newStartTime, newEndTime } = body;

    if (!newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (newEnd <= newStart) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Get booking with stable and horse details
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        rider: { select: { id: true } },
        horse: { 
          select: { 
            id: true, 
            isActive: true,
            pricePerHour: true 
          } 
        },
        stable: {
          select: {
            id: true,
            commissionRate: true,
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

    // Check if booking can be rescheduled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot reschedule cancelled bookings" },
        { status: 400 }
      );
    }

    if (booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot reschedule completed bookings" },
        { status: 400 }
      );
    }

    // Check permissions - only rider can reschedule their own booking
    if (booking.riderId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the booking owner can reschedule" },
        { status: 403 }
      );
    }

    // Check for overlapping bookings with the same horse
    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        id: { not: params.id }, // Exclude current booking
        horseId: booking.horseId,
        status: {
          in: ["confirmed", "rescheduled"],
        },
        OR: [
          {
            startTime: {
              lte: newEnd,
            },
            endTime: {
              gte: newStart,
            },
          },
        ],
      },
    });

    if (overlappingBookings) {
      return NextResponse.json(
        { error: "Selected time is not available. Another booking exists." },
        { status: 400 }
      );
    }

    // Check if horse is still active
    if (!booking.horse.isActive) {
      return NextResponse.json(
        { error: "This horse is no longer available" },
        { status: 400 }
      );
    }

    // Calculate new price (in case duration changed)
    const hours = (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60);
    const pricePerHour = Number(booking.horse.pricePerHour ?? 50); // Default to 50 if not set
    const newPrice = hours * pricePerHour;
    
    // Get commission rate from stable (default to 0.15 if not set)
    const commissionRate = booking.stable.commissionRate 
      ? Number(booking.stable.commissionRate) 
      : 0.15; // Default 15%
    const newCommission = newPrice * commissionRate;

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        startTime: newStart,
        endTime: newEnd,
        totalPrice: newPrice,
        commission: newCommission,
        status: "rescheduled",
        rescheduledFrom: booking.startTime,
        rescheduledTo: newStart,
        isRescheduled: true,
      },
    });

    return NextResponse.json({
      message: "Booking rescheduled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    return NextResponse.json(
      { error: "Failed to reschedule booking" },
      { status: 500 }
    );
  }
}

