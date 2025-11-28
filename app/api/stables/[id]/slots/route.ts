import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const horseId = searchParams.get("horseId");

    if (!date) {
      return new NextResponse("Date is required", { status: 400 });
    }

    const stableId = params.id;
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
    const now = new Date();

    // Fetch stable settings (lead time)
    const stable = await prisma.stable.findUnique({
      where: { id: stableId },
      select: { minLeadTimeHours: true },
    });

    const minLeadTimeHours = stable?.minLeadTimeHours || 8; // Default 8 hours
    const minBookingTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);

    // Fetch confirmed bookings for this stable on this date
    const bookings = await prisma.booking.findMany({
      where: {
        stableId,
        status: "confirmed",
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(horseId ? { horseId } : {}), // Filter by horse if provided
      },
      select: {
        startTime: true,
        endTime: true,
        horseId: true,
      },
    });

    // Fetch blocked slots
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        stableId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        OR: [
          { horseId: null }, // Blocks entire stable
          ...(horseId ? [{ horseId }] : []), // Blocks specific horse
        ],
      },
      select: {
        startTime: true,
        endTime: true,
        horseId: true,
      },
    });

    // Define operating hours (e.g., 8 AM to 6 PM) - This could be dynamic later
    const operatingHours = { start: 8, end: 18 };
    const slots = [];

    for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
      const slotStart = new Date(startOfDay);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(startOfDay);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check lead time
      if (slotStart < minBookingTime) {
        continue; // Skip if within lead time
      }

      // Check if slot is taken by a booking
      const isBooked = bookings.some((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        // Check overlap
        return (
          (horseId ? booking.horseId === horseId : true) && // If checking specific horse, match ID
          bookingStart < slotEnd &&
          bookingEnd > slotStart
        );
      });

      // Check if slot is blocked by owner
      const isBlocked = blockedSlots.some((block) => {
        const blockStart = new Date(block.startTime);
        const blockEnd = new Date(block.endTime);
        return blockStart < slotEnd && blockEnd > slotStart;
      });

      if (!isBooked && !isBlocked) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true,
        });
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
