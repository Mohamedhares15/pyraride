import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Promote top 3 riders from a league to the next league
// This should be called by a cron job or admin manually
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    // Only admins can trigger promotions
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { leagueId } = body;

    if (!leagueId) {
      return NextResponse.json(
        { error: "leagueId is required" },
        { status: 400 }
      );
    }

    // Get the league
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        riders: {
          orderBy: {
            rankPoints: "desc",
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    if (league.status !== "active") {
      return NextResponse.json(
        { error: "Can only promote from active leagues" },
        { status: 400 }
      );
    }

    // Get top 3 riders
    const top3Riders = league.riders.slice(0, 3);

    if (top3Riders.length === 0) {
      return NextResponse.json(
        { error: "No riders in this league" },
        { status: 400 }
      );
    }

    // Determine next league
    const leagueOrder = ["wood", "bronze", "silver", "gold", "platinum", "elite", "champion"];
    const currentIndex = leagueOrder.indexOf(league.name.toLowerCase());
    
    if (currentIndex === -1 || currentIndex === leagueOrder.length - 1) {
      return NextResponse.json(
        { error: "Cannot promote from this league" },
        { status: 400 }
      );
    }

    const nextLeagueName = leagueOrder[currentIndex + 1];

    // Find or create next league
    const now = new Date();
    let nextLeague = await prisma.league.findFirst({
      where: {
        name: nextLeagueName.toLowerCase() as any,
        status: "active",
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!nextLeague) {
      // Create new league period (2 weeks)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 14);

      nextLeague = await prisma.league.create({
        data: {
          name: nextLeagueName.toLowerCase() as any,
          startDate,
          endDate,
          status: "active" as any,
        },
      });
    }

    // Update riders to next league and create standings
    const result = await prisma.$transaction(async (tx) => {
      // Create standings for current league
      const standings = await Promise.all(
        league.riders.map((rider, index) =>
          tx.leagueStanding.create({
            data: {
              leagueId: league.id,
              riderId: rider.id,
              rankPoints: rider.rankPoints,
              finalRank: index + 1,
              promoted: index < 3, // Top 3 are promoted
            },
          })
        )
      );

      // Update top 3 riders to next league
      await Promise.all(
        top3Riders.map((rider) =>
          tx.user.update({
            where: { id: rider.id },
            data: { currentLeagueId: nextLeague!.id },
          })
        )
      );

      // End current league
      await tx.league.update({
        where: { id: league.id },
        data: { status: "ended" },
      });

      return { standings, promoted: top3Riders.length };
    });

    return NextResponse.json({
      message: `Promoted ${result.promoted} riders to ${nextLeagueName}`,
      promoted: top3Riders.map((r) => ({
        id: r.id,
        name: r.fullName || r.email,
        rankPoints: r.rankPoints,
      })),
      nextLeague: {
        id: nextLeague.id,
        name: nextLeague.name,
      },
    });
  } catch (error) {
    console.error("Error promoting riders:", error);
    return NextResponse.json(
      { error: "Failed to promote riders" },
      { status: 500 }
    );
  }
}

