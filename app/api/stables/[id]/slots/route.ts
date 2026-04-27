import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function processDateSlots(
  horses: { id: string; name: string }[],
  queryDate: Date,
  bookings: any[],
  blockedSlots: any[],
  horseIdFilter: string | null
): any[] {
  const amHours = [7, 8, 9, 10, 11];
  const pmHours = [15, 16, 17];
  const desiredHours = [...amHours, ...pmHours];
  const offset = 3; // Egypt UTC+3
  const slots: any[] = [];
  const y = queryDate.getFullYear();
  const m = queryDate.getMonth();
  const d = queryDate.getDate();

  for (const horse of horses) {
    if (horseIdFilter && horseIdFilter !== "all" && horse.id !== horseIdFilter) continue;
    for (const hour of desiredHours) {
      const utcHour = hour - offset;
      const start = new Date(Date.UTC(y, m, d, utcHour, 0, 0));
      const end = new Date(Date.UTC(y, m, d, utcHour + 1, 0, 0));
      slots.push({ id: `v-slot-${horse.id}-${start.getTime()}`, stableId: queryDate.toString(), horseId: horse.id, date: queryDate, startTime: start, endTime: end, booking: null });
    }
  }

  const processedSlots = slots.map((slot) => {
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();

    // 1. Check owner-blocked slots first
    const ownerBlocked = blockedSlots.find(
      (b) => b.horseId === slot.horseId &&
        new Date(b.startTime).getTime() <= slotStart &&
        new Date(b.endTime).getTime() >= slotEnd
    );
    if (ownerBlocked) return { ...slot, status: "blocked", blockedSlotId: ownerBlocked.id };

    // 2. Check bookings
    const overlappingBooking = bookings.find(
      (b) => b.horseId === slot.horseId &&
        slotStart >= new Date(b.startTime).getTime() &&
        slotStart < new Date(b.endTime).getTime()
    );
    if (overlappingBooking) return { ...slot, status: "booked", booking: overlappingBooking };

    // 3. Session limit logic
    if (slot.horseId) {
      const horseBookingsList = bookings.filter((b) => b.horseId === slot.horseId);
      const hour = new Date(slot.startTime).getHours();
      const isAm = hour < 12;
      const amCount = horseBookingsList.filter((b) => new Date(b.startTime).getHours() < 12).length;
      const pmCount = horseBookingsList.filter((b) => new Date(b.startTime).getHours() >= 12).length;
      if (isAm && amCount >= 2) return { ...slot, status: "blocked_session" };
      if (!isAm && pmCount >= 1) return { ...slot, status: "blocked_session" };
    }
    return { ...slot, status: "available" };
  });

  const uniqueMap = new Map<string, (typeof processedSlots)[0]>();
  processedSlots.forEach((slot) => {
    if (!slot.horseId) return;
    const key = `${slot.horseId}-${new Date(slot.startTime).toISOString()}`;
    if (uniqueMap.has(key)) {
      const existing = uniqueMap.get(key)!;
      if (existing.status === "available" && slot.status !== "available") uniqueMap.set(key, slot);
    } else {
      uniqueMap.set(key, slot);
    }
  });

  return Array.from(uniqueMap.values());
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const horseId = searchParams.get("horseId") || null;
    const includeTomorrow = searchParams.get("includeTomorrow") === "true";

    if (!dateStr) return new NextResponse("Date is required", { status: 400 });

    const [year, month, day] = dateStr.split("-").map(Number);
    const queryDate = new Date(year, month - 1, day);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const tomorrowDate = includeTomorrow ? new Date(queryDate) : null;
    if (tomorrowDate) tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const endOfRange = tomorrowDate
      ? new Date(new Date(tomorrowDate).setHours(23, 59, 59, 999))
      : new Date(new Date(queryDate).setHours(23, 59, 59, 999));

    const [horses, bookings, blockedSlotRecords] = await Promise.all([
      prisma.horse.findMany({ where: { stableId: params.id, isActive: true }, select: { id: true, name: true } }),
      prisma.booking.findMany({
        where: { stableId: params.id, startTime: { gte: startOfDay, lte: endOfRange }, status: { not: "cancelled" } },
        select: { id: true, horseId: true, startTime: true, endTime: true, status: true, rider: { select: { fullName: true, email: true } } },
      }),
      prisma.blockedSlot.findMany({
        where: { stableId: params.id, startTime: { gte: startOfDay, lte: endOfRange } },
        select: { id: true, horseId: true, startTime: true, endTime: true, reason: true },
      }),
    ]);

    const endOfToday = new Date(queryDate);
    endOfToday.setHours(23, 59, 59, 999);
    const todayBookings = bookings.filter((b) => new Date(b.startTime) <= endOfToday);
    const tomorrowBookings = tomorrowDate ? bookings.filter((b) => new Date(b.startTime) > endOfToday) : [];
    const todayBlocked = blockedSlotRecords.filter((b) => new Date(b.startTime) <= endOfToday);
    const tomorrowBlocked = tomorrowDate ? blockedSlotRecords.filter((b) => new Date(b.startTime) > endOfToday) : [];

    const todaySlots = processDateSlots(horses, queryDate, todayBookings, todayBlocked, horseId);
    const tomorrowSlots = includeTomorrow && tomorrowDate ? processDateSlots(horses, tomorrowDate, tomorrowBookings, tomorrowBlocked, horseId) : null;

    const responseData = includeTomorrow ? { today: todaySlots, tomorrow: tomorrowSlots } : todaySlots;

    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" },
    });
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: toggle block/unblock an individual slot (stable owner only)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "stable_owner" && session.user.role !== "admin")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify ownership
    if (session.user.role !== "admin") {
      const stable = await prisma.stable.findUnique({ where: { id: params.id }, select: { ownerId: true } });
      if (!stable || stable.ownerId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const body = await req.json();
    const { horseId, startTime, endTime } = body; // ISO strings

    if (!horseId || !startTime || !endTime) {
      return new NextResponse("horseId, startTime, endTime required", { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // If already blocked → UNBLOCK (delete)
    const existing = await prisma.blockedSlot.findFirst({
      where: { stableId: params.id, horseId, startTime: start, endTime: end },
    });

    if (existing) {
      await prisma.blockedSlot.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "unblocked" });
    }

    // Block the slot
    await prisma.blockedSlot.create({
      data: { stableId: params.id, horseId, startTime: start, endTime: end, reason: "owner_block" },
    });

    return NextResponse.json({ action: "blocked" });
  } catch (error) {
    console.error("Error toggling slot:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
