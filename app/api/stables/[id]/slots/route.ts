import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    // Check if any slots exist for this stable on this date
    const existingSlotsCount = await prisma.availabilitySlot.count({
      where: {
        stableId: params.id,
        date: queryDate,
      },
    });

    if (existingSlotsCount === 0) {
      // Fetch all active horses
      const horses = await prisma.horse.findMany({
        where: { stableId: params.id, isActive: true },
      });

      const newSlots = [];
      for (const horse of horses) {
        // 7:00 AM Slot (Egypt Time UTC+2) -> 5:00 AM Server Time
        const start7 = new Date(queryDate);
        start7.setHours(5, 0, 0, 0);
        const end7 = new Date(queryDate);
        end7.setHours(6, 0, 0, 0); // 1 hour duration default

        newSlots.push({
          stableId: params.id,
          horseId: horse.id,
          date: queryDate,
          startTime: start7,
          endTime: end7,
        });

        // 3:00 PM Slot (15:00 Egypt Time UTC+2) -> 1:00 PM (13:00) Server Time
        const start3 = new Date(queryDate);
        start3.setHours(13, 0, 0, 0);
        const end3 = new Date(queryDate);
        end3.setHours(14, 0, 0, 0);

        newSlots.push({
          stableId: params.id,
          horseId: horse.id,
          date: queryDate,
          startTime: start3,
          endTime: end3,
        });
      }

      if (newSlots.length > 0) {
        await prisma.availabilitySlot.createMany({
          data: newSlots,
        });
        console.log(`[GET /api/stables/${params.id}/slots] Auto-generated ${newSlots.length} slots for ${horses.length} horses`);
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

    // 2. Horse Welfare Logic
    // Filter out available slots if the horse already has a booking in the same session (AM/PM)
    // AM: < 12:00, PM: >= 12:00

    // Track booked sessions per horse
    const horseBookings = new Map<string, { am: boolean; pm: boolean }>();

    // First pass: Identify booked sessions
    slots.forEach(slot => {
      if (!slot.horseId) return; // Skip if no horseId

      // Check if booked and NOT cancelled
      if (slot.booking && !slot.booking.cancelledBy) {
        const hour = new Date(slot.startTime).getHours();
        const isAm = hour < 12;

        const current = horseBookings.get(slot.horseId) || { am: false, pm: false };
        if (isAm) current.am = true;
        else current.pm = true;

        horseBookings.set(slot.horseId, current);
      }
    });

    // Second pass: Filter slots
    const filteredSlots = slots.filter(slot => {
      if (!slot.horseId) return true; // Keep slots without horseId (stable-wide?)

      // Always keep booked slots (so they show as booked)
      if (slot.booking && !slot.booking.cancelledBy) {
        return true;
      }

      const hour = new Date(slot.startTime).getHours();
      const isAm = hour < 12;
      const horseStatus = horseBookings.get(slot.horseId);

      // If horse has no bookings, keep slot
      if (!horseStatus) return true;

      // If slot is AM and horse already has AM booking, hide this available slot
      if (isAm && horseStatus.am) return false;

      // If slot is PM and horse already has PM booking, hide this available slot
      if (!isAm && horseStatus.pm) return false;

      return true;
    });

    console.log(`[GET /api/stables/${params.id}/slots] Found ${slots.length} slots, returning ${filteredSlots.length} after welfare filtering`);
    return NextResponse.json(filteredSlots);
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
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Parse date string same way as GET endpoint - use local time to match GET query
    const [year, month, day] = date.split('-').map(Number);

    // Validate parsed date
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return NextResponse.json(
        { error: "Invalid date values" },
        { status: 400 }
      );
    }

    // Create date at local midnight - same as GET endpoint
    const slotDate = new Date(year, month - 1, day);
    slotDate.setHours(0, 0, 0, 0); // Ensure it's at midnight

    console.log(`[POST /api/stables/${params.id}/slots] Date string: ${date}, Parsed date: ${slotDate.toISOString()}`);

    // Parse times - validate format HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Expected HH:MM in 24-hour format" },
        { status: 400 }
      );
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Validate time values
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      return NextResponse.json(
        { error: "Invalid time values" },
        { status: 400 }
      );
    }

    // Create start and end datetimes - handle timezone correctly
    // We want to store the time such that when the client (in their timezone) reads it, it matches what they selected.
    // Example: Client in Egypt (UTC+2) selects 3:00. timezoneOffset is -120.
    // We want stored UTC to be 1:00.
    // Date.UTC(..., 3, 0) is 3:00 UTC.
    // 3:00 UTC + (-120 * 60000) = 3:00 - 2h = 1:00 UTC. Correct.

    let start: Date;
    let end: Date;

    if (timezoneOffset !== undefined) {
      const userOffsetMs = timezoneOffset * 60000;
      // Add the offset (which is negative for East of UTC) to go "back" to UTC
      start = new Date(Date.UTC(year, month - 1, day, startHour, startMinute, 0, 0) + userOffsetMs);
      end = new Date(Date.UTC(year, month - 1, day, endHour, endMinute, 0, 0) + userOffsetMs);
    } else {
      // Fallback to server local time if offset not provided
      start = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
      end = new Date(year, month - 1, day, endHour, endMinute, 0, 0);
    }

    // Validate that start is before end
    if (start >= end) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    console.log(`[POST /api/stables/${params.id}/slots] Start: ${start.toISOString()}, End: ${end.toISOString()}, Duration: ${duration} minutes`);

    // Generate slots based on duration
    const slots = [];
    let current = new Date(start);

    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);

      // Only create slot if it fits within the end time
      if (slotEnd <= end) {
        slots.push({
          stableId: params.id,
          horseId: horseId || null,
          date: slotDate,
          startTime: new Date(current),
          endTime: new Date(slotEnd),
        });
      }
      current = slotEnd;
    }

    console.log(`[POST /api/stables/${params.id}/slots] Generated ${slots.length} slots to create`);

    if (slots.length === 0) {
      return NextResponse.json(
        {
          message: "No slots created. Check that startTime is before endTime and duration fits within the time range.",
          count: 0,
        },
        { status: 400 }
      );
    }

    // Check for existing slots first to avoid duplicates
    // Query all slots for this date/horse combination
    const existingSlots = await prisma.availabilitySlot.findMany({
      where: {
        stableId: params.id,
        date: slotDate,
        horseId: horseId || null,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Create a set of existing slot start times for quick lookup
    // Use timestamp comparison (milliseconds since epoch) for accuracy
    const existingStartTimes = new Set(
      existingSlots.map(slot => {
        const start = new Date(slot.startTime);
        // Round to nearest minute to handle any millisecond differences
        return Math.floor(start.getTime() / 60000) * 60000;
      })
    );

    // Filter out slots that already exist
    const slotsToCreate = slots.filter(slot => {
      const slotStartTime = Math.floor(slot.startTime.getTime() / 60000) * 60000;
      return !existingStartTimes.has(slotStartTime);
    });

    console.log(`[POST /api/stables/${params.id}/slots] ${slotsToCreate.length} new slots to create (${slots.length - slotsToCreate.length} already exist)`);

    if (slotsToCreate.length === 0) {
      return NextResponse.json(
        {
          message: `All ${slots.length} slots already exist`,
          count: 0,
          skipped: slots.length,
        },
        { status: 200 }
      );
    }

    // Create new slots using createMany for better performance
    let created;
    try {
      created = await prisma.availabilitySlot.createMany({
        data: slotsToCreate,
        skipDuplicates: true, // Extra safety in case of race conditions
      });
    } catch (error: any) {
      console.error(`[POST /api/stables/${params.id}/slots] Error in createMany:`, error);
      // Fallback to individual creates if createMany fails
      let createdCount = 0;
      for (const slotData of slotsToCreate) {
        try {
          await prisma.availabilitySlot.create({ data: slotData });
          createdCount++;
        } catch (err: any) {
          console.error(`[POST /api/stables/${params.id}/slots] Error creating individual slot:`, err?.message);
        }
      }
      created = { count: createdCount };
    }

    const createdCount = created.count;
    const skippedCount = slots.length - slotsToCreate.length;

    console.log(`[POST /api/stables/${params.id}/slots] Created ${createdCount} slots, skipped ${skippedCount} duplicates out of ${slots.length} attempted`);

    return NextResponse.json({
      message: `Created ${createdCount} availability slot${createdCount !== 1 ? 's' : ''}${skippedCount > 0 ? ` (${skippedCount} already existed)` : ''}`,
      count: createdCount,
      skipped: skippedCount,
    });
  } catch (error: any) {
    console.error("Error creating availability slots:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json(
      {
        error: "Failed to create slots",
        message: error?.message || "Internal server error",
        details: error?.meta,
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove availability slots
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "stable_owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("slotId");

    if (!slotId) {
      return new NextResponse("Slot ID required", { status: 400 });
    }

    await prisma.availabilitySlot.delete({
      where: { id: slotId, stableId: params.id },
    });

    return NextResponse.json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
