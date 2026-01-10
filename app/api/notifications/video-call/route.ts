import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { stableId, action } = await req.json();

        if (!stableId) {
            return new NextResponse("Missing stableId", { status: 400 });
        }

        // Get Stable Owner
        const stable = await prisma.stable.findUnique({
            where: { id: stableId },
            include: { owner: true },
        });

        if (!stable || !stable.owner.pushToken) {
            return new NextResponse("Stable owner not found or offline", { status: 404 });
        }

        if (action === "request") {
            await sendPushNotification(
                stable.owner.pushToken,
                "Video Call Request 📹",
                `${session.user.name || "A rider"} wants to video chat about their booking.`,
                {
                    type: "video_call",
                    stableId,
                    riderId: session.user.id,
                    riderName: session.user.name,
                    url: `/stable/${stableId}?action=join-call`
                }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending video call notification:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
