import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "driver") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    // We only want packages that HAVE transportation configured, where driverId is null, and status isn't cancelled
    const unassignedOrders = await prisma.packageBooking.findMany({
      where: {
        driverId: null,
        status: {
          notIn: ["cancelled"]
        },
        transportationZone: {
          not: null
        }
      },
      include: {
        package: {
          include: {
            stable: true
          }
        },
        rider: {
          select: {
            fullName: true,
            phoneNumber: true,
            profileImageUrl: true,
          }
        }
      },
      orderBy: {
        date: "asc" // Closest bookings first
      }
    });

    return NextResponse.json(unassignedOrders);
  } catch (error) {
    console.error("Failed to fetch available driver orders", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
