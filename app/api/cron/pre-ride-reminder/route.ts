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
    const in11Hours = new Date(now.getTime() + 11 * 60 * 60 * 1000);
    const in13Hours = new Date(now.getTime() + 13 * 60 * 60 * 1000);

    // --- Standard Horse Bookings ---
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        startTime: {
          gte: in11Hours,
          lte: in13Hours,
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
        title: "⏰ Your Adventure Starts in ~12 Hours!",
        message: `Your ride with ${booking.horse.name} at ${booking.stable.name} is almost here. Remember to arrive 15 minutes early!`,
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

      // Only send if it falls in the 11-13 hour window
      const hoursAway = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursAway < 11 || hoursAway > 13) continue;

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
        title: "⏰ Your VIP Package Starts in ~12 Hours!",
        message: `${booking.package.title} is almost here! Have everything ready and arrive 15 minutes early for check-in.`,
        data: { packageBookingId: booking.id },
      });
    }

    const allNotifications = [...horseNotifications, ...packageNotifications];
    if (allNotifications.length > 0) {
      await createBulkNotifications(allNotifications);
    }

    console.log(`[Cron/PreRide] Processed ${upcomingBookings.length} horse rides and ${upcomingPackages.length} packages.`);

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
