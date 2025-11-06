import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service provider (Mailchimp, SendGrid, etc.)
    // For now, just log the subscription
    console.log("New newsletter subscription:", email);

    // In production, you would:
    // 1. Validate email format
    // 2. Check if already subscribed
    // 3. Add to email service provider
    // 4. Send welcome email
    // 5. Store in database

    return NextResponse.json(
      { success: true, message: "Subscribed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
