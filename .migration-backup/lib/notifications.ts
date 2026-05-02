import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "./firebase-admin";

interface NotificationData {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
}

export async function createNotification({
    userId,
    type,
    title,
    message,
    data,
}: NotificationData) {
    try {
        // 1. Create in-app notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data || {},
            },
        });

        // 2. Try to send push notification (if user has push token)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true },
        });

        if (user?.pushToken) {
            try {
                await sendPushNotification(
                    user.pushToken,
                    title,
                    message,
                    data
                );
                console.log("[Notification] Push sent to user:", userId);
            } catch (pushError) {
                console.error("[Notification] Push failed, in-app notification still created:", pushError);
            }
        }

        return notification;
    } catch (error) {
        console.error("[Notification] Error creating notification:", error);
        throw error;
    }
}

export async function createBulkNotifications(notifications: NotificationData[]) {
    try {
        const created = await prisma.notification.createMany({
            data: notifications,
        });

        // Optionally send push notifications for each
        for (const notification of notifications) {
            const user = await prisma.user.findUnique({
                where: { id: notification.userId },
                select: { pushToken: true },
            });

            if (user?.pushToken) {
                try {
                    await sendPushNotification(
                        user.pushToken,
                        notification.title,
                        notification.message,
                        notification.data
                    );
                } catch (pushError) {
                    console.error("[Notification] Push failed for user:", notification.userId);
                }
            }
        }

        return created;
    } catch (error) {
        console.error("[Notification] Error creating bulk notifications:", error);
        throw error;
    }
}
