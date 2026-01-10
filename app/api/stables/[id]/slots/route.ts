import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Fetch availability slots for a stable
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // Expect YYYY-MM-DD
    const horseId = searchParams.get("horseId");

    if (!dateStr) {
      return new NextResponse("Date is required", { status: 400 });
    }

    // Parse the date string (YYYY-MM-DD) and create a Date object
    // For @db.Date fields in Prisma, we need to ensure we're matching the DATE part only
    // Extract year, month, day from the string
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create a date object at local midnight
    const queryDate = new Date(year, month - 1, day);

    console.log(`[GET /api/stables/${params.id}/slots] Query date string: ${dateStr}, Created Date object: ${queryDate.toISOString()}`);

    // 1. Automatic Slot Generation
    // We auto-generate slots if NONE exist for this date to ensure availability shows up.
    // This respects the stable's operating hours (default 7-10 AM, 2-4 PM Egypt time).

    // Fetch all active horses
    const horses = await prisma.horse.findMany({
      where: { stableId: params.id, isActive: true },
    });

    // 1. Automatic Slot Generation & Cleanup
    // To ensure users see the correct updated hours (2, 3, 4 PM), we need to clear out old unbooked slots
    // that might have been generated with the wrong hours.

    // Delete UNBOOKED slots for this date/stable to force regeneration with new hours
    // This acts as a self-healing mechanism for the slot hours update.
    await prisma.availabilitySlot.deleteMany({
      where: {
        stableId: params.id,
        date: queryDate,
        bookingId: null, // Only delete unbooked slots
      },
    });

    // Fetch existing (booked) slots to avoid duplicates
    const existingSlots = await prisma.availabilitySlot.findMany({
      where: {
        stableId: params.id,
        date: queryDate,
      },
    });

    // Always attempt to generate slots, but filter out existing ones
    if (horses.length > 0) {
      // console.log(`[GET /api/stables/${params.id}/slots] Checking/Generating slots for ${dateStr}...`);

      const newSlots = [];
      // Egypt is UTC+2. We generate slots in UTC to match Egypt time.
      // Morning: 7, 8, 9, 10, 11, 12 Egypt -> 5, 6, 7, 8, 9, 10 UTC
      // Afternoon: 2, 3, 4 PM (14, 15, 16) Egypt -> 12, 13, 14 UTC
      const amHours = [5, 6, 7, 8, 9, 10];
      const pmHours = [12, 13, 14];
      const desiredHours = [...amHours, ...pmHours];

      // Loop for 7 days
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(queryDate);
        targetDate.setDate(targetDate.getDate() + i);

        // Extract YMD from targetDate to build UTC date
        const y = targetDate.getFullYear();
        const m = targetDate.getMonth();
        const d = targetDate.getDate();

        for (const horse of horses) {
          for (const hour of desiredHours) {
            // Create UTC date objects
            const start = new Date(Date.UTC(y, m, d, hour, 0, 0));
            const end = new Date(Date.UTC(y, m, d, hour + 1, 0, 0));

            // Check if slot already exists (e.g. booked) - Fuzzy match (1 minute tolerance)
            const exists = existingSlots.some(
              s => s.horseId === horse.id &&
                Math.abs(new Date(s.startTime).getTime() - start.getTime()) < 60000
            );

            if (!exists) {
              newSlots.push({
                stableId: params.id,
                horseId: horse.id,
                date: targetDate,
                startTime: start,
                endTime: end,
              });
            }
          }
        }
      }

      if (newSlots.length > 0) {
        await prisma.availabilitySlot.createMany({
          data: newSlots,
        });
        console.log(`[GET /api/stables/${params.id}/slots] Auto-generated ${newSlots.length} missing slots`);
      }
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        stableId: params.id,
        date: queryDate,
        ...(horseId && horseId !== "all" ? { horseId } : {}),
      },
      include: {
        booking: {
          select: {
            id: true,
            riderId: true,
            startTime: true,
            endTime: true,
            status: true,
            cancelledBy: true, // Include cancelledBy to check cancellation
            rider: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // 2. Horse Welfare & Lead Time Logic
    // Instead of filtering out slots, we will mark them with a status.
    // Statuses: 'available', 'booked', 'blocked_session', 'blocked_lead_time'

    // Fetch stable lead time (default 24h if not set)
    const stable = await prisma.stable.findUnique({
      where: { id: params.id },
      select: { minLeadTimeHours: true } // in hours
    });
    const leadTimeHours = stable?.minLeadTimeHours || 24;
    const minBookingTime = new Date(Date.now() + leadTimeHours * 60 * 60 * 1000);

    // Track booked sessions per horse
    const horseBookings = new Map<string, { am: boolean; pm: boolean }>();

    // Fetch ACTUAL bookings for this date directly from Booking table
    // This is more robust than relying on availabilitySlot.booking linkage
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        stableId: params.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'cancelled' }
      },
      select: {
        horseId: true,
        startTime: true
      }
    });

    // Populate horseBookings map from actual bookings
    bookings.forEach(booking => {
      const hour = new Date(booking.startTime).getHours();
      const isAm = hour < 12;

      const current = horseBookings.get(booking.horseId) || { am: false, pm: false };
      if (isAm) current.am = true;
      else current.pm = true;

      horseBookings.set(booking.horseId, current);
    });

    // Also use slot.booking as a fallback/supplement
    slots.forEach(slot => {
      if (!slot.horseId) return;

      if (slot.booking && slot.booking.status !== 'cancelled') {
        const hour = new Date(slot.startTime).getHours();
        const isAm = hour < 12;

        const current = horseBookings.get(slot.horseId) || { am: false, pm: false };
        if (isAm) current.am = true;
        else current.pm = true;

        horseBookings.set(slot.horseId, current);
      }
    });

    // Second pass: Process slots and assign status
    const processedSlots = slots.map(slot => {
      // If booking is cancelled, treat as available (remove booking object)
      if (slot.booking && slot.booking.status === 'cancelled') {
        slot.booking = null;
      }

      // 1. Check if already booked
      if (slot.booking) {
        return { ...slot, status: 'booked' };
      }

      // 2. Check Lead Time - DISABLED SERVER SIDE
      // We allow the frontend to handle lead time visualization (e.g. shifting to tomorrow)
      // if (new Date(slot.startTime) < minBookingTime) {
      //   return { ...slot, status: 'blocked_lead_time' };
      // }

      // 3. Check Welfare Rule & Capacity
      if (slot.horseId) {
        const hour = new Date(slot.startTime).getHours();
        const isAm = hour < 12;

        // Fetch all bookings for this horse on this day
        const horseBookingsList = bookings.filter(b => b.horseId === slot.horseId);

        // Session Capacity Rules:
        // - Maximum 2 bookings in AM (morning)
        // - Maximum 1 booking in PM (afternoon)
        const amBookingsCount = horseBookingsList.filter(b => new Date(b.startTime).getHours() < 12).length;
        const pmBookingsCount = horseBookingsList.filter(b => new Date(b.startTime).getHours() >= 12).length;

        if (isAm && amBookingsCount >= 2) return { ...slot, status: 'blocked_session' };
        if (!isAm && pmBookingsCount >= 1) return { ...slot, status: 'blocked_session' };
      }

      // Default: Available
      // console.log(`[Welfare] Slot ${slot.startTime} for horse ${slot.horseId} is available`);
      return { ...slot, status: 'available' };
    });

    // Deduplicate processedSlots to ensure unique horseId + startTime
    const uniqueSlotsMap = new Map<string, typeof processedSlots[0]>();

    processedSlots.forEach(slot => {
      if (!slot.horseId) return;
      const key = `${slot.horseId}-${new Date(slot.startTime).toISOString()}`;

      // If duplicate exists, prefer the one that is NOT available (i.e. booked or blocked)
      if (uniqueSlotsMap.has(key)) {
        const existing = uniqueSlotsMap.get(key)!;
        if (existing.status === 'available' && slot.status !== 'available') {
          uniqueSlotsMap.set(key, slot);
        }
      } else {
        uniqueSlotsMap.set(key, slot);
      }
    });

    const uniqueSlots = Array.from(uniqueSlotsMap.values());

    console.log(`[GET /api/stables/${params.id}/slots] Returning ${uniqueSlots.length} unique slots (from ${processedSlots.length} total)`);
    return NextResponse.json(uniqueSlots);
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create availability slots
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "stable_owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      date,
      startTime,
      endTime,
      horseId,
      duration = 60, // Default 1 hour slots
      timezoneOffset, // Client's timezone offset in minutes
    } = await req.json();

    if (!date || !startTime || !endTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new NextResponse("Invalid date format. Use YYYY-MM-DD", { status: 400 });
    }

    // Parse date parts
    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(year, month - 1, day);

    // Parse times
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Create slots
    // If horseId is 'all', create for all active horses
    let targetHorseIds: string[] = [];

    if (horseId === 'all') {
      const horses = await prisma.horse.findMany({
        where: { stableId: params.id, isActive: true },
        select: { id: true }
      });
      targetHorseIds = horses.map(h => h.id);
    } else {
      targetHorseIds = [horseId];
    }

    const newSlots = targetHorseIds.map(hId => ({
      stableId: params.id,
      horseId: hId,
      date: queryDate,
      startTime: start,
      endTime: end,
    }));

    await prisma.availabilitySlot.createMany({
      data: newSlots,
    });

    return NextResponse.json({ success: true, count: newSlots.length });
  } catch (error) {
    console.error("Error creating slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
