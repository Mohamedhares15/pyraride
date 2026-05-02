import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

type TimePeriod = "morning" | "afternoon" | "evening";

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
  selectedDate?: Date;
  ownerToggledSlots?: Set<string>;
}

const EMPTY_GROUP: GroupedSlots = { morning: [], afternoon: [], evening: [] };

export default function DynamicAvailability({
  grouped,
  blocked,
  horseId,
  onSlotClick,
  isLocked,
  selectedDate,
  ownerToggledSlots,
}: DynamicAvailabilityProps) {
  if (!grouped || typeof grouped !== "object") {
    return <p className="text-xs text-muted-foreground">No available slots</p>;
  }

  const todaySlots = grouped.today ?? EMPTY_GROUP;
  const tomorrowSlots = grouped.tomorrow ?? EMPTY_GROUP;

  const countSlots = (day: GroupedSlots, blockedDay?: GroupedSlots) =>
    (day.morning?.length ?? 0) +
    (day.afternoon?.length ?? 0) +
    (day.evening?.length ?? 0) +
    (blockedDay?.morning?.length ?? 0) +
    (blockedDay?.afternoon?.length ?? 0) +
    (blockedDay?.evening?.length ?? 0);

  const hasToday = countSlots(todaySlots, blocked?.today) > 0;
  const hasTomorrow = countSlots(tomorrowSlots, blocked?.tomorrow) > 0;

  if (!hasToday && !hasTomorrow) {
    return <p className="text-xs text-muted-foreground">No available slots</p>;
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const todayDate = selectedDate ? new Date(selectedDate) : new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const renderPeriod = (
    title: string,
    emoji: string,
    times: string[] = [],
    blockedTimes: string[] = [],
    isTomorrow: boolean,
  ) => {
    if (times.length === 0 && blockedTimes.length === 0) return null;

    const allTimes: { time: string; blocked: boolean }[] = [
      ...times.map((t) => {
        const key = `${horseId}-${isTomorrow}-${t}`;
        return { time: t, blocked: ownerToggledSlots?.has(key) ?? false };
      }),
      ...blockedTimes.map((t) => {
        const key = `${horseId}-${isTomorrow}-${t}`;
        return { time: t, blocked: !(ownerToggledSlots?.has(key)) };
      }),
    ].sort((a, b) => {
      const da = new Date(`2000/01/01 ${a.time}`);
      const db = new Date(`2000/01/01 ${b.time}`);
      return da.getTime() - db.getTime();
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
              disabled={isLocked}
              className={`h-6 text-xs px-2 ${
                blocked
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 hover:text-green-800"
              }`}
              onClick={(e) => {
                if (!isLocked && onSlotClick) {
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
        {hasToday && (
          <div className="mb-4">
            {renderPeriod(`${formatDate(todayDate)}: Morning`, "🌅", todaySlots.morning, blocked?.today.morning, false)}
            {renderPeriod(`${formatDate(todayDate)}: Afternoon`, "☀", todaySlots.afternoon, blocked?.today.afternoon, false)}
          </div>
        )}
        {hasTomorrow && (
          <div className="mb-4">
            {renderPeriod(`${formatDate(tomorrowDate)}: Morning`, "🌅", tomorrowSlots.morning, blocked?.tomorrow.morning, true)}
            {renderPeriod(`${formatDate(tomorrowDate)}: Afternoon`, "☀", tomorrowSlots.afternoon, blocked?.tomorrow.afternoon, true)}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Tap a slot to book instantly</span>
        </div>
      </div>
    </div>
  );
}
