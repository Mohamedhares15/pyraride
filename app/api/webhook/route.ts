import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update booking with payment ID and confirm it
        if (session.metadata?.bookingId) {
          await prisma.booking.update({
            where: { id: session.metadata.bookingId },
            data: {
              stripePaymentId: session.payment_intent as string,
              status: "confirmed",
            },
          });
        }
        
        console.log("Payment succeeded:", session.id);
        break;

      case "checkout.session.async_payment_succeeded":
        const session2 = event.data.object as Stripe.Checkout.Session;
        if (session2.metadata?.bookingId) {
          await prisma.booking.update({
            where: { id: session2.metadata.bookingId },
            data: {
              status: "confirmed",
            },
          });
        }
        break;

      case "checkout.session.async_payment_failed":
        console.log("Payment failed:", event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

