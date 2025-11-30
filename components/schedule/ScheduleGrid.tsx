"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday, set } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingDetailsDialog } from "./BookingDetailsDialog";

interface ScheduleGridProps {
    stableId: string;
    horses: { id: string; name: string }[];
}

export function ScheduleGrid({ stableId, horses }: ScheduleGridProps) {
    const [date, setDate] = useState<Date>(startOfToday());
    const [slots, setSlots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

    // Generate time slots (8 AM to 10 PM in 30 min increments)
    const timeSlots = [];
    for (let i = 8; i < 22; i++) {
        timeSlots.push(`${i}:00`);
        timeSlots.push(`${i}:30`);
    }

    // Fetch slots when date changes
    useEffect(() => {
        fetchSlots();
    }, [date, stableId]);

    async function fetchSlots() {
        setIsLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const res = await fetch(`/api/stables/${stableId}/slots?date=${formattedDate}`);
            if (res.ok) {
                setSlots(await res.json());
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Failed to load schedule");
        } finally {
            setIsLoading(false);
        }
    }

    // Helper to find slot for a specific horse and time
    const getSlot = (horseId: string, timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);

        return slots.find(slot => {
            const slotDate = new Date(slot.startTime);
            const slotHours = slotDate.getHours();
            const slotMinutes = slotDate.getMinutes();

            // Check if this slot belongs to this horse (or is stable-wide)
            const isForHorse = slot.horseId === horseId || slot.horseId === null;

            return isForHorse && slotHours === hours && slotMinutes === minutes;
        });
    };

    async function handleSlotClick(horseId: string, timeStr: string) {
        const slot = getSlot(horseId, timeStr);

        // 1. If booked, show details
        if (slot?.isBooked) {
            // Fetch full booking details if needed, or use what's in the slot if we included it
            // For now, we'll assume the slot object has the booking info nested or we fetch it
            // The current API might need to include booking details in the slot response
            // Let's assume the API returns booking info if isBooked is true
            if (slot.booking) {
                setSelectedBooking(slot.booking);
                setIsBookingDialogOpen(true);
            } else {
                toast.error("Booking details not available");
            }
            return;
        }

        // 2. If available (exists but not booked), delete it (make unavailable)
        if (slot) {
            // Optimistic update
            const previousSlots = [...slots];
            setSlots(slots.filter(s => s.id !== slot.id));

            try {
                const res = await fetch(`/api/stables/${stableId}/slots?slotId=${slot.id}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error();
            } catch {
                setSlots(previousSlots); // Revert
                toast.error("Failed to remove slot");
            }
            return;
        }

        // 3. If unavailable (doesn't exist), create it (make available)
        const [hours, minutes] = timeStr.split(":").map(Number);

        // Optimistic update (create a temp slot)
        const tempId = Math.random().toString();
        const startTime = new Date(date);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour for now

        const newSlot = {
            id: tempId,
            horseId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: false,
        };

        setSlots([...slots, newSlot]);

        try {
            const res = await fetch(`/api/stables/${stableId}/slots`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: format(date, "yyyy-MM-dd"),
                    startTime: timeStr,
                    endTime: `${hours + 1}:${minutes === 0 ? "00" : minutes}`, // Default 1 hour
                    horseId,
                    duration: 60,
                }),
            });

            if (res.ok) {
                // Refresh to get real ID
                fetchSlots();
            } else {
                throw new Error();
            }
        } catch {
            setSlots(slots); // Revert
            toast.error("Failed to create slot");
        }
    }

    return (
        <div className="space-y-6">
            {/* Date Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDate(addDays(date, -1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold min-w-[200px] text-center">
                        {format(date, "EEEE, MMMM d")}
                    </h2>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDate(addDays(date, 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-muted/30 border border-border" />
                        <span className="text-muted-foreground">Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-primary/20 border border-primary/50" />
                        <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-red-500/20 border border-red-500/50" />
                        <span className="text-muted-foreground">Booked</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid border-b bg-muted/40" style={{ gridTemplateColumns: `80px repeat(${horses.length}, 1fr)` }}>
                            <div className="p-4 font-medium text-muted-foreground text-sm border-r sticky left-0 bg-muted/40 z-10">
                                Time
                            </div>
                            {horses.map(horse => (
                                <div key={horse.id} className="p-4 font-medium text-center border-r last:border-r-0 truncate px-2">
                                    {horse.name}
                                </div>
                            ))}
                        </div>

                        {/* Time Rows */}
                        {isLoading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="divide-y">
                                {timeSlots.map(time => (
                                    <div key={time} className="grid hover:bg-muted/5 transition-colors" style={{ gridTemplateColumns: `80px repeat(${horses.length}, 1fr)` }}>
                                        <div className="p-3 text-xs text-muted-foreground border-r flex items-center justify-center sticky left-0 bg-card z-10 font-medium">
                                            {time}
                                        </div>
                                        {horses.map(horse => {
                                            const slot = getSlot(horse.id, time);
                                            return (
                                                <div key={`${horse.id}-${time}`} className="p-1 border-r last:border-r-0">
                                                    <button
                                                        onClick={() => handleSlotClick(horse.id, time)}
                                                        className={cn(
                                                            "w-full h-full min-h-[40px] rounded-md transition-all duration-200 border",
                                                            // State Styles
                                                            !slot && "bg-muted/10 border-transparent hover:bg-muted/20 hover:border-border/50", // Unavailable
                                                            slot && !slot.isBooked && "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 text-primary text-xs font-medium", // Available
                                                            slot?.isBooked && "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-600 text-xs font-medium" // Booked
                                                        )}
                                                    >
                                                        {slot?.isBooked ? "Booked" : slot ? "Available" : ""}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BookingDetailsDialog
                open={isBookingDialogOpen}
                onOpenChange={setIsBookingDialogOpen}
                booking={selectedBooking}
            />
        </div>
    );
}
