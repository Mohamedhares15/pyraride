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

    const [upcoming, past, stats] = await Promise.all([
      prisma.packageBooking.findMany({
        where: {
          date: { gte: today },
          status: { not: "cancelled" }
        },
        include: {
          package: {
            select: {
              title: true,
              duration: true,
              stable: { select: { name: true, address: true } }
            }
          },
          rider: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImageUrl: true
            }
          },
          driver: {
            select: { fullName: true, email: true, phoneNumber: true }
          }
        },
        orderBy: { date: "asc" },
        take: 100
      }),

      prisma.packageBooking.findMany({
        where: {
          OR: [
            { date: { lt: today } },
            { status: "cancelled" }
          ]
        },
        include: {
          package: {
            select: {
              title: true,
              duration: true,
              stable: { select: { name: true, address: true } }
            }
          },
          rider: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImageUrl: true
            }
          },
          driver: {
            select: { fullName: true, email: true, phoneNumber: true }
          }
        },
        orderBy: { date: "desc" },
        take: 100
      }),

      prisma.packageBooking.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { totalPrice: true }
      })
    ]);

    const statMap = Object.fromEntries(
      stats.map(s => [s.status, { count: s._count.status, revenue: s._sum.totalPrice }])
    );

    const formattedStats = {
      upcoming: upcoming.length,
      confirmed: statMap['confirmed']?.count ?? 0,
      completed: statMap['completed']?.count ?? 0,
      cancelled: statMap['cancelled']?.count ?? 0,
      totalRevenue: Object.entries(statMap)
        .filter(([key]) => key !== 'cancelled')
        .reduce((sum, [, s]: [string, any]) => sum + parseFloat(s.revenue?.toString() ?? '0'), 0)
    };

    return NextResponse.json({ upcoming, past, stats: formattedStats });
  } catch (error) {
    console.error("Failed to fetch admin bookings", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
