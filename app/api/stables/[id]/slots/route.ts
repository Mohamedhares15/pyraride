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

    console.log(`[GET /api/stables/${params.id}/slots] Found ${slots.length} slots`);
    return NextResponse.json(slots);
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
    } = await req.json();

    if (!date || !startTime || !endTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate slots based on duration
    const slots = [];
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    // Parse date string same way as GET endpoint
    const [year, month, day] = date.split('-').map(Number);
    const slotDate = new Date(year, month - 1, day);

    console.log(`[POST /api/stables/${params.id}/slots] Date string: ${date}, Created Date object: ${slotDate.toISOString()}`);

    let current = new Date(start);
    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
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

    // Create all slots
    const created = await prisma.availabilitySlot.createMany({
      data: slots,
    });

    return NextResponse.json({
      message: `Created ${created.count} availability slots`,
      count: created.count,
    });
  } catch (error) {
    console.error("Error creating availability slots:", error);
    return new NextResponse("Internal Error", { status: 500 });
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
