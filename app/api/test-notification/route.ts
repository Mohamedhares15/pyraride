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
            select: { pushToken: true },
        });

        if (!user?.pushToken) {
            return NextResponse.json({ error: "No push token found for user" }, { status: 404 });
        }

        await sendPushNotification(
            user.pushToken,
            "Test Notification 🔔",
            "This is a test notification from PyraRide to confirm your device is connected!",
            {
                url: "/dashboard",
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending test notification:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
