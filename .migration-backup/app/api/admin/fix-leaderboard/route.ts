import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin endpoint to fix users appearing in multiple divisions
// Each user should only be in ONE division (their highest)
export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        // Only admins can run this
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const now = new Date();

        // Get all active leagues
        const leagues = await prisma.league.findMany({
            where: {
                status: "active",
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: {
                riders: true,
            },
        });

        // League hierarchy (highest to lowest)
        const leagueOrder = ["champion", "elite", "platinum", "gold", "silver", "bronze", "wood"];

        // Group users by ID to find duplicates
        const userLeagues: Record<string, string[]> = {};

        for (const league of leagues) {
            for (const rider of league.riders) {
                if (!userLeagues[rider.id]) {
                    userLeagues[rider.id] = [];
                }
                userLeagues[rider.id].push(league.name);
            }
        }

        let fixedUsers = 0;

        // For each user in multiple leagues, keep them only in their highest league
        for (const [userId, leagueNames] of Object.entries(userLeagues)) {
            if (leagueNames.length > 1) {
                // Find the highest league this user is in
                const highestLeague = leagueOrder.find(l => leagueNames.includes(l));

                if (highestLeague) {
                    // Get all leagues except the highest
                    const leaguesToRemove = leagueNames.filter(l => l !== highestLeague);

                    // Remove user from lower leagues
                    for (const leagueName of leaguesToRemove) {
                        const league = leagues.find(l => l.name === leagueName);
                        if (league) {
                            await prisma.league.update({
                                where: { id: league.id },
                                data: {
                                    riders: {
                                        disconnect: { id: userId },
                                    },
                                },
                            });
                        }
                    }

                    fixedUsers++;
                    console.log(`[FixLeaderboard] Removed user ${userId} from leagues: ${leaguesToRemove.join(", ")}, kept in: ${highestLeague}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Fixed ${fixedUsers} users`,
            fixedUsers,
        });
    } catch (error) {
        console.error("[FixLeaderboard] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
