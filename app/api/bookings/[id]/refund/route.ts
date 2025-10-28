import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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

    // Only admin and stable owners can process refunds
    const isAdmin = session.user.role === "admin";
    
    const body = await req.json();
    const { reason, refundAmount, action } = body;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
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

    // Check permissions
    const isOwner = booking.stable.ownerId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Only stable owners and admins can process refunds" },
        { status: 403 }
      );
    }

    // Handle different actions
    if (action === "request") {
      // Rider requesting a refund
      if (session.user.role !== "rider" || booking.riderId !== session.user.id) {
        return NextResponse.json(
          { error: "Only riders can request refunds" },
          { status: 403 }
        );
      }

      if (booking.status !== "confirmed" && booking.status !== "completed") {
        return NextResponse.json(
          { error: "Can only request refund for confirmed or completed bookings" },
          { status: 400 }
        );
      }

      // Update booking with refund request
      await prisma.booking.update({
        where: { id: params.id },
        data: {
          refundStatus: "requested",
          refundReason: reason,
        },
      });

      return NextResponse.json({ 
        message: "Refund request submitted",
        status: "requested"
      });
    }

    if (action === "reject") {
      // Owner/Admin rejecting refund
      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      await prisma.booking.update({
        where: { id: params.id },
        data: {
          refundStatus: "rejected",
        },
      });

      return NextResponse.json({ 
        message: "Refund request rejected",
        status: "rejected"
      });
    }

    if (action === "process") {
      // Owner/Admin processing refund
      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      if (!booking.stripePaymentId) {
        return NextResponse.json(
          { error: "No payment found for this booking" },
          { status: 400 }
        );
      }

      // Calculate refund amount
      const amountToRefund = refundAmount 
        ? parseFloat(refundAmount.toString()) 
        : parseFloat(booking.totalPrice.toString());

      // Process Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentId,
        amount: Math.round(amountToRefund * 100), // Convert to cents
        reason: "requested_by_customer",
        metadata: {
          bookingId: booking.id,
          processedBy: session.user.id,
        },
      });

      // Update booking with refund info
      await prisma.booking.update({
        where: { id: params.id },
        data: {
          refundStatus: "processed",
          refundAmount: refundAmount || booking.totalPrice,
          stripeRefundId: refund.id,
          status: "cancelled",
        },
      });

      return NextResponse.json({
        message: "Refund processed successfully",
        refundId: refund.id,
        status: "processed",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Get booking with refund status
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        refundStatus: true,
        refundAmount: true,
        refundReason: true,
        stripePaymentId: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error fetching refund status:", error);
    return NextResponse.json(
      { error: "Failed to fetch refund status" },
      { status: 500 }
    );
  }
}

