import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Check if a booking has been scored
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get("bookingId");

        if (!bookingId) {
            return NextResponse.json(
                { error: "bookingId is required" },
                { status: 400 }
            );
        }

        const result = await prisma.rideResult.findUnique({
            where: { bookingId },
            select: {
                id: true,
                rps: true,
                pointsChange: true,
            },
        });

        return NextResponse.json({
            result: result || null,
            scored: !!result,
        });
    } catch (error) {
        console.error("Error checking ride result:", error);
        return NextResponse.json(
            { error: "Failed to check ride result" },
            { status: 500 }
        );
    }
}

