import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { packages } from "@/data/mock";
import { Reveal, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

type Booking = { id: string; date: Date; time: string; guest: string; packageId: string; party: number; status: "confirmed" | "pending" };

const today = new Date();
const day = (offset: number, h = 6) => {
  const d = new Date(today); d.setDate(today.getDate() + offset); d.setHours(h, 0, 0, 0); return d;
};

const BOOKINGS: Booking[] = [
  { id: "b1", date: day(0, 6),  time: "06:00", guest: "Devereux",        packageId: "p1", party: 2, status: "confirmed" },
  { id: "b2", date: day(0, 17), time: "17:00", guest: "Hayashi",          packageId: "p4", party: 4, status: "confirmed" },
  { id: "b3", date: day(2, 7),  time: "07:00", guest: "Okonkwo",          packageId: "p1", party: 1, status: "pending" },
  { id: "b4", date: day(4, 18), time: "18:00", guest: "Castellanos",      packageId: "p2", party: 6, status: "confirmed" },
  { id: "b5", date: day(6, 6),  time: "06:00", guest: "Lindqvist",        packageId: "p1", party: 2, status: "confirmed" },
  { id: "b6", date: day(9, 19), time: "19:00", guest: "Al-Rashid party",  packageId: "p2", party: 8, status: "confirmed" },
  { id: "b7", date: day(12, 6), time: "06:00", guest: "Marchetti",        packageId: "p3", party: 2, status: "pending" },
  { id: "b8", date: day(15, 17),time: "17:00", guest: "Volkov",           packageId: "p4", party: 3, status: "confirmed" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const AdminSchedule = () => {
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);

  const grid = useMemo(() => {
    const first = new Date(cursor);
    const startWeekday = (first.getDay() + 6) % 7; // monday-first
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const dayBookings = (d: Date) => BOOKINGS.filter((b) => same(b.date, d));
  const selectedBookings = dayBookings(selected).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-h-screen pt-28">
      <div className="container">
        <Link to="/admin" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Stable OS
        </Link>
      </div>

      <div className="container border-b hairline pb-6 pt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Schedule</p>
          <h1 className="font-display text-4xl md:text-5xl leading-none">Daily ledger</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="size-10 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-all" aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </button>
          <p className="font-display text-2xl min-w-[12rem] text-center">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</p>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="size-10 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-all" aria-label="Next month">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="container py-12 grid lg:grid-cols-12 gap-12">
        {/* Calendar */}
        <Reveal className="lg:col-span-8">
          <div className="grid grid-cols-7 border-t border-l hairline">
            {DAYS.map((d) => (
              <div key={d} className="border-b border-r hairline px-3 py-3 text-[10px] tracking-luxury uppercase text-ink-muted bg-surface/40">{d}</div>
            ))}
            {grid.map((d, i) => {
              if (!d) return <div key={i} className="border-b border-r hairline aspect-square bg-surface/20" />;
              const bs = dayBookings(d);
              const isSelected = same(d, selected);
              const isToday = same(d, today);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(d)}
                  className={cn(
                    "relative border-b border-r hairline aspect-square p-2 text-left transition-all group",
                    isSelected ? "bg-foreground text-background" : "hover:bg-surface/60",
                  )}
                >
                  <span className={cn(
                    "font-display text-lg leading-none",
                    isToday && !isSelected && "underline underline-offset-4",
                  )}>{d.getDate()}</span>
                  {bs.length > 0 && (
                    <div className={cn("absolute bottom-2 left-2 right-2 flex gap-0.5", isSelected && "opacity-90")}>
                      {bs.slice(0, 4).map((b) => (
                        <span key={b.id} className={cn(
                          "h-0.5 flex-1",
                          isSelected ? "bg-background" : b.status === "confirmed" ? "bg-foreground" : "bg-ink-muted",
                        )} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Day detail */}
        <Reveal delay={0.1} className="lg:col-span-4">
          <div className="border hairline bg-surface-elevated/40 p-7 sticky top-28">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{selected.toLocaleDateString("en-GB", { weekday: "long" })}</p>
            <h2 className="font-display text-4xl mt-1 leading-none">{selected.getDate()} {MONTHS[selected.getMonth()].slice(0, 3)}</h2>
            <p className="mt-1 text-xs text-ink-muted">{selectedBookings.length} reservations</p>

            <div className="mt-8 relative">
              {selectedBookings.length === 0 ? (
                <p className="text-sm text-ink-muted italic">The desert rests.</p>
              ) : (
                <ul className="space-y-5 relative pl-6 border-l hairline">
                  {selectedBookings.map((b, i) => {
                    const pkg = packages.find((p) => p.id === b.packageId);
                    return (
                      <motion.li
                        key={b.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.06, duration: 0.5, ease: easeLuxury }}
                        className="relative"
                      >
                        <span className="absolute -left-[27px] top-1.5 size-2 rounded-full bg-foreground" />
                        <p className="font-display text-2xl leading-none">{b.time}</p>
                        <p className="mt-2 text-sm text-foreground">{b.guest}</p>
                        <p className="text-xs text-ink-muted">{pkg?.name} · {b.party} guests</p>
                        <span className={cn(
                          "mt-2 inline-flex items-center gap-1.5 text-[10px] tracking-luxury uppercase",
                          b.status === "confirmed" ? "text-foreground" : "text-ink-muted",
                        )}>
                          <span className={cn("size-1 rounded-full", b.status === "confirmed" ? "bg-foreground" : "bg-ink-muted")} />
                          {b.status}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AdminSchedule;
