import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await prisma.packageBooking.findMany({
      include: {
        package: {
          include: {
            stable: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
        rider: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImageUrl: true,
          },
        },
        driver: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const upcoming = bookings.filter(
      (b) => new Date(b.date) >= today && b.status !== "cancelled"
    );
    const past = bookings.filter(
      (b) => new Date(b.date) < today || b.status === "cancelled"
    );

    const stats = {
      total: bookings.length,
      upcoming: upcoming.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      withTransport: bookings.filter((b) => b.transportationZone).length,
      totalRevenue: bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + parseFloat(b.totalPrice.toString()), 0),
    };

    return NextResponse.json({ bookings, upcoming, past, stats });
  } catch (error) {
    console.error("Failed to fetch admin bookings", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
