import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendBookingCancellationEmail } from "@/lib/email";

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
    const { reason } = body;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        rider: { 
          select: { 
            id: true,
            email: true,
            fullName: true,
          } 
        },
        stable: { 
          select: { 
            ownerId: true,
            name: true,
            address: true,
          } 
        },
        horse: {
          select: {
            name: true,
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

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    if (booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel completed bookings" },
        { status: 400 }
      );
    }

    // Determine who is cancelling
    const isRider = booking.riderId === session.user.id;
    const isOwner = booking.stable.ownerId === session.user.id;
    const isAdmin = session.user.role === "admin";

    const cancelledBy = isAdmin
      ? "admin"
      : isOwner
        ? "owner"
        : "rider";

    // Check permissions
    if (!isRider && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "cancelled",
        cancellationReason: reason || "No reason provided",
        cancelledBy,
      },
    });

    // Send email notification to rider if cancelled by owner or admin
    if ((cancelledBy === "owner" || cancelledBy === "admin") && booking.rider.email) {
      try {
        await sendBookingCancellationEmail({
          bookingId: booking.id,
          riderName: booking.rider.fullName || "Valued Customer",
          riderEmail: booking.rider.email,
          stableName: booking.stable.name,
          horseName: booking.horse.name,
          date: booking.startTime.toISOString(),
          startTime: new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          endTime: new Date(booking.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          cancellationReason: reason || undefined,
          cancelledBy: cancelledBy as "rider" | "owner" | "admin",
        });
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
        // Don't fail the cancellation if email fails
      }
    }

    // If booking has a payment, option to process refund
    const shouldRefund = body.autoRefund && booking.stripePaymentId;

    return NextResponse.json({
      message: "Booking cancelled successfully",
      shouldRefund,
      bookingId: params.id,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

