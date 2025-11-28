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
    user: {
        id: string;
        fullName: string | null;
        email: string;
    };
    horse: {
        id: string;
        name: string;
    };
    stable: {
        id: string;
        name: string;
    };
}

export default function ScoreRidePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<string>("");
    const [performance, setPerformance] = useState([5]);
    const [difficulty, setDifficulty] = useState([5]);
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
                // Filter out already scored bookings
                const unscoredBookings = data.bookings || [];
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
                    performance: performance[0],
                    difficulty: difficulty[0],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    `Ride scored! Rider: ${data.riderPointsChange > 0 ? "+" : ""}${data.riderPointsChange} pts, Horse: ${data.horsePointsChange > 0 ? "+" : ""}${data.horsePointsChange} pts`
                );
                // Reset form
                setSelectedBooking("");
                setPerformance([5]);
                setDifficulty([5]);
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
                                                        {booking.user.fullName || booking.user.email}
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
                            {/* Performance Score */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Performance Score
                                    </CardTitle>
                                    <CardDescription>
                                        How well did the rider perform? (0 = Poor, 10 = Excellent)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Score: {performance[0]}/10</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {performance[0] <= 3 && "Needs Improvement"}
                                            {performance[0] > 3 && performance[0] <= 6 && "Good"}
                                            {performance[0] > 6 && performance[0] <= 8 && "Very Good"}
                                            {performance[0] > 8 && "Excellent"}
                                        </span>
                                    </div>
                                    <Slider
                                        value={performance}
                                        onValueChange={setPerformance}
                                        min={0}
                                        max={10}
                                        step={1}
                                        className="w-full"
                                    />
                                </CardContent>
                            </Card>

                            {/* Difficulty Level */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Difficulty Level</CardTitle>
                                    <CardDescription>
                                        How difficult was the ride? (0 = Very Easy, 10 = Very Difficult)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Difficulty: {difficulty[0]}/10</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {difficulty[0] <= 3 && "Easy"}
                                            {difficulty[0] > 3 && difficulty[0] <= 6 && "Moderate"}
                                            {difficulty[0] > 6 && difficulty[0] <= 8 && "Challenging"}
                                            {difficulty[0] > 8 && "Very Difficult"}
                                        </span>
                                    </div>
                                    <Slider
                                        value={difficulty}
                                        onValueChange={setDifficulty}
                                        min={0}
                                        max={10}
                                        step={1}
                                        className="w-full"
                                    />
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
                        <li>• Ratings are calculated using an Elo-style system</li>
                        <li>• Performance and difficulty affect point changes</li>
                        <li>• Rider rank and horse tier influence the payoff multiplier</li>
                        <li>• Both rider and horse ratings are updated based on the score</li>
                        <li>• Each ride can only be scored once</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
