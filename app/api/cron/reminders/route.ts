import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase-admin";

export async function GET(req: Request) {
    try {
        // Check for bookings starting in the next 4 hours (e.g., between 3.5 and 4.5 hours from now)
        // Actually, let's say exactly 4 hours ahead.
        // We'll look for bookings where startTime is between now+4h and now+4h+15m
        // This assumes the cron runs every 15 minutes.

        const now = new Date();
        const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const fourHoursFifteenFromNow = new Date(now.getTime() + 4.25 * 60 * 60 * 1000);

        const bookings = await prisma.booking.findMany({
            where: {
                startTime: {
                    gte: fourHoursFromNow,
                    lt: fourHoursFifteenFromNow,
                },
                status: "confirmed",
                reminderSent: false,
            },
            include: {
                rider: true,
                stable: {
                    include: {
                        owner: true,
                    }
                },
                horse: true,
            },
        });

        console.log(`Found ${bookings.length} bookings for reminders.`);

        for (const booking of bookings) {
            // Notify Rider
            if (booking.rider.pushToken) {
                await sendPushNotification(
                    booking.rider.pushToken,
                    "Upcoming Ride Reminder 🐴",
                    `Your ride with ${booking.horse.name} at ${booking.stable.name} starts in 4 hours!`,
                    { type: "reminder", bookingId: booking.id }
                );
            }

            // Notify Stable Owner
            if (booking.stable.owner.pushToken) {
                await sendPushNotification(
                    booking.stable.owner.pushToken,
                    "Upcoming Booking Reminder 📅",
                    `You have a booking for ${booking.horse.name} with ${booking.rider.fullName} in 4 hours.`,
                    { type: "reminder", bookingId: booking.id }
                );
            }

            // Mark reminder as sent
            await prisma.booking.update({
                where: { id: booking.id },
                data: { reminderSent: true },
            });
        }

        return NextResponse.json({ success: true, processed: bookings.length });
    } catch (error) {
        console.error("Error sending reminders:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
