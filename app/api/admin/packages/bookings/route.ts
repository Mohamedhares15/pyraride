import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.packageBooking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        package: {
          select: {
            title: true,
            packageType: true,
            hasTransportation: true,
          },
        },
        rider: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching admin package bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch package bookings" },
      { status: 500 }
    );
  }
}
