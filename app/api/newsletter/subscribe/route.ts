import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You're already subscribed! Check your inbox for exclusive offers." },
        { status: 200 }
      );
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        subscribedAt: new Date(),
        status: "active",
      },
    });

    // TODO: Send welcome email with 10% discount code
    // You can integrate with your email service (Mailchimp, SendGrid, etc.)

    return NextResponse.json(
      { 
        message: "Welcome! Check your email for your 10% discount code.",
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { message: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { status: "unsubscribed" },
    });

    return NextResponse.json(
      { message: "Successfully unsubscribed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { message: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

