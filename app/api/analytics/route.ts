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

      // Average Order Value (AOV) = Total Revenue / Total Bookings
      const aov = completedBookings > 0 ? totalRevenueValue / completedBookings : 0;

      // Customer Lifetime Value (CLV) - Average revenue per user
      const clv = totalUsers > 0 ? totalRevenueValue / totalUsers : 0;

      // Lead Time - Average days between booking creation and ride date
      let avgLeadTime = 0;
      try {
        const bookingsWithLeadTime = await prisma.$queryRaw`
          SELECT AVG(EXTRACT(DAY FROM ("startTime" - "createdAt"))) as avg_lead_time
          FROM "Booking"
          WHERE "createdAt" >= ${startDate}
        ` as any;
        avgLeadTime = bookingsWithLeadTime[0]?.avg_lead_time || 0;
      } catch (e) {
        console.error("Error calculating lead time:", e);
      }

      // Peak Booking Times - Group by day of week and hour
      let peakTimes: any[] = [];
      try {
        peakTimes = await prisma.$queryRaw`
          SELECT 
            EXTRACT(DOW FROM "startTime") as day_of_week,
            EXTRACT(HOUR FROM "startTime") as hour,
            COUNT(*) as booking_count
          FROM "Booking"
          WHERE "createdAt" >= ${startDate}
          GROUP BY EXTRACT(DOW FROM "startTime"), EXTRACT(HOUR FROM "startTime")
          ORDER BY booking_count DESC
          LIMIT 10
        ` as any;
      } catch (e) {
        console.error("Error calculating peak times:", e);
      }

      // Customer Segmentation - New vs Returning riders
      const newRiders = await prisma.user.count({
        where: {
          role: "rider",
          createdAt: { gte: startDate },
        },
      });
      let returningRiders: any[] = [{ count: "0" }];
      try {
        returningRiders = await prisma.$queryRaw`
          SELECT COUNT(DISTINCT "riderId") as count
          FROM "Booking"
          WHERE "riderId" IN (
            SELECT "riderId"
            FROM "Booking"
            GROUP BY "riderId"
            HAVING COUNT(*) > 1
          ) AND "createdAt" >= ${startDate}
        ` as any;
      } catch (e) {
        console.error("Error calculating returning riders:", e);
      }

      // Horse Utilization Rate
      let horseUtilization: any[] = [];
      try {
        horseUtilization = await prisma.$queryRaw`
          SELECT 
            h.id,
            h.name,
            COUNT(b.id) as bookings,
            s.name as stable_name
          FROM "Horse" h
          LEFT JOIN "Booking" b ON h.id = b."horseId" AND b."createdAt" >= ${startDate}
          LEFT JOIN "Stable" s ON h."stableId" = s.id
          GROUP BY h.id, h.name, s.name
          ORDER BY bookings DESC
          LIMIT 10
        ` as any;
      } catch (e) {
        console.error("Error calculating horse utilization:", e);
      }

      // Average Ratings
      let avgRatings = { _avg: { stableRating: 0, horseRating: 0 } };
      try {
        avgRatings = await prisma.review.aggregate({
          where: {
            createdAt: { gte: startDate },
          },
          _avg: {
            stableRating: true,
            horseRating: true,
          },
        });
      } catch (e) {
        console.error("Error calculating average ratings:", e);
      }

      // Booking by Experience Level
      let beginners = 0, intermediate = 0, advanced = 0;
      try {
        const experienceSegmentation = await prisma.booking.groupBy({
          by: ["riderId"],
          where: {
            createdAt: { gte: startDate },
          },
          _count: true,
        });

        // Convert to new/intermediate/advanced based on booking count
        experienceSegmentation.forEach((seg: any) => {
          if (seg._count === 1) beginners++;
          else if (seg._count <= 5) intermediate++;
          else advanced++;
        });
      } catch (e) {
        console.error("Error calculating experience segmentation:", e);
      }

      analytics = {
        overview: {
          totalUsers,
          totalStables,
          totalBookings,
          totalRevenue: totalRevenueValue,
          completedBookings,
          platformCommission,
          cancellationRate,
          aov,
          clv,
          avgLeadTime: parseFloat(avgLeadTime).toFixed(1),
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
        peakTimes,
        customerSegmentation: {
          newRiders,
          returningRiders: parseInt(returningRiders[0]?.count || "0"),
          byExperience: {
            beginners,
            intermediate,
            advanced,
          },
        },
        horseUtilization,
        customerFeedback: {
          avgStableRating: avgRatings._avg.stableRating || 0,
          avgHorseRating: avgRatings._avg.horseRating || 0,
          totalReviews: totalBookings > 0 ? await prisma.review.count({
            where: { createdAt: { gte: startDate } },
          }).catch(() => 0) : 0,
        },
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

