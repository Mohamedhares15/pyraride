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
                toast.custom((t) => (
                    <div className="w-full max-w-md bg-[#121212]/95 backdrop-blur-xl border border-[rgb(218,165,32)]/30 rounded-xl shadow-2xl shadow-black/50 p-4 flex items-start gap-4 ring-1 ring-white/10">
                        <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-[rgba(218,165,32,0.2)] to-[rgba(184,134,11,0.1)] border border-[rgba(218,165,32,0.3)]">
                            <img src="/icons/icon-192x192.png" alt="PyraRide" className="w-6 h-6 object-contain" />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <h3 className="text-sm font-bold text-white mb-1 font-display tracking-wide">{payload.notification.title}</h3>
                            <p className="text-sm text-white/70 leading-relaxed">{payload.notification.body}</p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t)}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ), {
                    duration: 5000,
                    position: "top-right",
                });
            }
        });
    }, []);

    return <>{children}</>;
}
