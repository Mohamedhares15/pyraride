"use client";

import { useState, useEffect, useMemo } from "react";
import { format, addDays, startOfToday } from "date-fns";
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
    const [timeView, setTimeView] = useState<"sunrise" | "sunset" | "all">("sunrise");

    // Generate time slots based on selected view
    const timeSlots = useMemo(() => {
        const slots: string[] = [];

        const addRange = (startHour: number, endHour: number) => {
            for (let h = startHour; h < endHour; h++) {
                slots.push(`${h}:00`);
                slots.push(`${h}:30`);
            }
        };

        if (timeView === "sunrise" || timeView === "all") {
            // Sunrise window: 3:00 AM – 9:00 AM
            // Include 3:00 to 9:00 (since slots are 1 hour, last slot starts at 8:00 and ends at 9:00)
            addRange(3, 9); // 3:00, 3:30, ... 8:00, 8:30
        }

        if (timeView === "sunset" || timeView === "all") {
            // Sunset window: 1:00 PM (13:00) – 7:00 PM (19:00)
            // Include 13:00 to 19:00 (since slots are 1 hour, last slot starts at 18:00 and ends at 19:00)
            addRange(13, 19); // 13:00, 13:30, ... 18:00, 18:30
        }

        return slots;
    }, [timeView]);

    // Fetch slots when date changes
    useEffect(() => {
        if (stableId) {
            fetchSlots();
        }
    }, [date, stableId]);

    async function fetchSlots() {
        setIsLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            console.log(`[ScheduleGrid] Fetching slots for date: ${formattedDate}, stableId: ${stableId}`);

            const res = await fetch(`/api/stables/${stableId}/slots?date=${formattedDate}`);

            console.log(`[ScheduleGrid] Fetch response status: ${res.status}`);

            if (res.ok) {
                const data = await res.json();
                console.log(`[ScheduleGrid] Fetched ${data.length} slots:`, data);
                setSlots(data);
            } else {
                const errorText = await res.text();
                console.error(`[ScheduleGrid] Failed to fetch slots (${res.status}):`, errorText);
                toast.error(`Failed to load schedule: ${res.status} - ${errorText.slice(0, 50)}`);
            }
        } catch (error) {
            console.error("[ScheduleGrid] Error fetching slots:", error);
            toast.error(`Failed to load schedule: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }

    // Helper to find slot for a specific horse and time
    const getSlot = (horseId: string, timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const currentDateStr = format(date, "yyyy-MM-dd");

        // Find the most relevant slot (prioritize real slots over temp ones)
        const matchingSlots = slots.filter(slot => {
            const slotDate = new Date(slot.startTime);
            const slotDateStr = format(slotDate, "yyyy-MM-dd");
            const slotHours = slotDate.getHours();
            const slotMinutes = slotDate.getMinutes();

            // Check if this slot belongs to this horse (or is stable-wide)
            const isForHorse = slot.horseId === horseId || slot.horseId === null;

            // Match date, time, and horse
            return (
                slotDateStr === currentDateStr &&
                isForHorse &&
                slotHours === hours &&
                slotMinutes === minutes
            );
        });

        // Prioritize real slots (those with UUID-like IDs, not temp random IDs)
        const realSlot = matchingSlots.find(slot => slot.id && slot.id.length > 20);
        return realSlot || matchingSlots[0];
    };

    async function handleSlotClick(horseId: string, timeStr: string) {
        const slot = getSlot(horseId, timeStr);

        // 1. If booked, show details
        if (slot?.isBooked) {
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
            console.log(`[ScheduleGrid] Attempting to delete slot:`, slot);

            // Optimistic update
            const previousSlots = [...slots];
            setSlots(slots.filter(s => s.id !== slot.id));

            try {
                const res = await fetch(`/api/stables/${stableId}/slots?slotId=${slot.id}`, {
                    method: "DELETE",
                });

                console.log(`[ScheduleGrid] Delete response status: ${res.status}`);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`[ScheduleGrid] Delete failed (${res.status}):`, errorText);
                    throw new Error(`Delete failed: ${res.status} - ${errorText.slice(0, 50)}`);
                }

                console.log("[ScheduleGrid] Slot deleted successfully");
                toast.success("Slot removed");
                // Refresh to ensure UI is in sync
                setTimeout(() => fetchSlots(), 300);
            } catch (error) {
                console.error("[ScheduleGrid] Delete error:", error);
                setSlots(previousSlots); // Revert
                toast.error(`Failed to remove slot: ${error}`);
                // Refresh to ensure we have correct state
                setTimeout(() => fetchSlots(), 300);
            }
            return;
        }

        // 3. If unavailable (doesn't exist), create it (make available)
        const [hours, minutes] = timeStr.split(":").map(Number);

        console.log(`[ScheduleGrid] Creating slot for horse ${horseId} at ${timeStr}`);

        // Optimistic update (create a temp slot)
        const tempId = Math.random().toString();
        const startTime = new Date(date);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

        const newSlot = {
            id: tempId,
            horseId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: false,
        };

        setSlots([...slots, newSlot]);

        const payload = {
            date: format(date, "yyyy-MM-dd"),
            startTime: timeStr,
            endTime: `${hours + 1}:${minutes === 0 ? "00" : minutes}`,
            horseId,
            duration: 60,
        };

        console.log(`[ScheduleGrid] POST payload:`, payload);

        try {
            const res = await fetch(`/api/stables/${stableId}/slots`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            console.log(`[ScheduleGrid] Create response status: ${res.status}`);

            if (res.ok) {
                const responseData = await res.json();
                console.log("[ScheduleGrid] Create response:", responseData);

                // Remove optimistic update immediately
                setSlots(prevSlots => prevSlots.filter(s => s.id !== tempId));

                if (responseData.count > 0) {
                    toast.success(`Slot created successfully`);
                } else if (responseData.skipped > 0) {
                    toast.info(`Slot already exists`);
                } else {
                    toast.warning(`No slots were created`);
                }

                // Fetch real slots from database to ensure UI is in sync
                setTimeout(() => fetchSlots(), 300);
            } else {
                const errorText = await res.text();
                console.error(`[ScheduleGrid] Create failed (${res.status}):`, errorText);
                throw new Error(`Create failed: ${res.status} - ${errorText.slice(0, 100)}`);
            }
        } catch (error) {
            console.error("[ScheduleGrid] Create error:", error);
            // Remove optimistic update on error
            setSlots(prevSlots => prevSlots.filter(s => s.id !== tempId));
            toast.error(`Failed to create slot: ${error}`);
            // Fetch to ensure we have correct state
            setTimeout(() => fetchSlots(), 300);
        }
    }

    return (
        <div className="space-y-6">
            {/* Date Header - Golden/Glass Style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDate(addDays(date, -1))}
                        className="text-white hover:bg-white/10 hover:text-white rounded-full"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold min-w-[220px] text-center font-display text-white drop-shadow-lg">
                        {format(date, "EEEE, MMMM d")}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDate(addDays(date, 1))}
                        className="text-white hover:bg-white/10 hover:text-white rounded-full"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm font-medium">
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-md bg-white/5 border border-white/20" />
                            <span className="text-white/60">Unavailable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-md bg-gradient-to-br from-[rgba(218,165,32,0.3)] to-[rgba(184,134,11,0.2)] border border-[rgba(218,165,32,0.5)] shadow-[0_0_10px_rgba(218,165,32,0.2)]" />
                            <span className="text-[rgb(218,165,32)]">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-md bg-rose-500/20 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]" />
                            <span className="text-rose-400">Booked</span>
                        </div>
                    </div>

                    {/* Time view toggle: Sunrise / Sunset / All */}
                    <div className="flex items-center gap-2 bg-black/30 rounded-full px-2 py-1 border border-white/10">
                        <span className="text-xs text-white/50 hidden md:inline-block pr-1">
                            View:
                        </span>
                        <button
                            type="button"
                            onClick={() => setTimeView("sunrise")}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                timeView === "sunrise"
                                    ? "bg-[rgb(218,165,32)] text-black shadow-[0_0_15px_rgba(218,165,32,0.6)]"
                                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Sunrise (3–9 AM)
                        </button>
                        <button
                            type="button"
                            onClick={() => setTimeView("sunset")}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                timeView === "sunset"
                                    ? "bg-[rgb(218,165,32)] text-black shadow-[0_0_15px_rgba(218,165,32,0.6)]"
                                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Sunset (1–7 PM)
                        </button>
                        <button
                            type="button"
                            onClick={() => setTimeView("all")}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                timeView === "all"
                                    ? "bg-[rgb(218,165,32)] text-black shadow-[0_0_15px_rgba(218,165,32,0.6)]"
                                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            All
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid - Golden/Glass Style */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid border-b border-white/10 bg-white/5" style={{ gridTemplateColumns: `100px repeat(${horses.length}, minmax(120px, 1fr))` }}>
                            <div className="p-4 font-semibold text-white/70 text-sm border-r border-white/10 sticky left-0 bg-white/10 backdrop-blur-md z-20">
                                Time
                            </div>
                            {horses.map(horse => (
                                <div key={horse.id} className="p-4 font-semibold text-center text-white border-r border-white/10 last:border-r-0 truncate">
                                    {horse.name}
                                </div>
                            ))}
                        </div>

                        {/* Time Rows */}
                        {isLoading ? (
                            <div className="p-24 flex justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-[rgb(218,165,32)]" />
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {timeSlots.map(time => (
                                    <div key={time} className="grid hover:bg-white/[0.02] transition-colors" style={{ gridTemplateColumns: `100px repeat(${horses.length}, minmax(120px, 1fr))` }}>
                                        <div className="p-4 text-sm text-white/50 border-r border-white/10 flex items-center justify-center sticky left-0 bg-white/5 backdrop-blur-md z-10 font-medium">
                                            {time}
                                        </div>
                                        {horses.map(horse => {
                                            const slot = getSlot(horse.id, time);
                                            return (
                                                <div key={`${horse.id}-${time}`} className="p-2 border-r border-white/5 last:border-r-0">
                                                    <button
                                                        onClick={() => handleSlotClick(horse.id, time)}
                                                        className={cn(
                                                            "w-full h-full min-h-[50px] rounded-xl transition-all duration-300 border font-medium text-sm",
                                                            // Unavailable
                                                            !slot && "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/30",
                                                            // Available - GOLDEN GRADIENT
                                                            slot && !slot.isBooked && "bg-gradient-to-br from-[rgba(218,165,32,0.25)] to-[rgba(184,134,11,0.15)] border-[rgba(218,165,32,0.4)] hover:from-[rgba(218,165,32,0.35)] hover:to-[rgba(184,134,11,0.25)] hover:border-[rgba(218,165,32,0.6)] text-[rgb(218,165,32)] shadow-[0_0_20px_rgba(218,165,32,0.15)] hover:shadow-[0_0_30px_rgba(218,165,32,0.3)]",
                                                            // Booked
                                                            slot?.isBooked && "bg-gradient-to-br from-rose-500/20 to-rose-600/15 border-rose-500/40 hover:from-rose-500/30 hover:to-rose-600/25 hover:border-rose-500/60 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
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
