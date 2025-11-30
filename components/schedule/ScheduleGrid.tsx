"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Phone, Star } from "lucide-react";
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
            if (slot.booking) {
                setSelectedBooking(slot.booking);
                setIsBookingDialogOpen(true);
            } else {
                // If booking details aren't nested, we might need to fetch them or show a placeholder
                // For now, let's assume the API returns them or we show a basic message
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
            {/* Date Header - Dark/Glass Style */}
            <div className="flex items-center justify-between bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDate(addDays(date, -1))}
                        className="text-white hover:bg-white/10 hover:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-bold min-w-[200px] text-center font-display">
                        {format(date, "EEEE, MMMM d")}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDate(addDays(date, 1))}
                        className="text-white hover:bg-white/10 hover:text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-white/10 border border-white/20" />
                        <span className="text-white/60">Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
                        <span className="text-emerald-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500/20 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]" />
                        <span className="text-rose-400">Booked</span>
                    </div>
                </div>
            </div>

            {/* Grid - Dark/Glass Style */}
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid border-b border-white/10 bg-white/5" style={{ gridTemplateColumns: `80px repeat(${horses.length}, 1fr)` }}>
                            <div className="p-4 font-semibold text-white/70 text-sm border-r border-white/10 sticky left-0 bg-black/60 backdrop-blur-md z-20">
                                Time
                            </div>
                            {horses.map(horse => (
                                <div key={horse.id} className="p-4 font-semibold text-center text-white border-r border-white/10 last:border-r-0 truncate px-2">
                                    {horse.name}
                                </div>
                            ))}
                        </div>

                        {/* Time Rows */}
                        {isLoading ? (
                            <div className="p-20 flex justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-white/50" />
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {timeSlots.map(time => (
                                    <div key={time} className="grid hover:bg-white/[0.02] transition-colors group" style={{ gridTemplateColumns: `80px repeat(${horses.length}, 1fr)` }}>
                                        <div className="p-3 text-xs text-white/50 border-r border-white/10 flex items-center justify-center sticky left-0 bg-black/40 backdrop-blur-md z-10 font-medium group-hover:bg-black/50 transition-colors">
                                            {time}
                                        </div>
                                        {horses.map(horse => {
                                            const slot = getSlot(horse.id, time);
                                            return (
                                                <div key={`${horse.id}-${time}`} className="p-1 border-r border-white/5 last:border-r-0">
                                                    <button
                                                        onClick={() => handleSlotClick(horse.id, time)}
                                                        className={cn(
                                                            "w-full h-full min-h-[44px] rounded-lg transition-all duration-300 border backdrop-blur-sm",
                                                            // State Styles
                                                            !slot && "bg-white/[0.02] border-transparent hover:bg-white/[0.08] hover:border-white/20", // Unavailable
                                                            slot && !slot.isBooked && "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 text-xs font-medium shadow-[0_0_15px_rgba(16,185,129,0.05)]", // Available
                                                            slot?.isBooked && "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 text-rose-400 text-xs font-medium shadow-[0_0_15px_rgba(244,63,94,0.05)]" // Booked
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
