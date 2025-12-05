import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Get current active league standings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueName = searchParams.get("league") || "wood"; // Default to wood
    const includeAll = searchParams.get("all") === "true"; // Get all leagues if true

    const now = new Date();

    if (includeAll) {
      // Get all active leagues, ordered by league hierarchy
      const leagueOrder = ["wood", "bronze", "silver", "gold", "platinum", "elite", "champion"];
      const allLeagues = await prisma.league.findMany({
        where: {
          status: "active",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          riders: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              profileImageUrl: true,
              rankPoints: true,
              rank: {
                select: {
                  name: true,
                },
              },
              rideResults: {
                select: {
                  pointsChange: true,
                },
              },
            },
            orderBy: {
              rankPoints: "desc",
            },
            take: 100, // Top 100 riders per league
          },
        },
      });

      // Sort leagues by hierarchy
      const sortedLeagues = allLeagues.sort((a, b) => {
        const aIndex = leagueOrder.indexOf(a.name.toLowerCase());
        const bIndex = leagueOrder.indexOf(b.name.toLowerCase());
        return aIndex - bIndex;
      });

      return NextResponse.json({ leagues: sortedLeagues });
    }

    // Get specific league (league names are stored in lowercase in enum)
    const league = await prisma.league.findFirst({
      where: {
        name: leagueName.toLowerCase() as any,
        status: "active",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        riders: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            profileImageUrl: true,
            rankPoints: true,
            rank: {
              select: {
                name: true,
              },
            },
            rideResults: {
              select: {
                pointsChange: true,
              },
            },
          },
          orderBy: {
            rankPoints: "desc",
          },
        },
      },
    });

    if (!league) {
      // Create a new wood league if none exists
      if (leagueName === "wood") {
        const startDate = new Date();
        const endDate = new Date(startDate);
        // TEMPORARY: Extend Wood to 3 weeks (until Dec 21, 2025) instead of standard 2 weeks
        endDate.setDate(endDate.getDate() + 21); // 3 weeks

        const newLeague = await prisma.league.create({
          data: {
            name: "wood" as any,
            startDate,
            endDate,
            status: "active" as any,
          },
          include: {
            riders: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true,
                profileImageUrl: true,
                rankPoints: true,
                rank: {
                  select: {
                    name: true,
                  },
                },
                rideResults: {
                  select: {
                    pointsChange: true,
                  },
                },
              },
              orderBy: {
                rankPoints: "desc",
              },
            },
          },
        });

        return NextResponse.json({ league: newLeague });
      }

      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ league });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}

