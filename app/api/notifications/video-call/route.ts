import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Request a video call (sends notification to stable owner)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { stableId, riderId, riderName, action } = await req.json();

        if (!stableId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify the rider has a booking with this stable
        const booking = await prisma.booking.findFirst({
            where: {
                riderId: session.user.id,
                stableId,
                status: { in: ["confirmed", "pending"] },
                startTime: { gte: new Date() }, // Only future bookings
            },
            include: {
                stable: {
                    include: {
                        owner: true,
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "You must have an active booking with this stable to request a video call" },
                { status: 403 }
            );
        }

        // In production, you would:
        // 1. Send push notification to stable owner
        // 2. Send email notification
        // 3. Create a WebSocket event for real-time notification
        // 4. Store the call request in database

        // For demo, we'll log and return success
        console.log(`Video call request from ${riderName} to stable ${stableId}`);
        console.log(`Stable owner: ${booking.stable.owner.email}`);

        // Create a notification record (simplified)
        // In production, you'd have a Notification model

        return NextResponse.json({
            success: true,
            message: "Notification sent to stable owner",
            stableOwner: {
                name: booking.stable.owner.fullName || booking.stable.owner.email,
                // Don't expose email for privacy
            },
            booking: {
                date: booking.startTime.toISOString(),
            },
        });
    } catch (error) {
        console.error("Video call notification error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}

// GET - Check if there's an incoming call request (for stable owners)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // In production, you would:
        // 1. Check database for pending call requests for this owner's stables
        // 2. Return any pending requests

        // For demo, return empty (no pending calls)
        return NextResponse.json({
            pendingCalls: [],
        });
    } catch (error) {
        console.error("Get video call requests error:", error);
        return NextResponse.json(
            { error: "Failed to get call requests" },
            { status: 500 }
        );
    }
}
