import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch availability slots for a stable
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

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        stableId: params.id,
        date: new Date(date),
        ...(horseId && horseId !== "all" ? { horseId } : {}),
        isBooked: false,
      },
      orderBy: {
        startTime: "asc",
      },
    });

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

    let current = new Date(start);
    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd <= end) {
        slots.push({
          stableId: params.id,
          horseId: horseId || null,
          date: new Date(date),
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
