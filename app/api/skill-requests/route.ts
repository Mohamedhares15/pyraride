import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch skill override requests for a stable owner
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get stable owner's stable
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true, role: true },
        });

        if (!user || user.role !== "stable_owner" || !user.stableId) {
            return NextResponse.json(
                { error: "Stable owner access required" },
                { status: 403 }
            );
        }

        // Fetch pending requests for this stable's horses
        const requests = await prisma.skillOverrideRequest.findMany({
            where: {
                stableId: user.stableId,
            },
            include: {
                rider: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                        rankPoints: true,
                        rank: {
                            select: { name: true },
                        },
                        // Last 5 completed bookings
                        bookings: {
                            where: { status: "completed" },
                            take: 5,
                            orderBy: { createdAt: "desc" },
                            include: {
                                horse: {
                                    select: {
                                        name: true,
                                        skillLevel: true,
                                    },
                                },
                                review: {
                                    select: {
                                        horseRating: true,
                                        stableRating: true,
                                    },
                                },
                            },
                        },
                        // Rider reviews (from stable owners)
                        riderReviewsReceived: {
                            take: 5,
                            orderBy: { createdAt: "desc" },
                            select: {
                                ridingSkillLevel: true,
                                behaviorRating: true,
                            },
                        },
                    },
                },
                horse: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        imageUrls: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate overall rating for each rider
        const requestsWithRating = requests.map((request) => {
            const reviews = request.rider.riderReviewsReceived;
            const avgSkill = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.ridingSkillLevel, 0) / reviews.length
                : null;
            const avgBehavior = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.behaviorRating, 0) / reviews.length
                : null;

            return {
                ...request,
                rider: {
                    ...request.rider,
                    overallSkillRating: avgSkill,
                    overallBehaviorRating: avgBehavior,
                },
            };
        });

        return NextResponse.json({ requests: requestsWithRating });
    } catch (error) {
        console.error("Error fetching skill requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch skill requests" },
            { status: 500 }
        );
    }
}

// POST - Create a new skill override request
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { horseId, reason } = body;

        if (!horseId) {
            return NextResponse.json(
                { error: "Horse ID is required" },
                { status: 400 }
            );
        }

        // Get horse details
        const horse = await prisma.horse.findUnique({
            where: { id: horseId },
            select: {
                id: true,
                name: true,
                skillLevel: true,
                stableId: true,
            },
        });

        if (!horse) {
            return NextResponse.json(
                { error: "Horse not found" },
                { status: 404 }
            );
        }

        // Check if there's already a pending request
        const existingRequest = await prisma.skillOverrideRequest.findFirst({
            where: {
                riderId: session.user.id,
                horseId,
                status: "pending",
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "You already have a pending request for this horse" },
                { status: 400 }
            );
        }

        // Create the request
        const request = await prisma.skillOverrideRequest.create({
            data: {
                riderId: session.user.id,
                horseId,
                stableId: horse.stableId,
                reason,
            },
        });

        return NextResponse.json({ request }, { status: 201 });
    } catch (error) {
        console.error("Error creating skill request:", error);
        return NextResponse.json(
            { error: "Failed to create skill request" },
            { status: 500 }
        );
    }
}

// PATCH - Approve or reject a skill override request
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify stable owner
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true, role: true },
        });

        if (!user || user.role !== "stable_owner" || !user.stableId) {
            return NextResponse.json(
                { error: "Stable owner access required" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { requestId, action } = body; // action: "approve" or "reject"

        if (!requestId || !action || !["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "Request ID and valid action (approve/reject) required" },
                { status: 400 }
            );
        }

        // Verify the request belongs to this stable
        const request = await prisma.skillOverrideRequest.findFirst({
            where: {
                id: requestId,
                stableId: user.stableId,
            },
        });

        if (!request) {
            return NextResponse.json(
                { error: "Request not found or not authorized" },
                { status: 404 }
            );
        }

        // Update the request status
        const updatedRequest = await prisma.skillOverrideRequest.update({
            where: { id: requestId },
            data: {
                status: action === "approve" ? "approved" : "rejected",
            },
        });

        return NextResponse.json({ request: updatedRequest });
    } catch (error) {
        console.error("Error updating skill request:", error);
        return NextResponse.json(
            { error: "Failed to update skill request" },
            { status: 500 }
        );
    }
}
