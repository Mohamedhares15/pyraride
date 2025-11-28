import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session || session.user.role !== "stable_owner") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { stableId, horseId, startTime, endTime, reason } = await req.json();

        if (!stableId || !startTime || !endTime) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify ownership - fetch user to get stableId
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true },
        });

        if (!user || user.stableId !== stableId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const blockedSlot = await prisma.blockedSlot.create({
            data: {
                stableId,
                horseId, // Can be null to block entire stable
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                reason,
            },
        });

        return NextResponse.json(blockedSlot);
    } catch (error) {
        console.error("Error blocking slot:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
