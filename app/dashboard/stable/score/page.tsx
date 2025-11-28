"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Trophy, Star, TrendingUp } from "lucide-react";

interface Booking {
    id: string;
    date: string;
    timeSlot: string;
    status: string;
    rider?: {
        id: string;
        fullName: string | null;
        email: string;
    };
    user?: {
        id: string;
        fullName: string | null;
        email: string;
    };
    horse: {
        id: string;
        name: string;
        adminTier?: string | null;
    };
    stable: {
        id: string;
        name: string;
    };
    alreadyScored?: boolean;
}

export default function ScoreRidePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<string>("");
    const [rps, setRps] = useState([5]); // Rider Performance Score (1-10)
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session?.user?.role !== "stable_owner") {
            router.push("/");
        } else {
            fetchCompletedBookings();
        }
    }, [status, session, router]);

    const fetchCompletedBookings = async () => {
        try {
            setFetching(true);
            const response = await fetch("/api/bookings?ownerOnly=true&status=completed");
            if (response.ok) {
                const data = await response.json();
                const allBookings = data.bookings || [];
                
                // Filter out already scored bookings and bookings with horses that don't have adminTier
                const unscoredBookings = allBookings.filter((booking: Booking) => {
                    // Must not be already scored
                    if (booking.alreadyScored) return false;
                    
                    // Horse must have adminTier set
                    if (!booking.horse?.adminTier) return false;
                    
                    return true;
                });
                
                setBookings(unscoredBookings);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load bookings");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBooking) {
            toast.error("Please select a booking to score");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/leaderboard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookingId: selectedBooking,
                    rps: rps[0], // Rider Performance Score (1-10)
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const pointsChange = data.riderPointsChange || 0;
                toast.success(
                    `Ride scored! Rider ${pointsChange > 0 ? "+" : ""}${pointsChange} points (New total: ${data.newRiderPoints || 0} pts, Tier: ${data.riderTier || "N/A"})`
                );
                // Reset form
                setSelectedBooking("");
                setRps([5]);
                // Refresh bookings list
                fetchCompletedBookings();
            } else {
                toast.error(data.error || "Failed to submit score");
            }
        } catch (error) {
            console.error("Error submitting score:", error);
            toast.error("Failed to submit score");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || fetching) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    const selectedBookingData = bookings.find((b) => b.id === selectedBooking);

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
                <div className="mx-auto max-w-4xl px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Score Ride Performance</h1>
                            <p className="text-muted-foreground">
                                Submit scores for completed rides to update leaderboard rankings
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Booking Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Completed Ride</CardTitle>
                            <CardDescription>
                                Choose a booking that hasn't been scored yet
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bookings.length === 0 ? (
                                <p className="text-center text-muted-foreground">
                                    No unscored completed bookings found
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            onClick={() => setSelectedBooking(booking.id)}
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${selectedBooking === booking.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {(booking.rider || booking.user)?.fullName || (booking.rider || booking.user)?.email}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Horse: {booking.horse.name} • {new Date(booking.date).toLocaleDateString()} • {booking.timeSlot}
                                                    </p>
                                                </div>
                                                {selectedBooking === booking.id && (
                                                    <Star className="h-5 w-5 fill-primary text-primary" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedBookingData && (
                        <>
                            {/* Rider Performance Score */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Rider Performance Score
                                    </CardTitle>
                                    <CardDescription>
                                        Rate the rider's performance from 1-10. Scores 7+ count as "Pass", 6 or below count as "Fail". Points are calculated based on the horse's admin-assigned tier.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Score: {rps[0]}/10</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {rps[0] <= 3 && "Poor (Fail)"}
                                            {rps[0] > 3 && rps[0] <= 6 && "Fair (Fail)"}
                                            {rps[0] === 7 && "Good (Pass)"}
                                            {rps[0] > 7 && rps[0] <= 8 && "Very Good (Pass)"}
                                            {rps[0] > 8 && rps[0] <= 9 && "Excellent (Pass)"}
                                            {rps[0] === 10 && "Perfect (Pass)"}
                                        </span>
                                    </div>
                                    <Slider
                                        value={rps}
                                        onValueChange={setRps}
                                        min={1}
                                        max={10}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        <strong>Note:</strong> The horse's difficulty tier is set by administrators. Your score (1-10) determines Pass (7+) or Fail (≤6), which affects point changes based on the rider's current tier and the horse's tier.
                                    </div>
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={loading || !selectedBooking} className="w-full">
                                {loading ? "Submitting..." : "Submit Score"}
                            </Button>
                        </>
                    )}
                </form>

                <div className="mt-8 rounded-lg border border-border bg-card p-6">
                    <h3 className="mb-3 font-semibold">How Scoring Works</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• You rate the rider's performance from 1-10</li>
                        <li>• Scores 7+ = "Pass", scores 6 or below = "Fail"</li>
                        <li>• Points are calculated using a Payoff Matrix based on:
                            <ul className="mt-1 ml-4 list-disc space-y-1">
                                <li>Rider's current tier (Beginner/Intermediate/Advanced)</li>
                                <li>Horse's admin-assigned tier (set by administrators)</li>
                                <li>Your performance score (Pass/Fail)</li>
                            </ul>
                        </li>
                        <li>• Beginner riders get bonus points for passing advanced horses</li>
                        <li>• Advanced riders lose points for riding beginner horses</li>
                        <li>• Each ride can only be scored once</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
