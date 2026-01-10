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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { pushToken: true, email: true },
        });

        console.log("[Test Notification] User:", session.user.id);
        console.log("[Test Notification] Has push token:", !!user?.pushToken);
        console.log("[Test Notification] Token preview:", user?.pushToken?.substring(0, 20) + "...");

        if (!user?.pushToken) {
            return NextResponse.json({
                error: "No push token found for user",
                details: "Please refresh the page to re-register for notifications"
            }, { status: 404 });
        }

        console.log("[Test Notification] Sending push notification...");
        const result = await sendPushNotification(
            user.pushToken,
            "Test Notification 🔔",
            "This is a test notification from PyraRide to confirm your device is connected!",
            {
                url: "/dashboard",
            }
        );

        console.log("[Test Notification] Send result:", result);
        return NextResponse.json({
            success: true,
            message: "Notification sent to Firebase. Check your device!",
            tokenPreview: user.pushToken.substring(0, 20) + "..."
        });
    } catch (error: any) {
        console.error("[Test Notification] Error:", error);
        return NextResponse.json({
            error: "Internal Error",
            message: error.message
        }, { status: 500 });
    }
}
