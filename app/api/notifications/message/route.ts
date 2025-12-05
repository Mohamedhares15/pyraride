import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Send email notification for new messages
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { recipientId, messagePreview, senderName } = body;

        if (!recipientId || !messagePreview) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get recipient's email
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            select: { email: true, fullName: true },
        });

        if (!recipient) {
            return NextResponse.json(
                { error: "Recipient not found" },
                { status: 404 }
            );
        }

        // Send email notification
        if (resend) {
            try {
                await resend.emails.send({
                    from: "PyraRide <pyrarides@pyrarides.com>",
                    to: recipient.email,
                    subject: `New message from ${senderName || "Someone"} on PyraRide`,
                    html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                  
                  <!-- Logo -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0;">🐴 PyraRide</h1>
                  </div>
                  
                  <!-- Message -->
                  <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">New message from</p>
                    <p style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">${senderName || "A PyraRide user"}</p>
                    <div style="background: rgba(139, 92, 246, 0.1); border-left: 3px solid #8b5cf6; padding: 12px 16px; border-radius: 0 8px 8px 0;">
                      <p style="color: #e5e7eb; font-size: 16px; margin: 0; font-style: italic;">"${messagePreview.slice(0, 100)}${messagePreview.length > 100 ? '...' : ''}"</p>
                    </div>
                  </div>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center;">
                    <a href="${process.env.NEXTAUTH_URL || 'https://pyraride.com'}" 
                       style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Message
                    </a>
                  </div>
                  
                  <!-- Footer -->
                  <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      This email was sent because you received a message on PyraRide.<br>
                      <a href="${process.env.NEXTAUTH_URL || 'https://pyraride.com'}" style="color: #8b5cf6; text-decoration: none;">pyraride.com</a>
                    </p>
                  </div>
                  
                </div>
              </div>
            </body>
            </html>
          `,
                });
            } catch (emailError) {
                console.error("Error sending email notification:", emailError);
                // Don't fail the request if email fails
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in message notification:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
