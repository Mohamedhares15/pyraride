import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRatings } from "@/lib/leaderboard";

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
        const { bookingId, performance, difficulty } = body;

        // Validate inputs
        if (!bookingId || performance === undefined || difficulty === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: bookingId, performance, difficulty" },
                { status: 400 }
            );
        }

        if (performance < 0 || performance > 10 || difficulty < 0 || difficulty > 10) {
            return NextResponse.json(
                { error: "Performance and difficulty must be between 0 and 10" },
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
                        rankPoints: true,
                        tier: {
                            select: {
                                name: true,
                            },
                        },
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

        // Verify ownership
        if (booking.stable.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only score rides from your own stable" },
                { status: 403 }
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

        // Calculate new ratings
        const ratingUpdate = calculateRatings({
            riderId: booking.rider.id,
            horseId: booking.horse.id,
            performance,
            difficulty,
            riderRank: booking.rider.rank?.name || "Beginner",
            horseTier: booking.horse.tier?.name || "Tier 1",
            riderPoints: booking.rider.rankPoints,
            horsePoints: booking.horse.rankPoints,
        });

        // Update ratings and create ride result in a transaction
        const result = await prisma.$transaction([
            // Update rider points
            prisma.user.update({
                where: { id: booking.rider.id },
                data: { rankPoints: ratingUpdate.newRiderPoints },
            }),
            // Update horse points
            prisma.horse.update({
                where: { id: booking.horse.id },
                data: { rankPoints: ratingUpdate.newHorsePoints },
            }),
            // Create ride result
            prisma.rideResult.create({
                data: {
                    bookingId,
                    riderId: booking.rider.id,
                    horseId: booking.horse.id,
                    stableId: booking.stableId,
                    rps: performance, // Rider Performance Score (1-10)
                    pointsChange: ratingUpdate.riderPointsChange, // Calculated points change
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Ride scored successfully",
            riderPointsChange: ratingUpdate.riderPointsChange,
            horsePointsChange: ratingUpdate.horsePointsChange,
            result: result[2], // The created RideResult
        });
    } catch (error) {
        console.error("Error submitting ride score:", error);
        return NextResponse.json(
            { error: "Failed to submit ride score" },
            { status: 500 }
        );
    }
}
