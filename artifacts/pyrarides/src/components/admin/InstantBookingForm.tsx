"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Stable {
    id: string;
    name: string;
    horses: Array<{
        id: string;
        name: string;
        pricePerHour: number | null;
    }>;
}

export default function InstantBookingForm() {
    const [stables, setStables] = useState<Stable[]>([]);
    const [selectedStable, setSelectedStable] = useState("");
    const [selectedHorse, setSelectedHorse] = useState("");
    const [riderEmail, setRiderEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [verifiedRider, setVerifiedRider] = useState<{ fullName: string; id: string } | null>(null);
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoadingStables, setIsLoadingStables] = useState(true);

    // Fetch stables on mount
    useEffect(() => {
        async function fetchStables() {
            try {
                const res = await fetch("/api/stables?limit=100");
                if (res.ok) {
                    const data = await res.json();
                    setStables(data.stables || data);
                }
            } catch (error) {
                console.error("Error fetching stables:", error);
            } finally {
                setIsLoadingStables(false);
            }
        }
        fetchStables();
    }, []);

    // Get horses for selected stable
    const selectedStableData = stables.find(s => s.id === selectedStable);
    const horses = selectedStableData?.horses || [];

    // Verify rider email
    const verifyRider = async () => {
        if (!riderEmail) {
            toast.error("Please enter a rider email");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await fetch("/api/users/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: riderEmail }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Rider not found");
                setIsVerified(false);
                setVerifiedRider(null);
                return;
            }

            const data = await res.json();
            setIsVerified(true);
            setVerifiedRider({ fullName: data.user.fullName, id: data.user.id });
            toast.success(`Verified: ${data.user.fullName}`);
        } catch (error) {
            toast.error("Failed to verify rider");
            setIsVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };

    // Submit instant booking
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isVerified) {
            toast.error("Please verify the rider email first");
            return;
        }

        if (!selectedStable || !selectedHorse || !date || !startTime || !endTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/bookings/instant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    riderEmail,
                    horseId: selectedHorse,
                    stableId: selectedStable,
                    date,
                    startTime,
                    endTime,
                    notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create booking");
            }

            toast.success(data.message || "Instant booking created!");

            // Reset form
            setRiderEmail("");
            setIsVerified(false);
            setVerifiedRider(null);
            setSelectedHorse("");
            setDate("");
            setNotes("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create booking");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-primary" />
                    Register Instant Booking
                </CardTitle>
                <CardDescription className="text-white/60">
                    Create a booking for walk-in customers or past rides not booked through the site.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rider Email Verification */}
                    <div className="space-y-2">
                        <Label className="text-white">Rider Email *</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    type="email"
                                    placeholder="rider@example.com"
                                    value={riderEmail}
                                    onChange={(e) => {
                                        setRiderEmail(e.target.value);
                                        setIsVerified(false);
                                        setVerifiedRider(null);
                                    }}
                                    className="pl-10 bg-white/5 border-white/10 text-white"
                                    required
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={verifyRider}
                                disabled={isVerifying || !riderEmail}
                                variant={isVerified ? "default" : "secondary"}
                                className={isVerified ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {isVerifying ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isVerified ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    "Verify"
                                )}
                            </Button>
                        </div>
                        {isVerified && verifiedRider && (
                            <p className="text-sm text-green-400 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified: {verifiedRider.fullName}
                            </p>
                        )}
                    </div>

                    {/* Stable Selection */}
                    <div className="space-y-2">
                        <Label className="text-white">Stable *</Label>
                        <Select value={selectedStable} onValueChange={(val) => {
                            setSelectedStable(val);
                            setSelectedHorse("");
                        }}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder={isLoadingStables ? "Loading..." : "Select stable"} />
                            </SelectTrigger>
                            <SelectContent>
                                {stables.map((stable) => (
                                    <SelectItem key={stable.id} value={stable.id}>
                                        {stable.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Horse Selection */}
                    <div className="space-y-2">
                        <Label className="text-white">Horse *</Label>
                        <Select value={selectedHorse} onValueChange={setSelectedHorse} disabled={!selectedStable}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder={selectedStable ? "Select horse" : "Select stable first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {horses.map((horse) => (
                                    <SelectItem key={horse.id} value={horse.id}>
                                        {horse.name} {horse.pricePerHour ? `(EGP ${horse.pricePerHour}/hr)` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="text-white">Ride Date *</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                        <p className="text-xs text-white/40">Past dates are allowed for walk-in bookings</p>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Start Time *</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="pl-10 bg-white/5 border-white/10 text-white"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">End Time *</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="pl-10 bg-white/5 border-white/10 text-white"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="text-white">Notes (Optional)</Label>
                        <Textarea
                            placeholder="Any additional notes about this booking..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-white/5 border-white/10 text-white min-h-[80px]"
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isLoading || !isVerified}
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Booking...
                            </>
                        ) : (
                            "Create Instant Booking"
                        )}
                    </Button>

                    {!isVerified && (
                        <p className="text-center text-sm text-amber-400 flex items-center justify-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Please verify the rider email before submitting
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
