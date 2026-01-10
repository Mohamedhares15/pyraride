import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase-admin";

export async function GET(req: Request) {
    try {
        // Find users whose last booking was > 7 days ago
        // This is a bit complex with Prisma, so we'll fetch recent bookings and exclude those users,
        // or just iterate through users who haven't booked in a while.
        // Simplified approach: Find bookings that ended exactly 7 days ago.

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

        const oldBookings = await prisma.booking.findMany({
            where: {
                endTime: {
                    lt: sevenDaysAgo,
                    gte: eightDaysAgo
                },
                status: "completed"
            },
            include: {
                rider: true
            }
        });

        // Use a Set to avoid duplicate notifications if user had multiple bookings that day
        const notifiedUserIds = new Set();

        for (const booking of oldBookings) {
            if (notifiedUserIds.has(booking.riderId)) continue;

            // Check if they have made a NEWER booking since then
            const recentBooking = await prisma.booking.findFirst({
                where: {
                    riderId: booking.riderId,
                    startTime: { gt: sevenDaysAgo }
                }
            });

            if (!recentBooking && booking.rider.pushToken) {
                await sendPushNotification(
                    booking.rider.pushToken,
                    "We missed you! 🐴",
                    "It's been a week since your last ride. Ready for another adventure?",
                    {
                        type: "reengagement",
                        url: "/"
                    }
                );
                notifiedUserIds.add(booking.riderId);
            }
        }

        return NextResponse.json({ success: true, processed: notifiedUserIds.size });
    } catch (error) {
        console.error("Error sending re-engagement notifications:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
