"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Gift, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoyaltyData {
    points: number;
    tier: string;
    transactions: Array<{
        id: string;
        amount: number;
        type: string;
        description: string;
        createdAt: string;
    }>;
    nextTier: string | null;
    pointsToNextTier: number | null;
    redemptionValue: number;
}

const tierColors: Record<string, string> = {
    bronze: "bg-amber-700",
    silver: "bg-gray-400",
    gold: "bg-yellow-500",
    platinum: "bg-purple-500",
};

const tierIcons: Record<string, string> = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
};

export default function LoyaltyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin?redirect=/dashboard/loyalty");
            return;
        }

        if (status === "authenticated") {
            fetchLoyaltyData();
        }
    }, [status, router]);

    const fetchLoyaltyData = async () => {
        try {
            const res = await fetch("/api/loyalty");
            if (res.ok) {
                const data = await res.json();
                setLoyalty(data);
            }
        } catch (error) {
            console.error("Failed to fetch loyalty data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!loyalty) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Failed to load loyalty data</div>
            </div>
        );
    }

    const progressPercentage = loyalty.nextTier && loyalty.pointsToNextTier
        ? Math.min(100, ((loyalty.points) / (loyalty.points + loyalty.pointsToNextTier)) * 100)
        : 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
                    <p className="text-white/60">Earn points on every ride and unlock exclusive perks</p>
                </div>

                {/* Points Card */}
                <Card className="bg-gradient-to-br from-[rgb(218,165,32)] to-amber-600 border-0 text-black">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-black/70 text-sm">Total Points</p>
                                <p className="text-5xl font-bold">{loyalty.points.toLocaleString()}</p>
                                <p className="text-black/70 text-sm mt-1">
                                    Worth EGP {loyalty.redemptionValue} in discounts
                                </p>
                            </div>
                            <div className="text-center">
                                <div className={`w-20 h-20 rounded-full ${tierColors[loyalty.tier]} flex items-center justify-center text-4xl shadow-lg`}>
                                    {tierIcons[loyalty.tier]}
                                </div>
                                <Badge className="mt-2 bg-black/20 text-black capitalize">
                                    {loyalty.tier} Member
                                </Badge>
                            </div>
                        </div>

                        {/* Progress to next tier */}
                        {loyalty.nextTier && (
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-black/70 mb-1">
                                    <span>Progress to {loyalty.nextTier}</span>
                                    <span>{loyalty.pointsToNextTier} points to go</span>
                                </div>
                                <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black/40 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* How to Earn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Book a Ride</p>
                                <p className="text-sm text-white/60">+100 points</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <Star className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Leave a Review</p>
                                <p className="text-sm text-white/60">+50 points</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Gift className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Refer a Friend</p>
                                <p className="text-sm text-white/60">+200 points</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loyalty.transactions.length === 0 ? (
                            <div className="text-center py-8 text-white/50">
                                <p>No activity yet. Book your first ride to earn points!</p>
                                <Button
                                    className="mt-4 bg-[rgb(218,165,32)] hover:bg-[rgb(218,165,32)]/90 text-black"
                                    onClick={() => router.push("/stables")}
                                >
                                    Browse Stables <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {loyalty.transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                    >
                                        <div>
                                            <p className="text-white text-sm">{tx.description}</p>
                                            <p className="text-white/50 text-xs">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            className={
                                                tx.amount > 0
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }
                                        >
                                            {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
