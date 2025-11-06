import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Always fetch fresh data

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stable = await prisma.stable.findUnique({
      where: { id: params.id },
      include: {
        horses: {
          where: { isActive: true },
        },
      },
    });

    if (!stable) {
      return NextResponse.json(
        { error: "Stable not found" },
        { status: 404 }
      );
    }

    // Get bookings for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const bookings = await prisma.booking.findMany({
      where: {
        stableId: params.id,
        status: {
          in: ["confirmed", "pending"],
        },
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        horseId: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // Group bookings by date and horse
    const slots: Record<string, Record<string, any[]>> = {};

    bookings.forEach((booking) => {
      const dateKey = booking.startTime.toISOString().split("T")[0];
      if (!slots[dateKey]) {
        slots[dateKey] = {};
      }
      if (!slots[dateKey][booking.horseId]) {
        slots[dateKey][booking.horseId] = [];
      }
      slots[dateKey][booking.horseId].push({
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      });
    });

    // Generate available time slots (9 AM - 5 PM, hourly)
    const availableSlots: Record<string, string[]> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      
      const times = [];
      for (let hour = 9; hour < 17; hour++) {
        times.push(`${hour.toString().padStart(2, "0")}:00`);
      }
      availableSlots[dateKey] = times;
    }

    return NextResponse.json({
      takenSlots: slots,
      availableSlots,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

