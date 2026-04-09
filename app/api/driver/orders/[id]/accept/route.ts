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

    // Check if the order is already accepted by someone else
    const existing = await prisma.packageBooking.findUnique({
      where: { id: bookingId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existing.driverId !== null) {
      return NextResponse.json({ error: "This ride was already claimed by another driver." }, { status: 400 });
    }

    if (existing.status === "cancelled") {
      return NextResponse.json({ error: "This booking was cancelled." }, { status: 400 });
    }

    // Atomic update to claim lock
    const updatedBooking = await prisma.packageBooking.update({
      where: {
        id: bookingId,
        driverId: null // Atomic concurrency check ensuring it hasn't been sniped in the last ms
      },
      data: {
        driverId: session.user.id,
        driverStatus: "assigned"
      }
    });

    // Notify Rider
    await prisma.notification.create({
      data: {
        userId: updatedBooking.riderId,
        type: "driver_assigned",
        title: "Your Driver is Assigned!",
        message: `A driver has been assigned for your transport to ${existing.transportationZone}.`,
        data: { packageBookingId: updatedBooking.id }
      }
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error("Failed to accept driver order", error);
    if (error.code === 'P2025') {
       // Prisma concurrency lock miss (Record to update not found)
       return NextResponse.json({ error: "This ride was already claimed by another driver." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
