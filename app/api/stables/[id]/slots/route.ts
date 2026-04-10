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

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [horses, stable, bookings] = await Promise.all([
      prisma.horse.findMany({
        where: { stableId: params.id, isActive: true },
        select: { id: true, name: true }
      }),
      prisma.stable.findUnique({
        where: { id: params.id },
        select: { minLeadTimeHours: true },
      }),
      prisma.booking.findMany({
        where: {
          stableId: params.id,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { not: 'cancelled' },
        },
        select: {
          id: true,
          horseId: true,
          startTime: true,
          endTime: true,
          status: true,
          rider: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    // 1. Dynamic Slot Calculation
    // Build slots in memory using the dates and horses without writing to the database
    const amHours = [5, 6, 7, 8, 9, 10]; // Egypt time: 7-12
    const pmHours = [12, 13, 14];        // Egypt time: 14-16
    const desiredHours = [...amHours, ...pmHours];

    const slots: any[] = [];
    
    if (horses.length > 0) {
      const y = queryDate.getFullYear();
      const m = queryDate.getMonth();
      const d = queryDate.getDate();

      for (const horse of horses) {
        // If a specific horse is requested, skip others
        if (horseId && horseId !== "all" && horse.id !== horseId) continue;

        for (const hour of desiredHours) {
          const start = new Date(Date.UTC(y, m, d, hour, 0, 0));
          const end = new Date(Date.UTC(y, m, d, hour + 1, 0, 0));

          slots.push({
            id: `v-slot-${horse.id}-${start.getTime()}`,
            stableId: params.id,
            horseId: horse.id,
            date: queryDate,
            startTime: start,
            endTime: end,
            booking: null // Bookings are overlaid later mathematically
          });
        }
      }
    }

    // 2. Horse Welfare & Lead Time Logic
    // Instead of filtering out slots, we will mark them with a status.
    // Statuses: 'available', 'booked', 'blocked_session', 'blocked_lead_time'

    const leadTimeHours = stable?.minLeadTimeHours || 24;
    const minBookingTime = new Date(Date.now() + leadTimeHours * 60 * 60 * 1000);

    // Track booked sessions per horse
    const horseBookings = new Map<string, { am: boolean; pm: boolean }>();

    // Populate horseBookings map from actual bookings
    bookings.forEach(booking => {
      const hour = new Date(booking.startTime).getHours();
      const isAm = hour < 12;

      const current = horseBookings.get(booking.horseId) || { am: false, pm: false };
      if (isAm) current.am = true;
      else current.pm = true;

      horseBookings.set(booking.horseId, current);
    });

    // Second pass: Process slots and assign status
    const processedSlots = slots.map(slot => {
      // Create a unified booking object if it falls within an actual booking
      const overlappingBooking = bookings.find(b => 
        b.horseId === slot.horseId && 
        new Date(slot.startTime).getTime() >= new Date(b.startTime).getTime() && 
        new Date(slot.startTime).getTime() < new Date(b.endTime).getTime()
      );

      // 1. Check if already booked
      if (overlappingBooking) {
        return { ...slot, status: 'booked', booking: overlappingBooking };
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

    // Force no caching at all levels (browser, CDN, edge)
    return NextResponse.json(uniqueSlots, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create availability slots (Deprecated - Now completely dynamic but maintained to prevent frontend errors)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "stable_owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({ success: true, count: 0 });
  } catch (error) {
    console.error("Error creating slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
