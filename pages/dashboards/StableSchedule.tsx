import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle } from "@/components/shared/DashShell";
import { STABLES, HORSES } from "@/lib/mock-data/seed";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 - 19:00

function startOfWeek(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(d.getDate() - d.getDay());
  return out;
}

const StableSchedule = () => {
  const stable = STABLES[0];
  const horses = HORSES.filter((h) => h.stableId === stable.id).slice(0, 6);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Fake booking data: keyed by `${dayIdx}-${hour}-${horseId}`
  const bookings = new Map<string, { rider: string }>();
  horses.forEach((h, hi) => {
    [0, 2, 4, 5].forEach((di) => {
      [(7 + hi) % 14 + 6, (10 + hi) % 14 + 6].forEach((hr) => {
        bookings.set(`${di}-${hr}-${h.id}`, { rider: ["Y. Akel", "O. Karim", "L. Tabet", "H. Murad"][(di + hr) % 4] });
      });
    });
  });

  const shift = (delta: number) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(next);
  };

  const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <>
      <SubNav kind="stable" />
      <DashShell
        eyebrow="Stable Owner"
        title="Schedule"
        subtitle="Week-at-a-glance for every horse on the roster."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => shift(-1)} className="size-10 border hairline inline-flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"><ChevronLeft className="size-4" /></button>
            <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-4 py-2.5 border hairline text-[11px] tracking-[0.18em] uppercase">Today</button>
            <button onClick={() => shift(1)} className="size-10 border hairline inline-flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"><ChevronRight className="size-4" /></button>
          </div>
        }
      >
        <SectionTitle title={`Week of ${fmtDay(days[0])}`} />

        {horses.map((h) => (
          <div key={h.id} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <img src={h.imageUrls[0]} alt="" className="size-9 rounded-full object-cover" />
              <h3 className="font-display text-2xl">{h.name}</h3>
              <span className="text-[11px] tracking-luxury uppercase text-ink-muted">{h.adminTier}</span>
            </div>
            <div className="border hairline overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b hairline">
                    <th className="text-left px-3 py-2 text-[10px] tracking-luxury uppercase text-ink-muted font-normal w-16">Hour</th>
                    {days.map((d, i) => (
                      <th key={i} className="text-left px-3 py-2 text-[10px] tracking-luxury uppercase text-ink-muted font-normal">{fmtDay(d)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hr) => (
                    <tr key={hr} className="border-b hairline last:border-0">
                      <td className="px-3 py-1.5 tabular-nums text-ink-muted">{String(hr).padStart(2, "0")}:00</td>
                      {days.map((_, di) => {
                        const cell = bookings.get(`${di}-${hr}-${h.id}`);
                        return (
                          <td key={di} className="px-1.5 py-1">
                            <button
                              onClick={() => toast(cell ? `Booked: ${cell.rider}` : "Slot is open. Click to block.")}
                              className={cn(
                                "h-7 w-full text-[10px] tracking-luxury uppercase transition-colors",
                                cell ? "bg-foreground text-background" : "bg-surface-elevated/40 hover:bg-surface-elevated text-ink-muted",
                              )}
                            >
                              {cell ? cell.rider.split(" ")[0] : "·"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </DashShell>
    </>
  );
};

export default StableSchedule;
