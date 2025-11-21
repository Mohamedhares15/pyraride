import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = session.user.role;
    const userId = session.user.id;

    // Get date range (default: last 30 days)
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Analytics data structure
    let analytics = {};

    if (role === "admin") {
      // Admin analytics - platform-wide
      const [
        totalUsers,
        totalStables,
        totalBookings,
        totalRevenue,
        completedBookings,
        bookingsByStatus,
        bookingsByMonth,
        topStables,
        revenueByMonth,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.stable.count({ where: { status: "approved" } }),
        prisma.booking.count({
          where: {
            createdAt: { gte: startDate },
          },
        }),
        prisma.booking.aggregate({
          where: {
            createdAt: { gte: startDate },
            status: "completed",
          },
          _sum: {
            totalPrice: true,
          },
        }),
        prisma.booking.count({
          where: {
            createdAt: { gte: startDate },
            status: "completed",
          },
        }),
        prisma.booking.groupBy({
          by: ["status"],
          where: {
            createdAt: { gte: startDate },
          },
          _count: true,
        }),
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*) as count
          FROM "Booking"
          WHERE "createdAt" >= ${startDate}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month
        ` as any,
        prisma.booking.groupBy({
          by: ["stableId"],
          where: {
            createdAt: { gte: startDate },
          },
          _count: true,
          _sum: {
            totalPrice: true,
          },
          orderBy: {
            _count: {
              id: "desc",
            },
          },
          take: 5,
        }),
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            SUM("totalPrice") as revenue
          FROM "Booking"
          WHERE "createdAt" >= ${startDate} AND status = 'completed'
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month
        ` as any,
      ]);

      // Calculate platform commission (15% of total revenue)
      const totalRevenueValue = parseFloat(totalRevenue._sum.totalPrice?.toString() || "0");
      const platformCommission = totalRevenueValue * 0.15;
      const cancellations = await prisma.booking.count({
        where: {
          createdAt: { gte: startDate },
          status: "cancelled",
        },
      });
      const cancellationRate = totalBookings > 0 
        ? ((cancellations / totalBookings) * 100).toFixed(1) + "%"
        : "0%";

      analytics = {
        overview: {
          totalUsers,
          totalStables,
          totalBookings,
          totalRevenue: totalRevenueValue,
          completedBookings,
          platformCommission,
          cancellationRate,
        },
        bookingsByStatus,
        bookingsByMonth,
        topStables: await Promise.all(
          topStables.map(async (stable: any) => ({
            ...stable,
            stable: await prisma.stable.findUnique({
              where: { id: stable.stableId },
              select: { name: true, location: true },
            }),
          }))
        ),
        revenueByMonth,
      };
    } else if (role === "stable_owner") {
      // Stable owner analytics
      const stable = await prisma.stable.findUnique({
        where: { ownerId: userId },
      });

      if (!stable) {
        return NextResponse.json(
          { 
            error: "Stable not found. Please create and get your stable approved first.",
            analytics: null 
          },
          { status: 404 }
        );
      }

      const [
        totalBookings,
        completedBookings,
        totalEarnings,
        bookingsByMonth,
        revenueByMonth,
        cancellations,
        avgRating,
      ] = await Promise.all([
        prisma.booking.count({
          where: {
            stableId: stable.id,
            createdAt: { gte: startDate },
          },
        }),
        prisma.booking.count({
          where: {
            stableId: stable.id,
            status: "completed",
            createdAt: { gte: startDate },
          },
        }),
        prisma.booking.aggregate({
          where: {
            stableId: stable.id,
            status: "completed",
            createdAt: { gte: startDate },
          },
          _sum: {
            totalPrice: true,
            commission: true,
          },
        }),
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*) as count
          FROM "Booking"
          WHERE "stableId" = ${stable.id} AND "createdAt" >= ${startDate}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month
        ` as any,
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            SUM("totalPrice" - "commission") as revenue
          FROM "Booking"
          WHERE "stableId" = ${stable.id} AND "createdAt" >= ${startDate} AND status = 'completed'
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month
        ` as any,
        prisma.booking.count({
          where: {
            stableId: stable.id,
            status: "cancelled",
            createdAt: { gte: startDate },
          },
        }),
        prisma.review.aggregate({
          where: {
            stableId: stable.id,
          },
          _avg: {
            stableRating: true,
            horseRating: true,
          },
        }),
      ]);

      const netEarnings = totalEarnings._sum.totalPrice
        ? parseFloat(totalEarnings._sum.totalPrice.toString()) -
          parseFloat(totalEarnings._sum.commission?.toString() || "0")
        : 0;

      analytics = {
        stable: {
          name: stable.name,
          location: stable.location,
        },
        overview: {
          totalBookings,
          completedBookings,
          cancellationRate: totalBookings > 0 
            ? (cancellations / totalBookings * 100).toFixed(1) 
            : "0",
          netEarnings,
          platformCommission: totalEarnings._sum.commission || 0,
        },
        ratings: {
          averageStableRating: avgRating._avg.stableRating || 0,
          averageHorseRating: avgRating._avg.horseRating || 0,
          totalReviews: await prisma.review.count({
            where: { stableId: stable.id },
          }),
        },
        bookingsByMonth,
        revenueByMonth,
      };
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

