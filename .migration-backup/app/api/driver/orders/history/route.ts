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
    const completedOrders = await prisma.packageBooking.findMany({
      where: {
        driverId: session.user.id,
        driverStatus: "completed",
      },
      include: {
        package: {
          include: {
            stable: true,
          },
        },
        rider: {
          select: {
            fullName: true,
            phoneNumber: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(completedOrders);
  } catch (error) {
    console.error("Failed to fetch driver history", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
