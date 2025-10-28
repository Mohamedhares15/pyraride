import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
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
    const { stableId, horseId, startTime, endTime, totalPrice } = body;

    // Validate required fields
    if (!stableId || !horseId || !startTime || !endTime || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
      },
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
    });

    // Create Stripe checkout session
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
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?bookingId=${booking.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel?bookingId=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        riderId: session.user.id,
      },
    });

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

