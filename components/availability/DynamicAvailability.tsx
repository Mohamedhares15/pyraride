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
    horseId: string;
    onSlotClick: (horseId: string, time: string) => void;
}

export default function DynamicAvailability({ grouped, horseId, onSlotClick }: DynamicAvailabilityProps) {
    if (!grouped) {
        return <p className="text-xs text-muted-foreground">No available slots</p>;
    }

    const todaySlots = grouped.today;
    const tomorrowSlots = grouped.tomorrow;
    const hasToday = todaySlots.morning.length + todaySlots.afternoon.length + todaySlots.evening.length > 0;
    const hasTomorrow = tomorrowSlots.morning.length + tomorrowSlots.afternoon.length + tomorrowSlots.evening.length > 0;

    if (!hasToday && !hasTomorrow) {
        return <p className="text-xs text-muted-foreground">No available slots</p>;
    }

    const renderPeriod = (title: string, emoji: string, times: string[], isTomorrow: boolean) => {
        if (times.length === 0) return null;

        return (
            <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs">{emoji}</span>
                    <span className="text-xs text-muted-foreground">{title}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {times.map(time => (
                        <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            className="h-6 bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 hover:text-green-800 text-xs px-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSlotClick(horseId, time, isTomorrow);
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
        <>
            {/* Today's Slots */}
            {hasToday && (
                <div className="mb-4">
                    {renderPeriod("Today: Morning", "🌅", todaySlots.morning, false)}
                    {renderPeriod("Today: Afternoon", "☀", todaySlots.afternoon, false)}
                    {renderPeriod("Today: Evening", "🌙", todaySlots.evening, false)}
                </div>
            )}

            {/* Tomorrow's Slots */}
            {hasTomorrow && (
                <div className="mb-4">
                    {renderPeriod("Tomorrow: Morning", "🌅", tomorrowSlots.morning, true)}
                    {renderPeriod("Tomorrow: Afternoon", "☀", tomorrowSlots.afternoon, true)}
                    {renderPeriod("Tomorrow: Evening", "🌙", tomorrowSlots.evening, true)}
                </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Updated every 30 seconds</span>
            </div>
        </>
    );
}
