import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail, sendOwnerBookingNotification } from "@/lib/email";

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
    const { packageId, date, startTime, ticketsCount, transportationZoneId } = body;

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
    let transportZoneName = "";
    if (pkg.hasTransportation && transportationZoneId) {
      const zone = await prisma.transportZone.findUnique({
        where: { id: transportationZoneId, isActive: true },
      });
      if (zone) {
        transportPrice = Number(zone.price);
        transportZoneName = zone.name;
      }
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
        transportationZone: transportZoneName || null,
        status: "confirmed",
        stripePaymentId: null, // Filled via webhook
        commission: totalPrice * 0.15, // standard 15% platform fee
      },
      include: {
        package: {
          include: {
            stable: {
              include: {
                owner: true
              }
            }
          }
        },
        rider: true,
      }
    });

    // Send Emails
    if (packageBooking.rider.email) {
      // 1. Send confirmation to Rider
      try {
        await sendBookingConfirmationEmail({
          bookingId: packageBooking.id,
          riderName: packageBooking.rider.fullName || "Valued Guest",
          riderEmail: packageBooking.rider.email,
          stableName: packageBooking.package.stable?.name || "PyraRides Official",
          stableAddress: packageBooking.package.stable?.address || "Giza Pyramids Area (Meeting point details to follow)",
          horseName: packageBooking.package.title,
          horseImage: packageBooking.package.imageUrl,
          date: packageBooking.date.toISOString(),
          startTime: packageBooking.startTime,
          endTime: `+${packageBooking.package.duration} HRS`,
          totalPrice: parseFloat(packageBooking.totalPrice.toString()),
          riders: packageBooking.ticketsCount,
        });
      } catch (err) {
        console.error("Failed to send rider package confirmation:", err);
      }

      // 2. Send notification to Stable Owner (if assigned)
      if (packageBooking.package.stable?.owner?.email) {
        try {
          await sendOwnerBookingNotification({
            ownerEmail: packageBooking.package.stable.owner.email,
            riderName: packageBooking.rider.fullName || "Valued Guest",
            riderEmail: packageBooking.rider.email,
            riderPhone: "Not provided",
            horseName: `VIP PACKAGE: ${packageBooking.package.title}`,
            horseImage: packageBooking.package.imageUrl,
            date: packageBooking.date.toISOString(),
            startTime: packageBooking.startTime,
            endTime: `+${packageBooking.package.duration} HRS`,
            totalPrice: parseFloat(packageBooking.totalPrice.toString()),
            bookingId: packageBooking.id,
          });
        } catch (err) {
          console.error("Failed to send owner package notification:", err);
        }
      }

      // 3. Create In-App Notification for Rider
      try {
        await prisma.notification.create({
          data: {
            userId: packageBooking.riderId,
            type: "booking_confirmed",
            title: "VIP Package Confirmed",
            message: `Your luxury package ${packageBooking.package.title} is confirmed for ${new Date(date).toLocaleDateString()}.`,
            data: { packageBookingId: packageBooking.id },
          }
        });
      } catch (err) {
        console.error("Failed to create rider notification:", err);
      }

      // 4. Create In-App Notification for Stable Owner (if assigned)
      if (packageBooking.package.stable?.owner?.id) {
        try {
          await prisma.notification.create({
            data: {
              userId: packageBooking.package.stable.owner.id,
              type: "booking_received",
              title: "New VIP Package Booking",
              message: `${packageBooking.rider.fullName || "A rider"} booked ${packageBooking.package.title} for ${packageBooking.ticketsCount} tickets. Earnings: EGP ${parseFloat(packageBooking.totalPrice.toString())}`,
              data: { packageBookingId: packageBooking.id },
            }
          });
        } catch (err) {
          console.error("Failed to create owner notification:", err);
        }
      }
    }

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
                description: `Package Booking: ${pkg.packageType === 'PRIVATE' ? 'Private Event' : finalTicketsCount + ' Tickets'} on ${new Date(date).toLocaleDateString()}${transportZoneName ? ' + Pickup' : ''}`,
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
