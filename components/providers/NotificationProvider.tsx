"use client";

import { useEffect } from "react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.id) {
            // Request permission and get token
            const setupNotifications = async () => {
                const token = await requestNotificationPermission();
                if (token) {
                    // Save token to backend
                    try {
                        await fetch("/api/user/push-token", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token }),
                        });
                        console.log("Push token saved");
                    } catch (error) {
                        console.error("Error saving push token:", error);
                    }
                }
            };

            setupNotifications();
        }
    }, [session]);

    useEffect(() => {
        // Listen for foreground messages
        onMessageListener().then((payload: any) => {
            console.log("Foreground notification received:", payload);
            if (payload?.notification) {
                toast.info(payload.notification.title, {
                    description: payload.notification.body,
                    duration: 5000,
                });
            }
        });
    }, []);

    return <>{children}</>;
}
