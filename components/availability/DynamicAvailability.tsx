
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
    // SSR Safety: Early return with defensive checks
    if (!grouped || typeof grouped !== 'object') {
        return <p className="text-xs text-muted-foreground">No available slots</p>;
    }

    // Defensive null checks for nested properties
    const todaySlots = grouped.today || { morning: [], afternoon: [], evening: [] };
    const tomorrowSlots = grouped.tomorrow || { morning: [], afternoon: [], evening: [] };

    // Safe array length checks
    const getTodayCount = () => {
        try {
            return (
                (todaySlots.morning?.length || 0) +
                (todaySlots.afternoon?.length || 0) +
                (todaySlots.evening?.length || 0) +
                (blocked?.today?.morning?.length || 0) +
                (blocked?.today?.afternoon?.length || 0) +
                (blocked?.today?.evening?.length || 0)
            );
        } catch {
            return 0;
        }
    };

    const getTomorrowCount = () => {
        try {
            return (
                (tomorrowSlots.morning?.length || 0) +
                (tomorrowSlots.afternoon?.length || 0) +
                (tomorrowSlots.evening?.length || 0) +
                (blocked?.tomorrow?.morning?.length || 0) +
                (blocked?.tomorrow?.afternoon?.length || 0) +
                (blocked?.tomorrow?.evening?.length || 0)
            );
        } catch {
            return 0;
        }
    };

    const hasToday = getTodayCount() > 0;
    const hasTomorrow = getTomorrowCount() > 0;

    if (!hasToday && !hasTomorrow) {
        return <p className="text-xs text-muted-foreground">No available slots</p>;
    }

    const renderPeriod = (title: string, emoji: string, times: string[] = [], blockedTimes: string[] = [], isTomorrow: boolean) => {
        // Additional safety checks
        if (!Array.isArray(times)) times = [];
        if (!Array.isArray(blockedTimes)) blockedTimes = [];

        if (times.length === 0 && blockedTimes.length === 0) return null;

        try {
            // Combine and sort times with error handling
            const allTimes = [
                ...times.map(t => ({ time: String(t), blocked: false })),
                ...blockedTimes.map(t => ({ time: String(t), blocked: true }))
            ];

            allTimes.sort((a, b) => {
                try {
                    const dateA = new Date(`2000/01/01 ${a.time}`);
                    const dateB = new Date(`2000/01/01 ${b.time}`);
                    return dateA.getTime() - dateB.getTime();
                } catch {
                    return 0; // Keep original order if parsing fails
                }
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
                                    if (!blocked && !isLocked && onSlotClick) {
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
        } catch (error) {
            // Graceful degradation if rendering fails
            console.error('Error rendering period:', error);
            return null;
        }
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
                    </div>
                )}

                {/* Tomorrow's Slots */}
                {hasTomorrow && (
                    <div className="mb-4">
                        {renderPeriod("Tomorrow: Morning", "🌅", tomorrowSlots.morning, blocked?.tomorrow.morning, true)}
                        {renderPeriod("Tomorrow: Afternoon", "☀", tomorrowSlots.afternoon, blocked?.tomorrow.afternoon, true)}
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
