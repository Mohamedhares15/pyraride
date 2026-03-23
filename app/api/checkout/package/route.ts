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
    const { packageId, date, startTime, ticketsCount, transportationZone } = body;

    if (!packageId || !date || !startTime || !ticketsCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId, isActive: true },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found or inactive" },
        { status: 404 }
      );
    }

    // Securely calculate transportation price
    let transportPrice = 0;
    if (pkg.hasTransportation && transportationZone) {
      if (transportationZone.includes("Zone 1")) transportPrice = 400;
      else if (transportationZone.includes("Zone 2")) transportPrice = 600;
      else if (transportationZone.includes("Zone 3")) transportPrice = 800;
      else if (transportationZone.includes("Zone 4")) transportPrice = 1000;
    }

    // Calculate price
    const unitPrice = pkg.price;
    const finalTicketsCount = pkg.packageType === "PRIVATE" ? 1 : Number(ticketsCount);
    const totalPrice = (unitPrice * finalTicketsCount) + transportPrice;

    // Create the booking in DB
    const packageBooking = await prisma.packageBooking.create({
      data: {
        riderId: session.user.id,
        packageId,
        date: new Date(date),
        startTime,
        ticketsCount: finalTicketsCount,
        totalPrice: totalPrice,
        transportationZone: transportationZone || null,
        status: "confirmed",
        stripePaymentId: null, // Filled via webhook
        commission: totalPrice * 0.15, // standard 15% platform fee
      },
      include: {
        package: true,
      }
    });

    // Handle Stripe
    if (!process.env.STRIPE_SECRET_KEY || !stripe || typeof stripe.checkout === 'undefined') {
      return NextResponse.json({
        checkoutUrl: null,
        bookingId: packageBooking.id,
        success: true,
        message: "Booking created successfully. Payment will be processed manually.",
      }, { status: 200 });
    }

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "egp",
              product_data: {
                name: pkg.title,
                description: `Package Booking: ${pkg.packageType === 'PRIVATE' ? 'Private Event' : finalTicketsCount + ' Tickets'} on ${new Date(date).toLocaleDateString()}${transportationZone ? ' + Pickup' : ''}`,
              },
              unit_amount: Math.round(totalPrice * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?packageBookingId=${packageBooking.id}`,
        cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/packages`,
        metadata: {
          type: 'package',
          packageBookingId: packageBooking.id,
          riderId: session.user.id,
        },
      });

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id
      });
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      return NextResponse.json({
        checkoutUrl: null,
        bookingId: packageBooking.id,
        success: true,
        message: "Booking created successfully. Payment will be processed later.",
        error: stripeError.message,
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error creating package checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
