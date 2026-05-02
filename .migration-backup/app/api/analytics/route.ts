import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper function to safely convert month/date values returned from SQL queries
function serializeMonthlyData(data: any[] = []) {
  return data.map((item) => {
    let monthValue = item.month;

    if (monthValue instanceof Date) {
      monthValue = monthValue.toISOString();
    } else if (
      monthValue &&
      typeof monthValue === "object" &&
      "toISOString" in monthValue
    ) {
      monthValue = new Date(monthValue as any).toISOString();
    } else if (typeof monthValue === "string") {
      const parsed = new Date(monthValue);
      monthValue = isNaN(parsed.getTime())
        ? new Date().toISOString()
        : parsed.toISOString();
    } else {
      monthValue = new Date().toISOString();
    }

    return {
      ...item,
      month: monthValue,
    };
  });
}

// Helper function to convert BigInt and Decimal values to numbers for JSON serialization
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt
  if (typeof obj === "bigint") {
    return Number(obj);
  }

  // Handle Prisma Decimal type (has toString method and might be wrapped)
  if (obj && typeof obj === "object" && "toNumber" in obj) {
    return Number(obj.toNumber ? obj.toNumber() : obj);
  }

  // Handle Decimal-like objects with toString
  if (obj && typeof obj === "object" && typeof obj.toString === "function") {
    const str = obj.toString();
    // Check if it's a numeric string
    if (!isNaN(Number(str)) && str.trim() !== "") {
      return Number(str);
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToNumber(value);
    }
    return converted;
  }

  return obj;
}

// Helper function to safely convert Prisma Decimal to number
function decimalToNumber(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") {
      return value.toNumber();
    }
    if (typeof value.toString === "function") {
      const str = value.toString();
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    }
  }
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await getServerSession();

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
      try {
        // Admin analytics - platform-wide
        const results = await Promise.allSettled([
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

        // Extract results with error handling
        const totalUsers = results[0].status === "fulfilled" ? results[0].value : 0;
        const totalStables = results[1].status === "fulfilled" ? results[1].value : 0;
        const totalBookings = results[2].status === "fulfilled" ? results[2].value : 0;
        const totalRevenue = results[3].status === "fulfilled" ? results[3].value : { _sum: { totalPrice: null } };
        const completedBookings = results[4].status === "fulfilled" ? results[4].value : 0;
        const bookingsByStatus = results[5].status === "fulfilled" ? results[5].value : [];
        const bookingsByMonthRaw = results[6].status === "fulfilled" ? results[6].value : [];
        const topStables = results[7].status === "fulfilled" ? results[7].value : [];
        const revenueByMonthRaw = results[8].status === "fulfilled" ? results[8].value : [];
        const bookingsByMonth = serializeMonthlyData(bookingsByMonthRaw as any[]);
        const revenueByMonth = serializeMonthlyData(revenueByMonthRaw as any[]);

        // Log any failed queries
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Query ${index} failed:`, result.reason);
          }
        });

        // Calculate platform commission (15% of total revenue) - 100% accurate
        const totalRevenueValue = decimalToNumber(totalRevenue._sum?.totalPrice || 0);
        // Calculate commission with precision: commission = revenue * 0.15
        const platformCommission = Math.round(totalRevenueValue * 0.15 * 100) / 100; // Round to 2 decimal places

        // Get cancellations with error handling
        let cancellations = 0;
        try {
          cancellations = await prisma.booking.count({
            where: {
              createdAt: { gte: startDate },
              status: "cancelled",
            },
          });
        } catch (e) {
          console.error("Error counting cancellations:", e);
        }

        // Cancellation Rate - 100% accurate (percentage calculation)
        const cancellationRate = totalBookings > 0
          ? ((Math.round((cancellations / totalBookings) * 1000) / 1000) * 100).toFixed(1) + "%"  // Round to 3 decimals before converting to percentage
          : "0%";

        // Average Order Value (AOV) = Total Revenue / Total Completed Bookings - 100% accurate
        const aov = completedBookings > 0
          ? Math.round((totalRevenueValue / completedBookings) * 100) / 100  // Round to 2 decimal places
          : 0;

        // Customer Lifetime Value (CLV) - Average revenue per user - 100% accurate
        const clv = totalUsers > 0
          ? Math.round((totalRevenueValue / totalUsers) * 100) / 100  // Round to 2 decimal places
          : 0;

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
        let avgStableRating = 0;
        let avgHorseRating = 0;
        try {
          const avgRatings = await prisma.review.aggregate({
            where: {
              createdAt: { gte: startDate },
            },
            _avg: {
              stableRating: true,
              horseRating: true,
            },
          });
          avgStableRating = avgRatings._avg.stableRating || 0;
          avgHorseRating = avgRatings._avg.horseRating || 0;
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

        // Safely fetch top stables with error handling
        let topStablesWithDetails: any[] = [];
        try {
          topStablesWithDetails = await Promise.all(
            topStables.map(async (stable: any) => {
              try {
                const stableDetails = await prisma.stable.findUnique({
                  where: { id: stable.stableId },
                  select: { name: true, location: true },
                });
                return {
                  ...stable,
                  stable: stableDetails,
                };
              } catch (e) {
                console.error(`Error fetching stable ${stable.stableId}:`, e);
                return {
                  ...stable,
                  stable: { name: "Unknown", location: "Unknown" },
                };
              }
            })
          );
        } catch (e) {
          console.error("Error fetching top stables details:", e);
          topStablesWithDetails = topStables.map((stable: any) => ({
            ...stable,
            stable: { name: "Unknown", location: "Unknown" },
          }));
        }

        // Safely count reviews
        let totalReviewsCount = 0;
        try {
          if (totalBookings > 0) {
            totalReviewsCount = await prisma.review.count({
              where: { createdAt: { gte: startDate } },
            });
          }
        } catch (e) {
          console.error("Error counting reviews:", e);
        }

        // Recent Bookings - Get detailed list of recent bookings
        let recentBookings: any[] = [];
        try {
          recentBookings = await prisma.booking.findMany({
            where: {
              createdAt: { gte: startDate },
            },
            select: {
              id: true,
              startTime: true,
              endTime: true,
              totalPrice: true,
              status: true,
              createdAt: true,
              horse: {
                select: {
                  name: true,
                },
              },
              rider: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
              stable: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
          });
        } catch (e) {
          console.error("Error fetching recent bookings:", e);
        }

        analytics = {
          overview: {
            totalUsers: Number(totalUsers) || 0,
            totalStables: Number(totalStables) || 0,
            totalBookings: Number(totalBookings) || 0,
            totalRevenue: Math.round(totalRevenueValue * 100) / 100, // Round to 2 decimal places
            completedBookings: Number(completedBookings) || 0,
            platformCommission: Math.round(platformCommission * 100) / 100, // Round to 2 decimal places
            cancellationRate,
            aov: Math.round(aov * 100) / 100, // Round to 2 decimal places
            clv: Math.round(clv * 100) / 100, // Round to 2 decimal places
            avgLeadTime: avgLeadTime ? Number(avgLeadTime).toFixed(1) : "0.0",
          },
          bookingsByStatus: bookingsByStatus || [],
          bookingsByMonth: bookingsByMonth || [],
          topStables: topStablesWithDetails,
          revenueByMonth: revenueByMonth || [],
          peakTimes: peakTimes || [],
          customerSegmentation: {
            newRiders: Number(newRiders) || 0,
            returningRiders: Number(parseInt(returningRiders[0]?.count || "0")) || 0,
            byExperience: {
              beginners: Number(beginners) || 0,
              intermediate: Number(intermediate) || 0,
              advanced: Number(advanced) || 0,
            },
          },
          horseUtilization: horseUtilization || [],
          recentBookings: recentBookings.map((b) => ({
            id: b.id,
            horseName: b.horse?.name || "Unknown",
            riderName: b.rider?.fullName || "Unknown",
            riderEmail: b.rider?.email || "",
            stableName: b.stable?.name || "Unknown",
            date: b.startTime ? new Date(b.startTime).toISOString().split("T")[0] : "",
            time: b.startTime ? new Date(b.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
            totalPrice: decimalToNumber(b.totalPrice),
            status: b.status,
            createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : "",
          })),
          customerFeedback: {
            avgStableRating: Number(avgStableRating) || 0,
            avgHorseRating: Number(avgHorseRating) || 0,
            totalReviews: Number(totalReviewsCount) || 0,
          },
        };

        // Fetch detailed users with their bookings
        let detailedUsers: any[] = [];
        try {
          const users = await prisma.user.findMany({
            where: {
              role: "rider",
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              createdAt: true,
              bookings: {
                select: {
                  id: true,
                  startTime: true,
                  endTime: true,
                  totalPrice: true,
                  status: true,
                  horse: {
                    select: { name: true },
                  },
                  stable: {
                    select: { name: true },
                  },
                },
                orderBy: { startTime: "desc" },
                take: 10,
              },
              _count: {
                select: { bookings: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          });

          detailedUsers = users.map((u) => ({
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            phoneNumber: u.phoneNumber || "N/A",
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
            totalBookings: u._count.bookings,
            bookings: u.bookings.map((b) => ({
              id: b.id,
              horseName: b.horse?.name || "Unknown",
              stableName: b.stable?.name || "Unknown",
              date: b.startTime ? new Date(b.startTime).toISOString().split("T")[0] : "",
              time: b.startTime ? new Date(b.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
              totalPrice: decimalToNumber(b.totalPrice),
              status: b.status,
            })),
          }));
        } catch (e) {
          console.error("Error fetching detailed users:", e);
        }

        // Add detailedUsers to analytics
        (analytics as any).detailedUsers = detailedUsers;
      } catch (adminError: any) {
        console.error("Error in admin analytics:", adminError);
        throw new Error(`Admin analytics failed: ${adminError?.message || "Unknown error"}`);
      }
    } else if (role === "stable_owner") {
      try {
        // Get user to access stableId
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { stableId: true },
        });

        if (!user || !user.stableId) {
          return NextResponse.json(
            {
              error: "Stable not found. Please create and get your stable approved first.",
              analytics: null
            },
            { status: 404 }
          );
        }

        // Stable owner analytics - find stable by stableId
        const stable = await prisma.stable.findUnique({
          where: { id: user.stableId },
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

        const ownerResults = await Promise.allSettled([
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

        // Extract results with error handling
        const totalBookings = ownerResults[0].status === "fulfilled" ? ownerResults[0].value : 0;
        const completedBookings = ownerResults[1].status === "fulfilled" ? ownerResults[1].value : 0;
        const totalEarnings = ownerResults[2].status === "fulfilled" ? ownerResults[2].value : { _sum: { totalPrice: null, commission: null } };
        const bookingsByMonthRaw = ownerResults[3].status === "fulfilled" ? ownerResults[3].value : [];
        const revenueByMonthRaw = ownerResults[4].status === "fulfilled" ? ownerResults[4].value : [];
        const bookingsByMonth = serializeMonthlyData(bookingsByMonthRaw as any[]);
        const revenueByMonth = serializeMonthlyData(revenueByMonthRaw as any[]);
        const cancellations = ownerResults[5].status === "fulfilled" ? ownerResults[5].value : 0;
        const avgRating = ownerResults[6].status === "fulfilled" ? ownerResults[6].value : { _avg: { stableRating: null, horseRating: null } };

        // Log any failed queries
        ownerResults.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Owner query ${index} failed:`, result.reason);
          }
        });

        // Net Earnings = Total Price - Commission - 100% accurate
        const totalPrice = decimalToNumber(totalEarnings._sum?.totalPrice || 0);
        const commission = decimalToNumber(totalEarnings._sum?.commission || 0);
        const netEarnings = Math.round((totalPrice - commission) * 100) / 100; // Round to 2 decimal places

        analytics = {
          stable: {
            name: stable.name,
            location: stable.location,
          },
          overview: {
            totalBookings: Number(totalBookings) || 0,
            completedBookings: Number(completedBookings) || 0,
            // Cancellation Rate - 100% accurate
            cancellationRate: totalBookings > 0
              ? ((Math.round((cancellations / totalBookings) * 1000) / 1000) * 100).toFixed(1)
              : "0",
            netEarnings: Math.round(netEarnings * 100) / 100, // Round to 2 decimal places
            platformCommission: Math.round(commission * 100) / 100, // Round to 2 decimal places
          },
          ratings: {
            averageStableRating: Number(avgRating._avg?.stableRating || 0),
            averageHorseRating: Number(avgRating._avg?.horseRating || 0),
            totalReviews: Number(await prisma.review.count({
              where: { stableId: stable.id },
            }).catch(() => 0)),
          },
          bookingsByMonth,
          revenueByMonth,
        };
      } catch (ownerError: any) {
        console.error("Error in stable owner analytics:", ownerError);
        throw new Error(`Stable owner analytics failed: ${ownerError?.message || "Unknown error"}`);
      }
    } else {
      return NextResponse.json(
        {
          error: `Invalid role: ${role}. Analytics only available for admin or stable_owner.`,
          analytics: null
        },
        { status: 403 }
      );
    }

    if (!analytics || Object.keys(analytics).length === 0) {
      throw new Error("Analytics object is empty after processing");
    }

    // Convert all BigInt values to numbers before serialization
    const serializableAnalytics = convertBigIntToNumber(analytics);

    return NextResponse.json({ analytics: serializableAnalytics });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      role: session?.user?.role,
      userId: session?.user?.id,
      code: error?.code,
      meta: error?.meta,
    });

    // Return more detailed error for debugging (always include in production for now)
    const errorMessage = error?.message || "Failed to fetch analytics";
    const errorDetails = {
      message: errorMessage,
      name: error?.name,
      code: error?.code,
      role: session?.user?.role,
    };

    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

