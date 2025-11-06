import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail } from "@/lib/email";

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
    const { stableId, horseId, startTime, endTime, totalPrice, stableLocation, riders } = body;

    // Validate required fields
    if (!stableId || !horseId || !startTime || !endTime || !totalPrice) {
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

    if (start < now) {
      return NextResponse.json(
        { error: "Booking start time must be in the future" },
        { status: 400 }
      );
    }

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

        // Store stable location as JSON in cancellationReason field temporarily
        const bookingMeta = stableLocation
          ? JSON.stringify({ stableLocation })
          : null;

        // Create booking first (in pending payment status)
        const booking = await prisma.booking.create({
          data: {
            riderId: session.user.id,
            stableId,
            horseId,
            startTime,
            endTime,
            totalPrice: parseFloat(totalPrice.toString()),
            commission: parseFloat(totalPrice.toString()) * 0.2,
            status: "confirmed",
            stripePaymentId: null, // Will be updated after payment
            cancellationReason: bookingMeta, // Temporarily store stable location here
          },
      include: {
        rider: {
          select: {
            email: true,
            fullName: true,
          },
        },
        stable: {
          select: {
            name: true,
            address: true,
          },
        },
        horse: {
          select: {
            name: true,
          },
        },
      },
    });

    // Send confirmation email
    if (booking.rider.email) {
      try {
        const stableLocationData = stableLocation
          ? JSON.parse(booking.cancellationReason || "{}")?.stableLocation
          : null;

        await sendBookingConfirmationEmail({
          bookingId: booking.id,
          riderName: booking.rider.fullName || "Valued Customer",
          riderEmail: booking.rider.email,
          stableName: booking.stable.name,
          stableAddress: stableLocationData?.address || booking.stable.address || booking.stable.name,
          horseName: booking.horse.name,
          date: new Date(startTime).toISOString(),
          startTime: new Date(startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false }),
          endTime: new Date(endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false }),
          totalPrice: parseFloat(totalPrice.toString()),
          riders: riders || 1,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the booking if email fails
      }
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !stripe || typeof stripe.checkout === 'undefined') {
      // Stripe not configured - return booking confirmation directly (for development/testing)
      // In production, use Paymob or another payment gateway for Egypt
      return NextResponse.json({ 
        checkoutUrl: null,
        bookingId: booking.id,
        success: true,
        message: "Booking created successfully. Payment will be processed on-site or via Paymob.",
      }, { status: 200 });
    }

    // Create Stripe checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Horse Riding at ${booking.stable.name}`,
                description: `Riding ${booking.horse.name} on ${new Date(startTime).toLocaleDateString()}`,
              },
              unit_amount: Math.round(parseFloat(totalPrice.toString()) * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?bookingId=${booking.id}`,
        cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/cancel?bookingId=${booking.id}`,
        metadata: {
          bookingId: booking.id,
          riderId: session.user.id,
        },
      });

      return NextResponse.json({ 
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id 
      });
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      // If Stripe fails, still return the booking but with a message
      return NextResponse.json({ 
        checkoutUrl: null,
        bookingId: booking.id,
        success: true,
        message: "Booking created successfully. Payment will be processed on-site.",
        error: stripeError.message || "Stripe payment unavailable, booking confirmed directly",
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create checkout session",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

