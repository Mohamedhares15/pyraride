"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    Calendar,
    Star,
    Trophy,
    MessageCircle,
    UserPlus,
    UserCheck,
    Clock,
    ArrowLeft,
    Home,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
    role: string;
    rankPoints: number;
    createdAt: string;
    rank?: {
        name: string;
        icon?: string;
    };
    _count: {
        bookings: number;
        reviews: number;
    };
    bookings?: {
        id: string;
        startTime: string;
        status: string;
        horse: { name: string };
        stable: { name: string };
    }[];
    ownedStables?: {
        id: string;
        name: string;
    }[];
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<{
        status: string;
        isSender: boolean;
    } | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    async function fetchProfile() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch profile");

            const data = await response.json();
            setProfile(data.user);
            setFriendshipStatus(data.friendshipStatus);
            setIsOwnProfile(data.isOwnProfile);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleFriendRequest() {
        if (!session?.user?.id) {
            router.push("/login");
            return;
        }

        try {
            setActionLoading(true);
            const response = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId }),
            });

            if (response.ok) {
                setFriendshipStatus({ status: "pending", isSender: true });
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleFriendAction(action: "accept" | "reject") {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/friends/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                if (action === "accept") {
                    setFriendshipStatus({ status: "accepted", isSender: false });
                } else {
                    setFriendshipStatus(null);
                }
            }
        } catch (error) {
            console.error("Error handling friend request:", error);
        } finally {
            setActionLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold mb-4">User Not Found</h2>
                    <Button asChild>
                        <Link href="/">Go Home</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const isStableOwner = profile.role === "stable_owner";

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/60 py-6 backdrop-blur-lg">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10">
                                <Home className="h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-white/70">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="mx-auto max-w-4xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Profile Header */}
                    <Card className="p-8 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Profile Photo */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center overflow-hidden">
                                    {profile.profilePhoto ? (
                                        <img
                                            src={profile.profilePhoto}
                                            alt={profile.fullName || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-white/50" />
                                    )}
                                </div>
                                {isStableOwner && (
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                                        Stable Owner
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {profile.fullName || "Anonymous Rider"}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/70 mb-4">
                                    {profile.rank && (
                                        <span className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4 text-yellow-400" />
                                            {profile.rank.name}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-primary" />
                                        {profile.rankPoints} Points
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date(profile.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-center md:justify-start gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{profile._count.bookings}</p>
                                        <p className="text-xs text-white/50">Rides</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{profile._count.reviews}</p>
                                        <p className="text-xs text-white/50">Reviews</p>
                                    </div>
                                    {profile.ownedStables && profile.ownedStables.length > 0 && (
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{profile.ownedStables.length}</p>
                                            <p className="text-xs text-white/50">Stables</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isOwnProfile && session?.user && (
                                <div className="flex flex-col gap-2">
                                    {!friendshipStatus && (
                                        <Button onClick={handleFriendRequest} disabled={actionLoading} className="gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            Add Friend
                                        </Button>
                                    )}

                                    {friendshipStatus?.status === "pending" && friendshipStatus.isSender && (
                                        <Button disabled variant="outline" className="gap-2">
                                            <Clock className="w-4 h-4" />
                                            Request Sent
                                        </Button>
                                    )}

                                    {friendshipStatus?.status === "pending" && !friendshipStatus.isSender && (
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleFriendAction("accept")} disabled={actionLoading} className="gap-2 bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4" />
                                                Accept
                                            </Button>
                                            <Button onClick={() => handleFriendAction("reject")} disabled={actionLoading} variant="destructive" className="gap-2">
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}

                                    {friendshipStatus?.status === "accepted" && (
                                        <>
                                            <Button disabled variant="outline" className="gap-2">
                                                <UserCheck className="w-4 h-4 text-green-500" />
                                                Friends
                                            </Button>
                                            <Button onClick={() => router.push(`/chat?user=${userId}`)} className="gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                Message
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recent Rides (only shown on own profile) */}
                    {isOwnProfile && profile.bookings && profile.bookings.length > 0 && (
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Recent Rides</h2>
                            <div className="space-y-3">
                                {profile.bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-white">{booking.horse.name}</p>
                                            <p className="text-sm text-white/50">at {booking.stable.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-white/70">
                                                {new Date(booking.startTime).toLocaleDateString()}
                                            </p>
                                            <span className={`text-xs font-semibold ${booking.status === "completed" ? "text-green-400" :
                                                    booking.status === "confirmed" ? "text-blue-400" :
                                                        booking.status === "cancelled" ? "text-red-400" :
                                                            "text-yellow-400"
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Owned Stables */}
                    {profile.ownedStables && profile.ownedStables.length > 0 && (
                        <Card className="p-6 mt-6">
                            <h2 className="text-xl font-bold text-white mb-4">Stables</h2>
                            <div className="space-y-3">
                                {profile.ownedStables.map((stable) => (
                                    <Link
                                        key={stable.id}
                                        href={`/stables/${stable.id}`}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <p className="font-medium text-white">{stable.name}</p>
                                        <ArrowLeft className="w-4 h-4 text-white/50 rotate-180" />
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
