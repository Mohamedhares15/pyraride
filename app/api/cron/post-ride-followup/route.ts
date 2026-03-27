import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPostRideFollowupEmail } from "@/lib/email";
import { createBulkNotifications } from "@/lib/notifications";

// Runs every hour via Vercel Cron (see vercel.json)
// Sends a "Thank You + Leave a Review" email ~2-3 hours after each booking ends
export async function GET(req: Request) {
  // CRON_SECRET auth check (Vercel recommended)
  const authHeader = req.headers.get("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    // --- Standard Horse Bookings that ended 2-3 hours ago ---
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["confirmed", "completed"] },
        endTime: {
          gte: threeHoursAgo,
          lte: twoHoursAgo,
        },
        review: null, // Don't send if already reviewed
      },
      include: {
        rider: true,
        horse: true,
        stable: true,
      },
    });

    const horseNotifications = [];
    for (const booking of completedBookings) {
      if (!booking.rider.email) continue;

      const reviewUrl = `${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}/bookings/${booking.id}/review`;

      await sendPostRideFollowupEmail({
        riderName: booking.rider.fullName || "Rider",
        riderEmail: booking.rider.email,
        rideName: booking.horse.name,
        reviewUrl,
        rideImage: booking.horse.imageUrls?.[0],
      });

      horseNotifications.push({
        userId: booking.riderId,
        type: "review_request",
        title: "★ How was your ride?",
        message: `We hope you loved riding ${booking.horse.name}! Please leave a quick review — it takes less than a minute.`,
        data: { bookingId: booking.id, url: reviewUrl },
      });
    }

    // --- Package Bookings that ended 2-3 hours ago ---
    const todayStr = now.toISOString().slice(0, 10);
    const recentPackages = await prisma.packageBooking.findMany({
      where: {
        status: { in: ["confirmed", "completed"] },
        date: {
          gte: new Date(new Date(now).setDate(now.getDate() - 1)), // yesterday or today
          lte: new Date(todayStr), // up to today
        },
      },
      include: {
        rider: true,
        package: true,
      },
    });

    const packageNotifications = [];
    for (const booking of recentPackages) {
      if (!booking.rider.email) continue;

      // Reconstruct end datetime
      const [hour, minute] = booking.startTime.split(":").map(Number);
      const startDt = new Date(booking.date);
      startDt.setHours(hour, minute, 0, 0);
      const endDt = new Date(startDt.getTime() + booking.package.duration * 60 * 60 * 1000);

      // Check if it ended 2-3 hours ago
      const hoursAgo = (now.getTime() - endDt.getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 2 || hoursAgo > 3) continue;

      const reviewUrl = `${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}/dashboard/rider/bookings`;

      await sendPostRideFollowupEmail({
        riderName: booking.rider.fullName || "Valued Guest",
        riderEmail: booking.rider.email,
        rideName: booking.package.title,
        reviewUrl,
        rideImage: booking.package.imageUrl,
      });

      packageNotifications.push({
        userId: booking.riderId,
        type: "review_request",
        title: "★ How was your VIP Experience?",
        message: `We hope ${booking.package.title} was everything you dreamed of! Your review means a lot to us.`,
        data: { packageBookingId: booking.id, url: reviewUrl },
      });
    }

    const allNotifications = [...horseNotifications, ...packageNotifications];
    if (allNotifications.length > 0) {
      await createBulkNotifications(allNotifications);
    }

    console.log(`[Cron/PostRide] Processed ${completedBookings.length} horse rides and ${recentPackages.length} packages.`);

    return NextResponse.json({
      success: true,
      horseRidesProcessed: completedBookings.length,
      packagesProcessed: recentPackages.length,
    });
  } catch (error) {
    console.error("[Cron/PostRide] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
