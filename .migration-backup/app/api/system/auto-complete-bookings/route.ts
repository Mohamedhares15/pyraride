import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// System endpoint to auto-complete past bookings
// This can be called via cron or manually
export async function POST() {
    try {
        const now = new Date();

        // Find all confirmed bookings that have ended
        const pastBookings = await prisma.booking.findMany({
            where: {
                status: "confirmed",
                endTime: {
                    lt: now,
                },
            },
        });

        console.log(`[AutoComplete] Found ${pastBookings.length} past bookings to complete`);

        // Update them all to "completed"
        const result = await prisma.booking.updateMany({
            where: {
                status: "confirmed",
                endTime: {
                    lt: now,
                },
            },
            data: {
                status: "completed",
            },
        });

        console.log(`[AutoComplete] Updated ${result.count} bookings to completed`);

        return NextResponse.json({
            success: true,
            message: `Completed ${result.count} past bookings`,
            count: result.count,
        });
    } catch (error) {
        console.error("[AutoComplete] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// GET endpoint for manual checking
export async function GET() {
    try {
        const now = new Date();

        const pastBookings = await prisma.booking.count({
            where: {
                status: "confirmed",
                endTime: {
                    lt: now,
                },
            },
        });

        return NextResponse.json({
            pendingCompletion: pastBookings,
            currentTime: now.toISOString(),
        });
    } catch (error) {
        console.error("[AutoComplete] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
