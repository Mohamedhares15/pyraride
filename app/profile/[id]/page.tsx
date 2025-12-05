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
    Sparkles,
    Award,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
        stable: { id: string; name: string };
        review?: {
            id: string;
            stableRating: number;
            horseRating: number;
            comment: string;
        };
    }[];
    ownedStables?: {
        id: string;
        name: string;
    }[];
}

const getRankColor = (rankName: string) => {
    const name = rankName?.toLowerCase() || "";
    if (name.includes("champion")) return "from-yellow-400 via-amber-500 to-yellow-600";
    if (name.includes("elite")) return "from-red-500 via-rose-500 to-red-600";
    if (name.includes("platinum")) return "from-purple-400 via-violet-500 to-purple-600";
    if (name.includes("gold")) return "from-yellow-400 via-yellow-500 to-amber-500";
    if (name.includes("silver")) return "from-gray-300 via-gray-400 to-gray-500";
    if (name.includes("bronze")) return "from-orange-400 via-orange-500 to-orange-600";
    return "from-amber-700 via-amber-800 to-amber-900"; // Wood default
};

export default function ProfilePage() {
    const { data: session } = useSession();
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
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
                <div className="text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10">
                        <User className="h-10 w-10 text-white/30" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
                    <p className="text-white/50 mb-6">This profile doesn't exist or has been removed.</p>
                    <Link href="/">
                        <Button className="gap-2">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isStableOwner = profile.role === "stable_owner";
    const rankGradient = getRankColor(profile.rank?.name || "wood");

    return (
        <div className="min-h-screen bg-black">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="mx-auto max-w-4xl px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
                                <Home className="h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
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
                    {/* Profile Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
                        {/* Banner Gradient */}
                        <div className={`h-32 bg-gradient-to-r ${rankGradient} opacity-20`} />

                        {/* Profile Content */}
                        <div className="relative px-6 pb-8 -mt-16">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                {/* Profile Photo */}
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${rankGradient} p-1`}>
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                            {profile.profilePhoto ? (
                                                <img
                                                    src={profile.profilePhoto}
                                                    alt={profile.fullName || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-12 h-12 text-white/30" />
                                            )}
                                        </div>
                                    </div>
                                    {isStableOwner && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                            🏇 Stable Owner
                                        </div>
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        {profile.fullName || "Anonymous Rider"}
                                    </h1>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                                        {profile.rank && (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${rankGradient} text-white font-semibold`}>
                                                <Trophy className="w-3.5 h-3.5" />
                                                {profile.rank.name}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70">
                                            <Star className="w-3.5 h-3.5 text-yellow-400" />
                                            {profile.rankPoints} Points
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isOwnProfile && session?.user && (
                                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                                        {!friendshipStatus && (
                                            <Button onClick={handleFriendRequest} disabled={actionLoading} className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                                                <UserPlus className="w-4 h-4" />
                                                Add Friend
                                            </Button>
                                        )}

                                        {friendshipStatus?.status === "pending" && friendshipStatus.isSender && (
                                            <Button disabled variant="outline" className="gap-2 border-white/20 text-white/50">
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
                                                </Button>
                                            </div>
                                        )}

                                        {friendshipStatus?.status === "accepted" && (
                                            <div className="flex gap-2">
                                                <Button disabled variant="outline" className="gap-2 border-green-500/30 text-green-400 bg-green-500/10">
                                                    <UserCheck className="w-4 h-4" />
                                                    Friends
                                                </Button>
                                                <Button onClick={() => router.push(`/chat?user=${userId}`)} className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                                                    <MessageCircle className="w-4 h-4" />
                                                    Message
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className={`grid ${isStableOwner ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mt-8 max-w-md mx-auto md:mx-0`}>
                                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-3xl font-bold text-white">{profile._count.bookings}</p>
                                    <p className="text-xs text-white/50 mt-1">Total Rides</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-3xl font-bold text-white">{profile._count.reviews}</p>
                                    <p className="text-xs text-white/50 mt-1">Reviews</p>
                                </div>
                                {isStableOwner && (
                                    <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-3xl font-bold text-white">{profile.ownedStables?.length || 0}</p>
                                        <p className="text-xs text-white/50 mt-1">Stables</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ride History (visible to everyone) */}
                    {profile.bookings && profile.bookings.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Ride History
                                </h2>
                            </div>
                            <div className="divide-y divide-white/5">
                                {profile.bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="p-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                                                    <span className="text-2xl">🐴</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white text-lg">{booking.horse.name}</p>
                                                    <Link href={`/stables/${booking.stable.id}`} className="text-sm text-white/60 hover:text-primary flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {booking.stable.name}
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-white/70">
                                                    {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${booking.status === "completed" ? "bg-green-500/20 text-green-400" :
                                                    booking.status === "confirmed" ? "bg-blue-500/20 text-blue-400" :
                                                        booking.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                                                            "bg-yellow-500/20 text-yellow-400"
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Review Rating */}
                                        {booking.review && (
                                            <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-white/50">Horse:</span>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3.5 h-3.5 ${i < booking.review!.horseRating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-white/50">Stable:</span>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3.5 h-3.5 ${i < booking.review!.stableRating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {booking.review.comment && (
                                                    <p className="text-sm text-white/70 italic">"{booking.review.comment}"</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Owned Stables */}
                    {profile.ownedStables && profile.ownedStables.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    🏇 Owned Stables
                                </h2>
                            </div>
                            <div className="divide-y divide-white/5">
                                {profile.ownedStables.map((stable) => (
                                    <Link
                                        key={stable.id}
                                        href={`/stables/${stable.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                                                <span className="text-lg">🏠</span>
                                            </div>
                                            <p className="font-medium text-white group-hover:text-primary transition-colors">{stable.name}</p>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 text-white/30 rotate-180 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
