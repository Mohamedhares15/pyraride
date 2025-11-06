import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const { bookingId, amount, currency } = body;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        rider: true,
        stable: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Validate booking ownership
    if (booking.riderId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // TODO: Integrate with Paymob API
    // This is a placeholder - actual Paymob integration needed
    const apiKey = process.env.PAYMOB_API_KEY;
    const integrationId = process.env.PAYMOB_INTEGRATION_ID;

    if (!apiKey || !integrationId) {
      return NextResponse.json(
        { error: "Payment not configured" },
        { status: 500 }
      );
    }

    // Step 1: Get auth token
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
      }),
    });

    const { token } = await authResponse.json();

    // Step 2: Create order
    const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: false,
        amount_cents: Math.round(amount * 100), // Convert to piasters
        currency: currency || "EGP",
        merchant_order_id: bookingId,
        items: [],
      }),
    });

    const orderData = await orderResponse.json();

    // Step 3: Get payment key
    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          apartment: "NA",
          email: booking.rider.email,
          floor: "NA",
          first_name: booking.rider.fullName?.split(" ")[0] || "Guest",
          street: "NA",
          building: "NA",
          phone_number: "NA",
          shipping_method: "PKG",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          last_name: booking.rider.fullName?.split(" ")[1] || "User",
          state: "Giza",
        },
        currency: currency || "EGP",
        integration_id: parseInt(integrationId),
      }),
    });

    const { token: paymentKey } = await paymentKeyResponse.json();

    // Return payment URL
    const iframeId = process.env.PAYMOB_IFRAME_ID || "000000";
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return NextResponse.json({
      paymentUrl,
      orderId: orderData.id,
    });

  } catch (error) {
    console.error("Paymob payment error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}

