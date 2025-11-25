import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Only admins can send notifications
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all users (email is required in schema, so no need to filter for null)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({
        message: "No users found to notify",
        sent: 0,
      });
    }

    // Send email to each user
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        await sendEmail({
          to: user.email!,
          subject: "🎉 PyraRide is Now Live!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>PyraRide is Now Live!</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎉 PyraRide is Live!</h1>
              </div>
              <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hi ${user.fullName || "there"},</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Great news! PyraRide is now fully operational and ready for you to start booking amazing horse riding experiences at the Giza and Saqqara Pyramids!
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0; font-size: 16px; font-weight: 600;">✨ What you can do now:</p>
                  <ul style="margin: 15px 0; padding-left: 25px;">
                    <li>Browse verified stables and horses</li>
                    <li>Book your perfect riding experience</li>
                    <li>Read reviews from other riders</li>
                    <li>Manage your bookings easily</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 40px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-size: 18px; 
                            font-weight: 600; 
                            display: inline-block;">
                    Start Exploring →
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 40px; text-align: center;">
                  Thank you for your patience! We're excited to have you with us. 🐴
                </p>
                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 10px;">
                  — The PyraRide Team
                </p>
              </div>
            </body>
            </html>
          `,
          text: `Hi ${user.fullName || "there"},

Great news! PyraRide is now fully operational and ready for you to start booking amazing horse riding experiences at the Giza and Saqqara Pyramids!

What you can do now:
- Browse verified stables and horses
- Book your perfect riding experience
- Read reviews from other riders
- Manage your bookings easily

Visit us at: ${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}

Thank you for your patience! We're excited to have you with us. 🐴

— The PyraRide Team`,
        });
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`Failed to send to ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
        console.error(`Failed to send email to ${user.email}:`, error);
      }
    }

    return NextResponse.json({
      message: `Email notifications sent`,
      total: users.length,
      sent: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

