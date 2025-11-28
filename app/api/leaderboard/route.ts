import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRatings, getRiderTier } from "@/lib/leaderboard";

// GET - Fetch leaderboard data
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get("type") || "riders"; // "riders" or "horses"
        const limit = parseInt(searchParams.get("limit") || "50");

        if (type === "riders") {
            const riders = await prisma.user.findMany({
                where: {
                    role: "rider",
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    rankPoints: true,
                    rank: {
                        select: {
                            id: true,
                            name: true,
                            minPoints: true,
                            maxPoints: true,
                            icon: true,
                        },
                    },
                    _count: {
                        select: {
                            bookings: {
                                where: {
                                    status: "completed",
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    rankPoints: "desc",
                },
                take: limit,
            });

            return NextResponse.json({ riders });
        } else if (type === "horses") {
            const horses = await prisma.horse.findMany({
                where: {
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                    rankPoints: true,
                    imageUrls: true,
                    tier: {
                        select: {
                            id: true,
                            name: true,
                            minPoints: true,
                            maxPoints: true,
                            icon: true,
                        },
                    },
                    stable: {
                        select: {
                            id: true,
                            name: true,
                            location: true,
                        },
                    },
                    _count: {
                        select: {
                            bookings: {
                                where: {
                                    status: "completed",
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    rankPoints: "desc",
                },
                take: limit,
            });

            return NextResponse.json({ horses });
        } else {
            return NextResponse.json(
                { error: "Invalid type parameter" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}

// POST - Submit ride score (stable owner only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || session.user.role !== "stable_owner") {
            return NextResponse.json(
                { error: "Unauthorized - Stable owner access required" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { bookingId, rps } = body; // rps = Rider Performance Score (1-10)

        // Validate inputs
        if (!bookingId || rps === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: bookingId, rps" },
                { status: 400 }
            );
        }

        if (rps < 1 || rps > 10) {
            return NextResponse.json(
                { error: "Rider Performance Score (rps) must be between 1 and 10" },
                { status: 400 }
            );
        }

        // Fetch booking with related data
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                rider: {
                    select: {
                        id: true,
                        rankPoints: true,
                        rank: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                horse: {
                    select: {
                        id: true,
                        adminTier: true, // Admin-locked tier
                    },
                },
                stable: {
                    select: {
                        ownerId: true,
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Verify ownership - check if user is owner of this stable
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true, role: true },
        });

        if (!user || user.role !== "stable_owner" || user.stableId !== booking.stableId) {
            return NextResponse.json(
                { error: "You can only score rides from your own stable" },
                { status: 403 }
            );
        }

        // Verify horse has adminTier set
        if (!booking.horse.adminTier) {
            return NextResponse.json(
                { error: "Horse admin tier must be set by an administrator before scoring" },
                { status: 400 }
            );
        }

        // Check if ride already scored
        const existingResult = await prisma.rideResult.findUnique({
            where: { bookingId },
        });

        if (existingResult) {
            return NextResponse.json(
                { error: "This ride has already been scored" },
                { status: 400 }
            );
        }

        // Calculate new ratings using Payoff Matrix
        const ratingUpdate = calculateRatings({
            riderId: booking.rider.id,
            horseId: booking.horse.id,
            rps, // Rider Performance Score (1-10)
            riderRankPoints: booking.rider.rankPoints,
            horseAdminTier: booking.horse.adminTier as "Beginner" | "Intermediate" | "Advanced",
        });

        // Determine rider's new tier based on updated points
        const newRiderTier = ratingUpdate.riderTier;
        
        // Get or create rider rank record
        let riderRank = await prisma.riderRank.findFirst({
            where: { name: newRiderTier },
        });

        if (!riderRank) {
            // Create rank if it doesn't exist (should exist from seed)
            const tierLimits: Record<string, { min: number; max: number }> = {
                Beginner: { min: 0, max: 1300 },
                Intermediate: { min: 1301, max: 1700 },
                Advanced: { min: 1701, max: 9999 },
            };
            riderRank = await prisma.riderRank.create({
                data: {
                    name: newRiderTier,
                    minPoints: tierLimits[newRiderTier].min,
                    maxPoints: tierLimits[newRiderTier].max,
                },
            });
        }

        // Update ratings and create ride result in a transaction
        const result = await prisma.$transaction([
            // Update rider points and tier
            prisma.user.update({
                where: { id: booking.rider.id },
                data: {
                    rankPoints: ratingUpdate.newRiderPoints,
                    rankId: riderRank.id, // Update tier
                },
            }),
            // Create ride result
            prisma.rideResult.create({
                data: {
                    bookingId,
                    riderId: booking.rider.id,
                    horseId: booking.horse.id,
                    stableId: booking.stableId,
                    rps, // Rider Performance Score (1-10)
                    pointsChange: ratingUpdate.riderPointsChange, // Calculated points change
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Ride scored successfully",
            riderPointsChange: ratingUpdate.riderPointsChange,
            newRiderPoints: ratingUpdate.newRiderPoints,
            riderTier: newRiderTier,
            result: result[1], // The created RideResult
        });
    } catch (error) {
        console.error("Error submitting ride score:", error);
        return NextResponse.json(
            { error: "Failed to submit ride score" },
            { status: 500 }
        );
    }
}
