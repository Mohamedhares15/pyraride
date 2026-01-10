
"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

type TimePeriod = 'morning' | 'afternoon' | 'evening';

interface GroupedSlots {
    morning: string[];
    afternoon: string[];
    evening: string[];
}

interface DayGroupedSlots {
    today: GroupedSlots;
    tomorrow: GroupedSlots;
}

interface DynamicAvailabilityProps {
    grouped: DayGroupedSlots | null | undefined;
    blocked?: DayGroupedSlots | null | undefined;
    horseId: string;
    onSlotClick: (horseId: string, time: string, isTomorrow?: boolean) => void;
    isLocked?: boolean;
}

export default function DynamicAvailability({ grouped, blocked, horseId, onSlotClick, isLocked }: DynamicAvailabilityProps) {
    if (!grouped) {
        return <p className="text-xs text-muted-foreground">No available slots</p>;
    }

    const todaySlots = grouped.today;
    const tomorrowSlots = grouped.tomorrow;

    // Check if we have any slots at all (available or blocked)
    const hasToday = (
        todaySlots.morning.length + todaySlots.afternoon.length + todaySlots.evening.length +
        (blocked?.today.morning.length || 0) + (blocked?.today.afternoon.length || 0) + (blocked?.today.evening.length || 0)
    ) > 0;

    const hasTomorrow = (
        tomorrowSlots.morning.length + tomorrowSlots.afternoon.length + tomorrowSlots.evening.length +
        (blocked?.tomorrow.morning.length || 0) + (blocked?.tomorrow.afternoon.length || 0) + (blocked?.tomorrow.evening.length || 0)
    ) > 0;

    if (!hasToday && !hasTomorrow) {
        return <p className="text-xs text-muted-foreground">No available slots</p>;
    }

    const renderPeriod = (title: string, emoji: string, times: string[], blockedTimes: string[] = [], isTomorrow: boolean) => {
        if (times.length === 0 && blockedTimes.length === 0) return null;

        // Combine and sort times
        const allTimes = [...times.map(t => ({ time: t, blocked: false })), ...blockedTimes.map(t => ({ time: t, blocked: true }))];
        allTimes.sort((a, b) => {
            const dateA = new Date(`2000/01/01 ${a.time}`);
            const dateB = new Date(`2000/01/01 ${b.time}`);
            return dateA.getTime() - dateB.getTime();
        });

        return (
            <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs">{emoji}</span>
                    <span className="text-xs text-muted-foreground">{title}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {allTimes.map(({ time, blocked }) => (
                        <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            disabled={blocked || isLocked}
                            className={`h-6 text-xs px-2 ${blocked
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 hover:text-green-800"
                                }`}
                            onClick={(e) => {
                                if (!blocked && !isLocked) {
                                    e.stopPropagation();
                                    onSlotClick(horseId, time, isTomorrow);
                                }
                            }}
                        >
                            {time}
                        </Button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="relative">
            {isLocked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-md">
                    <div className="bg-background/90 px-3 py-2 rounded shadow-sm border text-xs font-medium text-muted-foreground text-center">
                        You still didn&apos;t open this horse level
                    </div>
                </div>
            )}

            <div className={isLocked ? "opacity-50 pointer-events-none select-none filter blur-[1px]" : ""}>
                {/* Today's Slots */}
                {hasToday && (
                    <div className="mb-4">
                        {renderPeriod("Today: Morning", "🌅", todaySlots.morning, blocked?.today.morning, false)}
                        {renderPeriod("Today: Afternoon", "☀", todaySlots.afternoon, blocked?.today.afternoon, false)}
                        {renderPeriod("Today: Evening", "🌙", todaySlots.evening, blocked?.today.evening, false)}
                    </div>
                )}

                {/* Tomorrow's Slots */}
                {hasTomorrow && (
                    <div className="mb-4">
                        {renderPeriod("Tomorrow: Morning", "🌅", tomorrowSlots.morning, blocked?.tomorrow.morning, true)}
                        {renderPeriod("Tomorrow: Afternoon", "☀", tomorrowSlots.afternoon, blocked?.tomorrow.afternoon, true)}
                        {renderPeriod("Tomorrow: Evening", "🌙", tomorrowSlots.evening, blocked?.tomorrow.evening, true)}
                    </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated every 30 seconds</span>
                </div>
            </div>
        </div>
    );
}
