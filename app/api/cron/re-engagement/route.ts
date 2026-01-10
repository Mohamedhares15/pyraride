import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBulkNotifications } from "@/lib/notifications";

// This endpoint should be called by a Cron Job once a day
export async function GET(req: Request) {
    try {
        // Find riders who haven't booked in 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

        // Get users who made their LAST booking exactly 7 days ago
        // This is a bit complex in Prisma, so we'll simplify:
        // Find bookings that ended 7-8 days ago, then check if the user has booked since then.

        const lastWeekBookings = await prisma.booking.findMany({
            where: {
                endTime: {
                    gte: eightDaysAgo,
                    lte: sevenDaysAgo,
                },
                status: "completed"
            },
            select: { riderId: true }
        });

        const riderIds = [...new Set(lastWeekBookings.map(b => b.riderId))];
        const notifications = [];

        for (const riderId of riderIds) {
            // Check if they have any newer bookings
            const recentBooking = await prisma.booking.findFirst({
                where: {
                    riderId: riderId,
                    createdAt: { gt: sevenDaysAgo }
                }
            });

            if (!recentBooking) {
                // They haven't booked in a week!
                notifications.push({
                    userId: riderId,
                    type: "re_engagement",
                    title: "We missed you! 🐎",
                    message: "Ready for another adventure? The Pyramids are waiting for you!",
                    data: {
                        url: "/stables"
                    }
                });
            }
        }

        if (notifications.length > 0) {
            await createBulkNotifications(notifications);
            console.log(`[Cron] Sent ${notifications.length} re-engagement notifications`);
        }

        return NextResponse.json({
            success: true,
            processed: notifications.length
        });
    } catch (error) {
        console.error("[Cron] Error processing re-engagement:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
