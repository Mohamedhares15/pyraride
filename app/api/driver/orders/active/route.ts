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
    const activeOrders = await prisma.packageBooking.findMany({
      where: {
        driverId: session.user.id,
        driverStatus: {
          notIn: ["completed", "pending"] // Anything active: assigned, in_transit, arrived
        },
        status: {
          notIn: ["cancelled"]
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
        date: "asc"
      }
    });

    return NextResponse.json(activeOrders);
  } catch (error) {
    console.error("Failed to fetch active driver orders", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
