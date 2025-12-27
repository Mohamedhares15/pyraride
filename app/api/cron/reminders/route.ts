import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// This endpoint is called by Vercel Cron every hour
// It finds bookings happening in the next 5-6 hours and sends reminder emails
export async function GET(req: Request) {
    try {
        // Verify the request is from Vercel Cron (in production)
        const authHeader = req.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();

        // Find bookings happening in 5-6 hours from now
        const fiveHoursFromNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
        const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

        console.log(`[Reminder Cron] Running at ${now.toISOString()}`);
        console.log(`[Reminder Cron] Looking for bookings between ${fiveHoursFromNow.toISOString()} and ${sixHoursFromNow.toISOString()}`);

        // Fetch bookings that:
        // 1. Start in 5-6 hours
        // 2. Are confirmed (not cancelled)
        // 3. Haven't received a reminder yet
        const upcomingBookings = await prisma.booking.findMany({
            where: {
                startTime: {
                    gte: fiveHoursFromNow,
                    lt: sixHoursFromNow,
                },
                cancelledBy: null, // Not cancelled
                reminderSent: false, // Haven't sent reminder yet
            },
            include: {
                rider: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
                horse: {
                    select: {
                        name: true,
                        images: true,
                    },
                },
                stable: {
                    select: {
                        name: true,
                        address: true,
                    },
                },
            },
        });

        console.log(`[Reminder Cron] Found ${upcomingBookings.length} bookings to remind`);

        let successCount = 0;
        let failCount = 0;

        for (const booking of upcomingBookings) {
            try {
                // Format times for display
                const startTime = new Date(booking.startTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
                const endTime = new Date(booking.endTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
                const date = new Date(booking.startTime).toISOString().split("T")[0];

                // Send reminder email
                const emailSent = await sendBookingReminderEmail({
                    riderName: booking.rider.fullName || "Rider",
                    riderEmail: booking.rider.email,
                    stableName: booking.stable.name,
                    stableAddress: booking.stable.address || "",
                    horseName: booking.horse.name,
                    horseImage: booking.horse.images?.[0] || undefined,
                    date,
                    startTime,
                    endTime,
                });

                if (emailSent) {
                    // Mark booking as reminder sent
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { reminderSent: true },
                    });
                    successCount++;
                    console.log(`[Reminder Cron] Sent reminder for booking ${booking.id} to ${booking.rider.email}`);
                } else {
                    failCount++;
                    console.error(`[Reminder Cron] Failed to send reminder for booking ${booking.id}`);
                }
            } catch (error) {
                failCount++;
                console.error(`[Reminder Cron] Error processing booking ${booking.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${upcomingBookings.length} bookings. Sent: ${successCount}, Failed: ${failCount}`,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error("[Reminder Cron] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
