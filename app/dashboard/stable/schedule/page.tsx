"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Ban, Clock } from "lucide-react";
import { toast } from "sonner";

export default function SchedulePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(startOfToday());
    const [horses, setHorses] = useState<{ id: string; name: string }[]>([]);
    const [selectedHorse, setSelectedHorse] = useState<string>("all");
    const [slots, setSlots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stableId, setStableId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "stable_owner") {
            router.push("/dashboard");
            return;
        }
        fetchHorses();
    }, [session, status, router]);

    useEffect(() => {
        if (date && stableId) {
            fetchSlots();
        }
    }, [date, selectedHorse, stableId]);

    async function fetchHorses() {
        try {
            const res = await fetch("/api/stables/horses"); // Need to ensure this endpoint exists or use similar
            // Actually, we can fetch stable details which includes horses
            const stableRes = await fetch("/api/stables?ownerOnly=true");
            const data = await stableRes.json();
            if (data.stables && data.stables.length > 0) {
                setStableId(data.stables[0].id);
                setHorses(data.stables[0].horses || []);
            }
        } catch (err) {
            console.error("Error fetching horses:", err);
        }
    }

    async function fetchSlots() {
        if (!stableId || !date) return;
        setIsLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const horseQuery = selectedHorse !== "all" ? `&horseId=${selectedHorse}` : "";
            const res = await fetch(`/api/stables/${stableId}/slots?date=${formattedDate}${horseQuery}`);
            if (res.ok) {
                setSlots(await res.json());
            }
        } catch (err) {
            console.error("Error fetching slots:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleBlockSlot(startTime: string) {
        if (!stableId) return;

        try {
            const res = await fetch("/api/stables/block-slot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stableId: stableId,
                    horseId: selectedHorse === "all" ? null : selectedHorse,
                    startTime,
                    endTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour block
                }),
            });

            if (res.ok) {
                toast.success("Slot blocked successfully");
                fetchSlots();
            } else {
                toast.error("Failed to block slot");
            }
        } catch (err) {
            console.error("Error blocking slot:", err);
            toast.error("Error blocking slot");
        }
    }

    if (status === "loading") return <Loader2 className="h-8 w-8 animate-spin" />;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-bold">Schedule Management</h1>
                    <p className="text-muted-foreground">
                        Manage availability and block slots for your stable or specific horses.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                    <div className="space-y-4">
                        <Card className="p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                disabled={(date) => date < startOfToday()}
                            />
                        </Card>

                        <Card className="p-4">
                            <Label className="mb-2 block">Filter by Horse</Label>
                            <Select value={selectedHorse} onValueChange={setSelectedHorse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Horses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Horses (Entire Stable)</SelectItem>
                                    {horses.map((horse) => (
                                        <SelectItem key={horse.id} value={horse.id}>
                                            {horse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Card>
                    </div>

                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-semibold">
                            Availability for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {slots.length > 0 ? (
                                    slots.map((slot, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto flex-col gap-1 p-4"
                                            onClick={() => handleBlockSlot(slot.startTime)}
                                        >
                                            <Clock className="h-4 w-4" />
                                            <span>{format(new Date(slot.startTime), "h:mm a")}</span>
                                            <span className="text-xs text-green-600">Available</span>
                                        </Button>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-muted-foreground">
                                        No available slots found for this date.
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
