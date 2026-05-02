import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Points configuration
const POINTS_CONFIG = {
    booking: 100,     // Points per booking
    review: 50,       // Points for leaving a review
    referral: 200,    // Points for referring a friend
    redemptionRate: 10, // 100 points = 10 EGP discount
};

// Tier thresholds
const TIER_THRESHOLDS = {
    bronze: 0,
    silver: 500,
    gold: 1500,
    platinum: 5000,
};

function calculateTier(points: number): string {
    if (points >= TIER_THRESHOLDS.platinum) return "platinum";
    if (points >= TIER_THRESHOLDS.gold) return "gold";
    if (points >= TIER_THRESHOLDS.silver) return "silver";
    return "bronze";
}

// GET - Get user's loyalty points and transactions
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create loyalty points record
        let loyalty = await prisma.loyaltyPoints.findUnique({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
            },
        });

        if (!loyalty) {
            loyalty = await prisma.loyaltyPoints.create({
                data: {
                    userId: session.user.id,
                    points: 0,
                    tier: "bronze",
                },
                include: {
                    transactions: true,
                },
            });
        }

        return NextResponse.json({
            points: loyalty.points,
            tier: loyalty.tier,
            transactions: loyalty.transactions,
            nextTier: getNextTier(loyalty.tier),
            pointsToNextTier: getPointsToNextTier(loyalty.points, loyalty.tier),
            redemptionValue: Math.floor(loyalty.points / 10), // 100 points = 10 EGP
        });
    } catch (error) {
        console.error("Loyalty GET error:", error);
        return NextResponse.json({ error: "Failed to fetch loyalty points" }, { status: 500 });
    }
}

// POST - Add points (called internally after booking/review/referral)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type, description } = await req.json();

        if (!type || !POINTS_CONFIG[type as keyof typeof POINTS_CONFIG]) {
            return NextResponse.json({ error: "Invalid points type" }, { status: 400 });
        }

        const pointsToAdd = POINTS_CONFIG[type as keyof typeof POINTS_CONFIG];

        // Get or create loyalty record
        let loyalty = await prisma.loyaltyPoints.findUnique({
            where: { userId: session.user.id },
        });

        if (!loyalty) {
            loyalty = await prisma.loyaltyPoints.create({
                data: {
                    userId: session.user.id,
                    points: 0,
                    tier: "bronze",
                },
            });
        }

        // Update points and create transaction
        const newPoints = loyalty.points + pointsToAdd;
        const newTier = calculateTier(newPoints);

        const updated = await prisma.loyaltyPoints.update({
            where: { id: loyalty.id },
            data: {
                points: newPoints,
                tier: newTier,
                transactions: {
                    create: {
                        amount: pointsToAdd,
                        type,
                        description: description || `Earned ${pointsToAdd} points for ${type}`,
                    },
                },
            },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        return NextResponse.json({
            points: updated.points,
            tier: updated.tier,
            pointsAdded: pointsToAdd,
            tierChanged: loyalty.tier !== newTier,
        });
    } catch (error) {
        console.error("Loyalty POST error:", error);
        return NextResponse.json({ error: "Failed to add points" }, { status: 500 });
    }
}

function getNextTier(currentTier: string): string | null {
    const tiers = ["bronze", "silver", "gold", "platinum"];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

function getPointsToNextTier(currentPoints: number, currentTier: string): number | null {
    const nextTier = getNextTier(currentTier);
    if (!nextTier) return null;
    return TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS] - currentPoints;
}
