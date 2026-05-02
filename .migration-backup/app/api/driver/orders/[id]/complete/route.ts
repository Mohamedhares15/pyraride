import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "driver") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const bookingId = params.id;

    // Check if the order is already accepted by this driver
    const existing = await prisma.packageBooking.findUnique({
      where: { id: bookingId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existing.driverId !== session.user.id) {
      return NextResponse.json({ error: "You are not assigned to this ride." }, { status: 403 });
    }

    const updatedBooking = await prisma.packageBooking.update({
      where: {
        id: bookingId
      },
      data: {
        driverStatus: "completed"
      }
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error("Failed to complete driver order", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
