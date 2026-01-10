import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch user's notifications
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                ...(unreadOnly ? { read: false } : {}),
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50, // Limit to 50 most recent
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Mark notification(s) as read
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { notificationIds, markAllAsRead } = await req.json();

        if (markAllAsRead) {
            // Mark all notifications as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false,
                },
                data: {
                    read: true,
                },
            });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: session.user.id,
                },
                data: {
                    read: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE: Delete a notification
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get("id");

        if (!notificationId) {
            return new NextResponse("Notification ID required", { status: 400 });
        }

        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
