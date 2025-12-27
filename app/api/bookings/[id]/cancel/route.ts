import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendBookingCancellationEmail, sendOwnerCancellationNotification } from "@/lib/email";

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

    // Get booking with all related data
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
            owner: {
              select: {
                email: true,
                fullName: true,
              }
            },
          }
        },
        horse: {
          select: {
            name: true,
            imageUrls: true,
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

    // Format times for email
    const startTimeStr = new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const endTimeStr = new Date(booking.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    // Send email to RIDER
    if (booking.rider.email) {
      try {
        await sendBookingCancellationEmail({
          bookingId: booking.id,
          riderName: booking.rider.fullName || "Valued Customer",
          riderEmail: booking.rider.email,
          stableName: booking.stable.name,
          horseName: booking.horse.name,
          horseImage: booking.horse.imageUrls?.[0],
          date: booking.startTime.toISOString(),
          startTime: startTimeStr,
          endTime: endTimeStr,
          cancellationReason: reason || undefined,
          cancelledBy: cancelledBy as "rider" | "owner" | "admin",
        });
      } catch (emailError) {
        console.error("Failed to send rider cancellation email:", emailError);
      }
    }

    // Send email to OWNER
    const ownerEmail = booking.stable.owner?.email;
    if (ownerEmail) {
      try {
        await sendOwnerCancellationNotification({
          ownerEmail: ownerEmail,
          riderName: booking.rider.fullName || "Valued Customer",
          riderEmail: booking.rider.email,
          horseName: booking.horse.name,
          horseImage: booking.horse.imageUrls?.[0],
          date: booking.startTime.toISOString(),
          startTime: startTimeStr,
          endTime: endTimeStr,
          cancellationReason: reason || undefined,
          cancelledBy: cancelledBy as "rider" | "owner" | "admin",
        });
      } catch (emailError) {
        console.error("Failed to send owner cancellation email:", emailError);
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
