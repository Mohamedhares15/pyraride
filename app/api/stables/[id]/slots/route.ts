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
  horseIdFilter: string | null
): any[] {
  const amHours = [5, 7, 8, 9, 10];
  const pmHours = [15, 16, 17];
  const desiredHours = [...amHours, ...pmHours];
  // Egypt offset is typically +2 hours from UTC. 
  // We want the slots generated in UTC to represent the exact hour strings in Egypt.
  // The safest way is to generate strings localized to Egypt time, or use Date.UTC adjusted for Egypt's offset.
  // Instead of guessing DST, let's create string representations:
  const offset = 2; // Egypt is UTC+2
  const slots: any[] = [];
  const y = queryDate.getFullYear();
  const m = queryDate.getMonth();
  const d = queryDate.getDate();

  for (const horse of horses) {
    if (horseIdFilter && horseIdFilter !== "all" && horse.id !== horseIdFilter) continue;
    for (const hour of desiredHours) {
      // Create a date object that corresponds to 'hour' in Egypt Time.
      // E.g. if hour is 10, we want 10 AM Egypt time, which is 8 AM UTC.
      const utcHour = hour - offset; 
      const start = new Date(Date.UTC(y, m, d, utcHour, 0, 0));
      const end = new Date(Date.UTC(y, m, d, utcHour + 1, 0, 0));
      slots.push({ id: `v-slot-${horse.id}-${start.getTime()}`, stableId: queryDate.toString(), horseId: horse.id, date: queryDate, startTime: start, endTime: end, booking: null });
    }
  }

  const processedSlots = slots.map((slot) => {
    const overlappingBooking = bookings.find(
      (b) => b.horseId === slot.horseId &&
        new Date(slot.startTime).getTime() >= new Date(b.startTime).getTime() &&
        new Date(slot.startTime).getTime() < new Date(b.endTime).getTime()
    );
    if (overlappingBooking) return { ...slot, status: "booked", booking: overlappingBooking };
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

    const [horses, stable, bookings] = await Promise.all([
      prisma.horse.findMany({ where: { stableId: params.id, isActive: true }, select: { id: true, name: true } }),
      prisma.stable.findUnique({ where: { id: params.id }, select: { minLeadTimeHours: true } }),
      prisma.booking.findMany({
        where: { stableId: params.id, startTime: { gte: startOfDay, lte: endOfRange }, status: { not: "cancelled" } },
        select: { id: true, horseId: true, startTime: true, endTime: true, status: true, rider: { select: { fullName: true, email: true } } },
      }),
    ]);

    const endOfToday = new Date(queryDate);
    endOfToday.setHours(23, 59, 59, 999);
    const todayBookings = bookings.filter((b) => new Date(b.startTime) <= endOfToday);
    const tomorrowBookings = tomorrowDate ? bookings.filter((b) => new Date(b.startTime) > endOfToday) : [];

    const todaySlots = processDateSlots(horses, queryDate, todayBookings, horseId);
    const tomorrowSlots = includeTomorrow && tomorrowDate ? processDateSlots(horses, tomorrowDate, tomorrowBookings, horseId) : null;

    const responseData = includeTomorrow ? { today: todaySlots, tomorrow: tomorrowSlots } : todaySlots;

    // NO CACHING — slots must always reflect real booking state
    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "stable_owner") return new NextResponse("Unauthorized", { status: 401 });
    return NextResponse.json({ success: true, count: 0 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
