import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only riders can create bookings
    if (session.user.role !== "rider") {
      return NextResponse.json(
        { error: "Only riders can create bookings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { stableId, startTime, endTime, promoCodeId, paymentMethod, bookings } = body;

    // Validate required fields
    if (!stableId || !startTime || !endTime || !bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or invalid bookings data" },
        { status: 400 }
      );
    }

    // Cash Privilege Check
    if (paymentMethod === 'cash') {
      const cashConfig = await prisma.systemConfig.findUnique({
        where: { key: 'CASH_RESTRICTION_ENABLED' }
      });

      // Default to allowed (false) if not set. If 'true', then restricted.
      if (cashConfig?.value === 'true') {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { isTrustedRider: true }
        });

        if (!user?.isTrustedRider) {
          return NextResponse.json(
            { error: "Cash payment is only available for Trusted Riders. Please pay online for your first booking." },
            { status: 403 }
          );
        }
      }
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Check that start time is in the future
    if (start < now) {
      return NextResponse.json(
        { error: "Booking start time must be in the future" },
        { status: 400 }
      );
    }

    // Check that end time is after start time
    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check minimum booking duration (at least 1 hour)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours < 1) {
      return NextResponse.json(
        { error: "Minimum booking duration is 1 hour" },
        { status: 400 }
      );
    }

    // Check if stable exists and is approved
    const stable = await prisma.stable.findUnique({
      where: {
        id: stableId,
        status: "approved",
      },
    });

    if (!stable) {
      return NextResponse.json(
        { error: "Stable not found or not approved" },
        { status: 404 }
      );
    }

    // Feature 5: Check lead time (minimum hours before booking)
    const minLeadTimeHours = stable.minLeadTimeHours || 8; // Default 8 hours
    const leadTimeMs = minLeadTimeHours * 60 * 60 * 1000; // Convert to milliseconds
    const earliestAllowedStart = new Date(now.getTime() + leadTimeMs);

    if (start < earliestAllowedStart) {
      return NextResponse.json(
        {
          error: `Bookings must be made at least ${minLeadTimeHours} hours in advance`,
          details: `Earliest available booking time: ${earliestAllowedStart.toLocaleString()}`
        },
        { status: 400 }
      );
    }

    // Get commission rate from stable (default to 0.15 if not set)
    const commissionRate = stable.commissionRate
      ? Number(stable.commissionRate)
      : 0.15; // Default 15%

    // Validate and process each booking in the group
    const createdBookings = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const bookingItem of bookings) {
        const { horseId, riderId } = bookingItem;

        if (!horseId || !riderId) {
          throw new Error("Missing horseId or riderId for one of the bookings");
        }

        // Check if horse exists and is active
        const horse = await tx.horse.findUnique({
          where: {
            id: horseId,
            isActive: true,
          },
        });

        if (!horse) {
          throw new Error(`Horse not found or not available (ID: ${horseId})`);
        }

        // Check if horse belongs to stable
        if (horse.stableId !== stableId) {
          throw new Error(`Horse ${horse.name} does not belong to this stable`);
        }

        // Skill-based booking restriction
        // Get rider's skill level
        const riderUser = await tx.user.findUnique({
          where: { id: riderId },
          select: { rankPoints: true },
        });

        if (!riderUser) {
          throw new Error(`Rider not found (ID: ${riderId})`);
        }

        // Determine rider tier based on rank points
        const getRiderTier = (points: number) => {
          if (points >= 1701) return "ADVANCED";
          if (points >= 1301) return "INTERMEDIATE";
          return "BEGINNER";
        };

        const riderTier = getRiderTier(riderUser.rankPoints);
        // Use adminTier (set by admins) instead of skillLevel (never set)
        // Normalize to uppercase for consistent comparison
        const horseLevel = horse.adminTier
          ? horse.adminTier.toUpperCase()
          : "BEGINNER"; // Default to BEGINNER if not set

        console.log(`[Booking Debug] Rider: ${riderId}, Points: ${riderUser.rankPoints}, Tier: ${riderTier}`);
        console.log(`[Booking Debug] Horse: ${horseId}, Level: ${horseLevel}`);

        // Skill restriction rules
        const canBook = (
          (riderTier === "ADVANCED") || // Advanced can ride anything
          (riderTier === "INTERMEDIATE" && horseLevel !== "ADVANCED") || // Intermediate can ride beginner/intermediate
          (riderTier === "BEGINNER" && horseLevel === "BEGINNER") // Beginner can only ride beginner
        );

        console.log(`[Booking Debug] Can Book: ${canBook}`);

        if (!canBook) {
          // Check if there's an approved override request
          const approvedOverride = await tx.skillOverrideRequest.findFirst({
            where: {
              riderId,
              horseId,
              status: "approved",
            },
          });

          if (!approvedOverride) {
            throw new Error(`Skill level mismatch: ${riderTier} rider cannot book ${horseLevel} horse "${horse.name}" without an approved override request.`);
          }
        }

        // Check for overlapping bookings (include pending to prevent race conditions)
        const overlappingBookings = await tx.booking.findFirst({
          where: {
            horseId,
            status: { in: ["confirmed", "pending"] },
            AND: [
              { startTime: { lte: end } },
              { endTime: { gte: start } },
            ],
          },
        });

        if (overlappingBookings) {
          throw new Error(`Horse ${horse.name} is already booked for the selected time`);
        }

        // Strict Session Limit Check (Horse Welfare)
        const bookingHour = start.getHours();
        const isAmBooking = bookingHour < 12;
        const sessionStart = new Date(start);
        sessionStart.setHours(isAmBooking ? 0 : 12, 0, 0, 0);
        const sessionEnd = new Date(start);
        sessionEnd.setHours(isAmBooking ? 12 : 23, 59, 59, 999);

        const existingSessionBooking = await tx.booking.findFirst({
          where: {
            horseId,
            status: { in: ["confirmed", "pending"] },
            startTime: {
              gte: sessionStart,
              lt: sessionEnd,
            },
          },
        });

        if (existingSessionBooking) {
          throw new Error(`Horse ${horse.name} welfare limit reached. Only one ride per session allowed.`);
        }

        // Calculate price
        const pricePerHour = Number(horse.pricePerHour ?? 50);
        const totalPrice = hours * pricePerHour;
        const commission = totalPrice * commissionRate;

        // Create the booking
        const newBooking = await tx.booking.create({
          data: {
            riderId,
            stableId,
            horseId,
            startTime,
            endTime,
            totalPrice,
            commission,
            status: "confirmed",
            promoCodeId: promoCodeId || null,
          },
          include: {
            stable: { select: { name: true, location: true } },
            horse: { select: { name: true, imageUrls: true } },
            rider: { select: { fullName: true, email: true, phoneNumber: true } }
          },
        });

        // Update availability slots
        await tx.availabilitySlot.updateMany({
          where: {
            stableId,
            horseId,
            startTime: { gte: new Date(startTime) },
            endTime: { lte: new Date(endTime) },
            isBooked: false,
          },
          data: {
            isBooked: true,
            bookingId: newBooking.id,
          },
        });

        results.push(newBooking);
      }

      // Increment promo code usage if applied (once per group booking transaction)
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: {
            currentUses: {
              increment: 1,
            },
          },
        });
      }

      // Update Trusted Rider status if paying online (not cash)
      if (paymentMethod !== 'cash') {
        await tx.user.update({
          where: { id: session.user.id },
          data: { isTrustedRider: true }
        });
      }

      return results;
    });

    // Send email notifications to stable owners AND admins
    // Send email notifications to stable owners AND admins
    try {
      const [owners, admins] = await Promise.all([
        prisma.user.findMany({
          where: {
            stableId: stableId,
            role: "stable_owner",
          },
          select: { email: true }
        }),
        prisma.user.findMany({
          where: {
            role: "admin",
          },
          select: { email: true }
        })
      ]);

      const allRecipients = [...owners, ...admins];

      if (allRecipients.length > 0) {
        const { sendOwnerBookingNotification } = await import("@/lib/email");

        // Send notifications for each booking in the group
        for (const booking of createdBookings) {
          const emailPromises = allRecipients.map(recipient =>
            sendOwnerBookingNotification({
              ownerEmail: recipient.email,
              riderName: booking.rider.fullName || "Guest Rider",
              riderEmail: booking.rider.email,
              riderPhone: booking.rider.phoneNumber || undefined,
              horseName: booking.horse.name,
              horseImage: booking.horse.imageUrls?.[0] || undefined,
              date: booking.startTime.toISOString(),
              startTime: new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
              endTime: new Date(booking.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
              totalPrice: Number(booking.totalPrice),
              bookingId: booking.id,
            })
          );

          const results = await Promise.allSettled(emailPromises);

          // Log results
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`[Booking] Failed to send email to ${allRecipients[index].email}:`, result.reason);
            } else {
              console.log(`[Booking] Email sent successfully to ${allRecipients[index].email}`);
            }
          });
        }
      }

      // Send Universal Notifications (In-App + Push)
      // We fetch all relevant users (owners + admins) to create in-app notifications for them
      const notificationRecipients = await prisma.user.findMany({
        where: {
          OR: [
            { stableId: stableId, role: "stable_owner" },
            { role: "admin" }
          ]
        },
        select: { id: true, role: true }
      });

      if (notificationRecipients.length > 0) {
        const { createBulkNotifications } = await import("@/lib/notifications");

        const notifications = notificationRecipients.map(user => ({
          userId: user.id,
          type: "booking_new",
          title: "New Booking Received! 🐎",
          message: `You have a new booking for ${bookings.length} horse(s). Check your dashboard.`,
          data: {
            bookingId: createdBookings[0].id, // Link to first booking
            url: user.role === "admin" ? "/dashboard/admin" : "/dashboard/stable"
          }
        }));

        await createBulkNotifications(notifications);
        console.log(`[Booking] Created ${notifications.length} universal notifications`);
      }

    } catch (notificationError) {
      console.error("[Booking] Error sending notifications:", notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      bookings: createdBookings,
      debug: {
        riderTier: bookings[0]?.riderId ? await (async () => {
          const r = await prisma.user.findUnique({ where: { id: bookings[0].riderId }, select: { rankPoints: true } });
          return r ? (r.rankPoints >= 1701 ? "ADVANCED" : r.rankPoints >= 1301 ? "INTERMEDIATE" : "BEGINNER") : "UNKNOWN";
        })() : "N/A",
        horseLevel: bookings[0]?.horseId ? await (async () => {
          const h = await prisma.horse.findUnique({ where: { id: bookings[0].horseId }, select: { skillLevel: true } });
          return h?.skillLevel;
        })() : "N/A"
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);

    // Check for known validation errors and return 400
    const errorMessage = error instanceof Error ? error.message : "Failed to create booking";

    if (
      errorMessage.includes("welfare limit reached") ||
      errorMessage.includes("already booked") ||
      errorMessage.includes("Skill level mismatch") ||
      errorMessage.includes("does not belong to this stable") ||
      errorMessage.includes("Rider not found") ||
      errorMessage.includes("Horse not found")
    ) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      // Return empty array instead of error for unauthenticated users
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const ownerOnly = searchParams.get("ownerOnly") === "true";
    const statusFilter = searchParams.get("status"); // e.g., "completed"

    let where: any = {};

    // If ownerOnly is true, get bookings for stable owner's stable
    if (ownerOnly && session.user.role === "stable_owner") {
      // Get user's stableId
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stableId: true },
      });

      if (user?.stableId) {
        where.stableId = user.stableId;
      } else {
        return NextResponse.json({ bookings: [] }, { status: 200 });
      }
    } else {
      // Default: Get bookings for the current rider
      where.riderId = session.user.id;

      // If stableId is provided in query params, filter by it
      const stableId = searchParams.get("stableId");
      if (stableId) {
        where.stableId = stableId;
      }
    }

    // Filter by status if provided
    if (statusFilter) {
      if (statusFilter.includes(',')) {
        const statuses = statusFilter.split(',').map(s => s.trim()) as any[];
        where.status = { in: statuses };
      } else {
        where.status = statusFilter as any;
      }
    }

    console.log(`[GET /api/bookings] Fetching bookings with filter:`, JSON.stringify(where));

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        stable: {
          select: {
            name: true,
            location: true,
          },
        },
        horse: {
          select: {
            name: true,
            adminTier: true, // Include adminTier for scoring
          },
        },
        rider: ownerOnly ? {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        } : undefined,
        review: {
          select: {
            id: true,
          },
        },
        rideResult: {
          select: {
            id: true, // Check if already scored
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out already scored bookings if ownerOnly
    let filteredBookings = bookings;
    if (ownerOnly) {
      filteredBookings = bookings.filter((booking: any) => !booking.rideResult);
    }

    // Add hasReview flag to each booking
    const bookingsWithReviewStatus = filteredBookings.map((booking: any) => ({
      ...booking,
      hasReview: !!booking.review,
      alreadyScored: !!booking.rideResult,
    }));

    return NextResponse.json({ bookings: bookingsWithReviewStatus });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

