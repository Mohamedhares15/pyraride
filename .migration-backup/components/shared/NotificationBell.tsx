"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    read: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const { data: session } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications);
                    setUnreadCount(data.unreadCount);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, [session?.user?.id]);

    const markAsRead = async (notificationIds: string[]) => {
        try {
            await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds }),
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    notificationIds.includes(n.id) ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    if (!session) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-white/70 hover:text-white transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={async () => {
                                        await fetch("/api/notifications", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ markAllAsRead: true }),
                                        });
                                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                        setUnreadCount(0);
                                    }}
                                    className="text-xs text-[rgb(218,165,32)] hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-white/50">
                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? "bg-[rgb(218,165,32)]/5" : ""
                                            }`}
                                        onClick={() => {
                                            if (!notification.read) {
                                                markAsRead([notification.id]);
                                            }
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-white text-sm">
                                                    {notification.title}
                                                </p>
                                                <p className="text-white/70 text-xs mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-white/40 text-xs mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-[rgb(218,165,32)] rounded-full mt-1" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            href="/notifications"
                            className="block p-3 text-center text-sm text-[rgb(218,165,32)] hover:bg-white/5 border-t border-white/10"
                            onClick={() => setShowDropdown(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
