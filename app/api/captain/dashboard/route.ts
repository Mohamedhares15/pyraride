import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/captain/dashboard — Captain's dashboard overview
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify captain role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "captain" && user?.role !== "stable_owner") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get captain's academy
    const academy = await prisma.academy.findUnique({
      where: { captainId: session.user.id },
      include: {
        programs: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!academy) {
      return NextResponse.json(
        { error: "No academy assigned" },
        { status: 404 }
      );
    }

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      activeEnrollments,
      totalEnrollments,
      todaySessions,
      upcomingSessions,
      completedSessions,
      revenueData,
    ] = await Promise.all([
      // Active trainees count
      prisma.trainingEnrollment.count({
        where: { academyId: academy.id, status: "active" },
      }),
      // Total enrollments ever
      prisma.trainingEnrollment.count({
        where: { academyId: academy.id },
      }),
      // Today's sessions
      prisma.trainingSession.findMany({
        where: {
          enrollment: { academyId: academy.id },
          date: { gte: today, lt: tomorrow },
        },
        include: {
          enrollment: {
            include: {
              rider: {
                select: { id: true, fullName: true, profileImageUrl: true, email: true },
              },
              program: { select: { name: true, skillLevel: true } },
            },
          },
          review: true,
        },
        orderBy: { startTime: "asc" },
      }),
      // Upcoming sessions (next 7 days)
      prisma.trainingSession.findMany({
        where: {
          enrollment: { academyId: academy.id },
          date: { gt: today },
          status: "scheduled",
        },
        include: {
          enrollment: {
            include: {
              rider: {
                select: { id: true, fullName: true, profileImageUrl: true },
              },
              program: { select: { name: true, skillLevel: true } },
            },
          },
        },
        orderBy: { date: "asc" },
        take: 20,
      }),
      // Completed sessions count
      prisma.trainingSession.count({
        where: {
          enrollment: { academyId: academy.id },
          status: "completed",
        },
      }),
      // Revenue this month
      prisma.trainingEnrollment.aggregate({
        where: {
          academyId: academy.id,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    return NextResponse.json({
      academy,
      stats: {
        activeTrainees: activeEnrollments,
        totalEnrollments,
        completedSessions,
        revenueThisMonth: revenueData._sum.totalPrice || 0,
      },
      todaySessions,
      upcomingSessions,
    });
  } catch (error) {
    console.error("Error fetching captain dashboard:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
