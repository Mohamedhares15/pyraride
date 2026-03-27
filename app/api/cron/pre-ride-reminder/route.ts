import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPreRideReminderEmail } from "@/lib/email";
import { createBulkNotifications } from "@/lib/notifications";

// Runs every hour via Vercel Cron (see vercel.json)
// Sends a "prepare for your adventure!" email ~12 hours before each booking
export async function GET(req: Request) {
  // CRON_SECRET auth check (as per Vercel's recommendation)
  const authHeader = req.headers.get("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    // Runs once daily at 6AM UTC (8AM Cairo).
    // Sends reminders for ALL rides happening today that are still 4-20 hours away.
    const in4Hours = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const in20Hours = new Date(now.getTime() + 20 * 60 * 60 * 1000);

    // --- Standard Horse Bookings ---
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        startTime: {
          gte: in4Hours,
          lte: in20Hours,
        },
      },
      include: {
        rider: true,
        stable: true,
        horse: true,
      },
    });

    const horseNotifications = [];
    for (const booking of upcomingBookings) {
      if (!booking.rider.email) continue;

      const mapsLink = booking.stable.address
        ? `https://maps.google.com/?daddr=${encodeURIComponent(booking.stable.address)}`
        : undefined;

      await sendPreRideReminderEmail({
        riderName: booking.rider.fullName || "Rider",
        riderEmail: booking.rider.email,
        rideName: `Ride with ${booking.horse.name}`,
        rideLocation: booking.stable.address || booking.stable.name,
        startTime: booking.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        bookingDate: booking.startTime.toISOString(),
        mapsLink,
      });

      horseNotifications.push({
        userId: booking.riderId,
        type: "ride_reminder",
        title: "⏰ Your Adventure Starts in ~5 Hours!",
        message: `Your ride with ${booking.horse.name} at ${booking.stable.name} starts in about 5 hours. Get ready and arrive 10 minutes early!`,
        data: { bookingId: booking.id },
      });
    }

    // --- Package Bookings ---
    const upcomingPackages = await prisma.packageBooking.findMany({
      where: {
        status: "confirmed",
        // PackageBooking uses date + startTime string, so we need a date range approach
        date: {
          gte: new Date(now.toISOString().slice(0, 10)), // today or later
        },
      },
      include: {
        rider: true,
        package: {
          include: { stable: true }
        },
      },
    });

    const packageNotifications = [];
    for (const booking of upcomingPackages) {
      if (!booking.rider.email) continue;

      // Reconstruct the full booking datetime from date + startTime
      const [hour, minute] = booking.startTime.split(":").map(Number);
      const bookingDateTime = new Date(booking.date);
      bookingDateTime.setHours(hour, minute, 0, 0);

      // Only send if it's at least 4 hours away and within today
      const hoursAway = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursAway < 4 || hoursAway > 20) continue;

      const location = booking.package.stable?.address || "Giza Pyramids — Meeting point details in your booking.";
      const mapsLink = booking.package.stable?.address
        ? `https://maps.google.com/?daddr=${encodeURIComponent(booking.package.stable.address)}`
        : "https://maps.google.com/?q=Giza+Pyramids+Egypt";

      await sendPreRideReminderEmail({
        riderName: booking.rider.fullName || "Valued Guest",
        riderEmail: booking.rider.email,
        rideName: booking.package.title,
        rideLocation: location,
        startTime: booking.startTime,
        bookingDate: booking.date.toISOString(),
        mapsLink,
      });

      packageNotifications.push({
        userId: booking.riderId,
        type: "ride_reminder",
        title: "⏰ Your VIP Package Starts in ~5 Hours!",
        message: `${booking.package.title} is just a few hours away! Get ready for an unforgettable experience.`,
        data: { packageBookingId: booking.id },
      });
    }

    const allNotifications = [...horseNotifications, ...packageNotifications];
    if (allNotifications.length > 0) {
      await createBulkNotifications(allNotifications);
    }

    console.log(`[Cron/PreRide] Runs daily at 6AM UTC. Processed ${upcomingBookings.length} horse rides and ${upcomingPackages.length} packages.`);

    return NextResponse.json({
      success: true,
      horseRidesProcessed: upcomingBookings.length,
      packagesProcessed: upcomingPackages.length,
    });
  } catch (error) {
    console.error("[Cron/PreRide] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
