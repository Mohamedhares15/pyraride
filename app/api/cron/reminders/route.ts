import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBulkNotifications } from "@/lib/notifications";

// This endpoint should be called by a Cron Job (e.g., Vercel Cron) once every hour
export async function GET(req: Request) {
    try {
        // 1. Find completed bookings from ~24 hours ago that haven't been reviewed
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

        const bookingsToReview = await prisma.booking.findMany({
            where: {
                status: "completed",
                endTime: {
                    gte: twentyFiveHoursAgo,
                    lte: twentyFourHoursAgo,
                },
                review: null, // No review yet
            },
            include: {
                rider: true,
                stable: {
                    include: { owner: true }
                },
                horse: true
            }
        });

        if (bookingsToReview.length > 0) {
            const notifications = [];

            for (const booking of bookingsToReview) {
                // Notify Rider
                notifications.push({
                    userId: booking.riderId,
                    type: "review_reminder",
                    title: "How was your ride? 🐴",
                    message: `We hope you enjoyed your ride with ${booking.horse.name}! Please leave a review.`,
                    data: {
                        url: `/bookings/${booking.id}/review`
                    }
                });

                // Notify Stable Owner (Optional: "Follow up with rider")
                if (booking.stable.owner) {
                    notifications.push({
                        userId: booking.stable.owner.id,
                        type: "review_reminder_owner",
                        title: "Ride Completed 🏁",
                        message: `${booking.rider.fullName || "A rider"} completed their ride yesterday. Check if they left a review!`,
                        data: {
                            url: `/dashboard/stable/bookings/${booking.id}`
                        }
                    });
                }
            }

            await createBulkNotifications(notifications);
            console.log(`[Cron] Sent ${notifications.length} review reminders`);
        }

        return NextResponse.json({
            success: true,
            processed: bookingsToReview.length
        });
    } catch (error) {
        console.error("[Cron] Error processing review reminders:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
