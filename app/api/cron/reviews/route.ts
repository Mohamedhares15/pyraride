import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase-admin";

export async function GET(req: Request) {
    try {
        // Find bookings completed > 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

        const bookings = await prisma.booking.findMany({
            where: {
                endTime: {
                    lt: twentyFourHoursAgo,
                    gte: twentyFiveHoursAgo
                },
                status: "completed",
            },
            include: {
                rider: true,
                stable: { include: { owner: true } },
                review: true,
                rideResult: true,
            }
        });

        for (const booking of bookings) {
            // 1. Notify Rider to leave a review (if they haven't)
            if (!booking.review && booking.rider.pushToken) {
                await sendPushNotification(
                    booking.rider.pushToken,
                    "How was your ride? ⭐",
                    "We'd love to hear about your experience! Tap to leave a review.",
                    {
                        type: "review_reminder",
                        url: `/dashboard/rider?action=review&bookingId=${booking.id}`
                    }
                );
            }

            // 2. Notify Owner to rate the rider (if they haven't)
            if (!booking.rideResult && booking.stable.owner.pushToken) {
                await sendPushNotification(
                    booking.stable.owner.pushToken,
                    "Rate your rider 📝",
                    `Please rate your experience with ${booking.rider.fullName}.`,
                    {
                        type: "rate_rider_reminder",
                        url: `/dashboard/stable?action=rate&bookingId=${booking.id}`
                    }
                );
            }
        }

        return NextResponse.json({ success: true, processed: bookings.length });
    } catch (error) {
        console.error("Error sending review reminders:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
