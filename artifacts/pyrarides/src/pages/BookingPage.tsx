import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarIcon, Check, Minus, Plus,
  MapPin, Lock, AlertTriangle, Sun, Moon, Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { easeLuxury } from "@/components/shared/Motion";
import { setBookingSel, type BookingSel } from "@/stores/booking";
import { toast } from "sonner";

interface Stable {
  id: string;
  name: string;
  location: string;
  imageUrl?: string;
  rating: number;
}

interface Horse {
  id: string;
  name: string;
  imageUrls?: string[];
  pricePerHour: number;
  color?: string | null;
  skills?: string[];
  skillLevel?: string;
  adminTier?: string | null;
  isActive: boolean;
}

const STEPS = ["Stable", "Date & Party", "Time slot", "Horse"] as const;

const AM_SLOTS = ["06:00", "08:00", "10:00"] as const;
const PM_SLOTS = ["15:00", "17:00", "19:00"] as const;
type Slot = typeof AM_SLOTS[number] | typeof PM_SLOTS[number];

const isAM = (s: Slot) => (AM_SLOTS as readonly string[]).includes(s);

type Selection = { stableId?: string; date?: Date; party: number; slot?: Slot; horseId?: string };

const BookingPage = () => {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedStable = searchParams.get("stable") ?? undefined;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [sel, setSel] = useState<Selection>({ stableId: preselectedStable, party: 2 });
  const [overrideHorse, setOverrideHorse] = useState<string | null>(null);
  const [welfareHorse, setWelfareHorse] = useState<string | null>(null);

  const [stables, setStables] = useState<Stable[]>([]);
  const [stablesLoading, setStablesLoading] = useState(true);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [horsesLoading, setHorsesLoading] = useState(false);

  useEffect(() => {
    fetch("/api/stables")
      .then((r) => r.json())
      .then((data) => setStables(data.stables ?? []))
      .catch(() => setStables([]))
      .finally(() => setStablesLoading(false));
  }, []);

  useEffect(() => {
    if (!sel.stableId) { setHorses([]); return; }
    setHorsesLoading(true);
    fetch(`/api/horses?stableId=${sel.stableId}`)
      .then((r) => r.json())
      .then((data) => setHorses(Array.isArray(data) ? data.filter((h: Horse) => h.isActive) : []))
      .catch(() => setHorses([]))
      .finally(() => setHorsesLoading(false));
  }, [sel.stableId]);

  useEffect(() => { if (preselectedStable) setStep(1); }, []); // eslint-disable-line

  const stable = stables.find((s) => s.id === sel.stableId);
  const horse = horses.find((h) => h.id === sel.horseId);

  const canNext = [!!sel.stableId, !!sel.date && sel.party > 0, !!sel.slot, !!sel.horseId][step];

  const next = () => {
    if (step < STEPS.length - 1) { setDirection(1); setStep(step + 1); }
    else {
      setBookingSel(sel as BookingSel);
      navigate("/checkout");
    }
  };
  const back = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  const subtotal = horse ? horse.pricePerHour * sel.party : 0;
  const concierge = subtotal * 0.08;
  const total = subtotal + concierge;

  return (
    <div className="container pt-32 pb-32 min-h-screen">
      <div className="mb-12 md:mb-16 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Concierge · Horse reservation</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1] text-balance">
            {step === 0 ? "Choose your estate." : step === 1 ? "When, and how many." : step === 2 ? "An hour, gently set." : "Your horse for the day."}
          </h1>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" /> Cancel
          </Link>
          <Link to="/packages" className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
            Looking for a curated journey? →
          </Link>
        </div>
      </div>

      <ol className="mb-14 grid grid-cols-4 gap-2 md:gap-6">
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={label} className="relative">
              <div className="relative h-px w-full bg-hairline overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ scaleX: done ? 1 : active ? 0.5 : 0 }}
                  transition={{ duration: 0.7, ease: easeLuxury }}
                  style={{ originX: 0 }}
                  className="absolute inset-0 bg-foreground"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={cn("text-[10px] tracking-luxury uppercase transition-colors", active || done ? "text-foreground" : "text-ink-muted")}>
                  0{i + 1} · {label}
                </span>
                {done && <Check className="size-3 text-foreground" />}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-8 min-h-[460px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.5, ease: easeLuxury }}
            >
              {step === 0 && (
                stablesLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-ink-muted" /></div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {stables.map((s) => {
                      const active = sel.stableId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSel({ ...sel, stableId: s.id, horseId: undefined, slot: undefined })}
                          className={cn("group text-left transition-all duration-500 relative overflow-hidden", active ? "ring-1 ring-foreground" : "ring-1 ring-transparent hover:ring-hairline")}
                        >
                          <div className="aspect-[4/5] overflow-hidden bg-surface">
                            <motion.img src={s.imageUrl || "/hero-bg.webp"} alt={s.name} className="h-full w-full object-cover" whileHover={{ scale: 1.04 }} transition={{ duration: 1.2, ease: easeLuxury }} />
                          </div>
                          <div className="p-5 bg-surface-elevated/60">
                            <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.location}</p>
                            <h3 className="font-display text-2xl mt-1 leading-tight">{s.name}</h3>
                            <p className="mt-1 text-xs tracking-[0.14em] uppercase text-ink-muted inline-flex items-center gap-1.5">
                              <MapPin className="size-3" /> {s.location}
                            </p>
                          </div>
                          {active && (
                            <motion.span layoutId="select-mark" className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background">
                              <Check className="size-3.5" />
                            </motion.span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={cn("w-full flex items-center justify-between gap-3 border-b hairline pb-4 text-left transition-colors hover:border-foreground", sel.date ? "text-foreground" : "text-ink-muted")}>
                          <span className="font-display text-2xl md:text-3xl">
                            {sel.date ? format(sel.date, "EEEE, d MMMM yyyy") : "Choose your morning"}
                          </span>
                          <CalendarIcon className="size-5 shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-surface-elevated border hairline" align="start">
                        <Calendar
                          mode="single"
                          selected={sel.date}
                          onSelect={(d) => setSel({ ...sel, date: d, slot: undefined, horseId: undefined })}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="mt-4 text-sm text-ink-muted">Sunrise rides depart 90 minutes before first light. Your concierge will confirm the exact hour.</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Party</p>
                    <div className="flex items-center justify-between gap-6 border-b hairline pb-4">
                      <button onClick={() => setSel({ ...sel, party: Math.max(1, sel.party - 1) })} className="size-12 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
                        <Minus className="size-4" />
                      </button>
                      <div className="text-center">
                        <p className="font-display text-5xl leading-none">{sel.party}</p>
                        <p className="mt-2 text-xs tracking-luxury uppercase text-ink-muted">rider{sel.party === 1 ? "" : "s"}</p>
                      </div>
                      <button onClick={() => setSel({ ...sel, party: Math.min(8, sel.party + 1) })} className="size-12 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-ink-muted">A separate horse will be paired with each rider in step four.</p>
                  </div>
                </div>
              )}

              {step === 2 && sel.date && (
                <SlotPicker
                  date={sel.date}
                  horses={horses}
                  value={sel.slot}
                  onSelect={(s) => setSel({ ...sel, slot: s, horseId: undefined })}
                />
              )}

              {step === 3 && sel.date && sel.slot && (
                horsesLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-ink-muted" /></div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {horses.map((h) => {
                      const active = sel.horseId === h.id;
                      const hasTierRestriction = !!h.adminTier;
                      const onPick = () => {
                        if (hasTierRestriction) { setOverrideHorse(h.id); return; }
                        setSel({ ...sel, horseId: h.id });
                      };
                      return (
                        <button key={h.id} onClick={onPick} className={cn("group text-left relative overflow-hidden transition-all duration-500", active ? "ring-1 ring-foreground" : "ring-1 ring-transparent hover:ring-hairline")}>
                          <div className="aspect-[3/4] overflow-hidden bg-surface relative">
                            <motion.img src={h.imageUrls?.[0] || "/hero-bg.webp"} alt={h.name} className={cn("h-full w-full object-cover transition-[filter] duration-700", hasTierRestriction && "grayscale opacity-60")} whileHover={{ scale: 1.05 }} transition={{ duration: 1.2, ease: easeLuxury }} />
                            {hasTierRestriction && (
                              <span className="absolute inset-x-3 top-3 inline-flex items-center justify-between gap-2 bg-foreground/90 text-background px-3 py-1.5 text-[10px] tracking-luxury uppercase">
                                <span className="inline-flex items-center gap-1.5"><Lock className="size-3" />{h.adminTier} tier</span>
                                <span className="opacity-70">Tap to request</span>
                              </span>
                            )}
                          </div>
                          <div className="p-4 bg-surface-elevated/60">
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="font-display text-xl leading-tight">{h.name}</h3>
                              {h.adminTier && <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{h.adminTier}</span>}
                            </div>
                            {h.color && <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-muted">{h.color}{h.skillLevel ? ` · ${h.skillLevel}` : ""}</p>}
                            {h.skills && h.skills.length > 0 && (
                              <p className="mt-1.5 text-xs text-ink-soft">{h.skills.slice(0, 2).join(", ")}</p>
                            )}
                            <p className="mt-3 text-xs text-foreground tabular-nums">EGP {h.pricePerHour.toLocaleString()}<span className="text-ink-muted"> / hour</span></p>
                          </div>
                          {active && (
                            <motion.span layoutId="select-horse-mark" className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background">
                              <Check className="size-3.5" />
                            </motion.span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-14 flex items-center justify-between border-t hairline pt-6">
            <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-ink-muted transition-colors">
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <button onClick={next} disabled={!canNext} className={cn("group inline-flex items-center gap-3 px-6 py-3.5 text-[12px] tracking-[0.18em] uppercase transition-all", canNext ? "bg-foreground text-background" : "bg-foreground/20 text-foreground/40 cursor-not-allowed")}>
              {step === STEPS.length - 1 ? "Review & checkout" : "Continue"}
              {step === STEPS.length - 1
                ? <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                : <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />}
            </button>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 border hairline bg-surface-elevated/60 p-7">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-5">Your reservation</p>
            <SummaryRow label="Estate" value={stable?.name ?? "—"} />
            <SummaryRow label="Date" value={sel.date ? format(sel.date, "d MMM yyyy") : "—"} />
            <SummaryRow label="Party" value={`${sel.party} rider${sel.party === 1 ? "" : "s"}`} />
            <SummaryRow label="Slot" value={sel.slot ?? "—"} />
            <SummaryRow label="Horse" value={horse?.name ?? "—"} last />
            <div className="mt-6 pt-5 border-t hairline space-y-2 text-sm">
              <PriceLine label={horse ? `Horse · ${sel.party}h × EGP ${horse.pricePerHour.toLocaleString()}` : "Subtotal"} value={subtotal ? `EGP ${subtotal.toLocaleString()}` : "—"} />
              <PriceLine label="Concierge (8%)" value={subtotal ? `EGP ${concierge.toFixed(0)}` : "—"} />
            </div>
            <div className="mt-4 pt-4 border-t hairline flex items-baseline justify-between">
              <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Total</span>
              <span className="font-display text-3xl">{subtotal ? `EGP ${total.toFixed(0)}` : "—"}</span>
            </div>
            <p className="mt-6 text-xs text-ink-muted text-pretty">
              No charge until your concierge confirms. Looking for a curated package?{" "}
              <Link to="/packages" className="text-foreground underline-offset-4 hover:underline">Browse journeys</Link>.
            </p>
          </div>
        </aside>
      </div>

      {/* Tier Override Modal */}
      <LuxuryModal open={!!overrideHorse} onClose={() => setOverrideHorse(null)} eyebrow="Tier restricted" title="A quiet word from the master rider.">
        {overrideHorse && (() => {
          const h = horses.find((x) => x.id === overrideHorse);
          if (!h) return null;
          return (
            <>
              <p className="text-ink-soft text-pretty leading-relaxed">
                <span className="text-foreground">{h.name}</span> is reserved for our <span className="uppercase tracking-[0.18em] text-xs">{h.adminTier}</span> riders.
                You may request an override — our captain will personally review within the hour.
              </p>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setOverrideHorse(null)} className="px-5 py-3 text-[11px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground transition-colors">Choose another</button>
                <button onClick={() => { toast.success("Override request sent. Our captain will write within the hour."); setOverrideHorse(null); }} className="px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">Request override</button>
              </div>
            </>
          );
        })()}
      </LuxuryModal>

      {/* Welfare Modal */}
      <LuxuryModal open={!!welfareHorse} onClose={() => setWelfareHorse(null)} eyebrow="Horse welfare" title="Resting this slot, by gentle order.">
        {welfareHorse && (() => {
          const h = horses.find((x) => x.id === welfareHorse);
          if (!h) return null;
          return (
            <>
              <p className="text-ink-soft text-pretty leading-relaxed">
                <span className="text-foreground">{h.name}</span> has reached the daily welfare limit for this period. Please choose another horse, or invite us to suggest a comparable companion.
              </p>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setWelfareHorse(null)} className="px-5 py-3 text-[11px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground transition-colors">Choose another</button>
                <button onClick={() => { toast.success("Concierge will suggest a comparable horse shortly."); setWelfareHorse(null); }} className="px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">Ask concierge</button>
              </div>
            </>
          );
        })()}
      </LuxuryModal>
    </div>
  );
};

const SlotPicker = ({ date, horses, value, onSelect }: { date: Date; horses: Horse[]; value?: Slot; onSelect: (s: Slot) => void }) => {
  const Block = ({ slot }: { slot: Slot }) => {
    const active = value === slot;
    return (
      <button onClick={() => onSelect(slot)} className={cn("relative px-5 py-6 border hairline text-left transition-all duration-500", active ? "bg-foreground text-background border-foreground" : "hover:bg-surface/60")}>
        <p className="font-display text-3xl leading-none">{slot}</p>
        <p className={cn("mt-3 text-[10px] tracking-luxury uppercase", active ? "text-background/70" : "text-ink-muted")}>
          {horses.length} horse{horses.length === 1 ? "" : "s"} available
        </p>
        {active && (
          <motion.span layoutId="slot-mark" className="absolute top-3 right-3 inline-flex size-6 items-center justify-center rounded-full bg-background text-foreground">
            <Check className="size-3" />
          </motion.span>
        )}
      </button>
    );
  };
  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-4 inline-flex items-center gap-2"><Sun className="size-3.5" /> Morning rides</p>
        <div className="grid grid-cols-3 gap-3">{AM_SLOTS.map((s) => <Block key={s} slot={s} />)}</div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-4 inline-flex items-center gap-2"><Moon className="size-3.5" /> Afternoon & evening</p>
        <div className="grid grid-cols-3 gap-3">{PM_SLOTS.map((s) => <Block key={s} slot={s} />)}</div>
      </div>
      <p className="text-xs text-ink-muted">Your concierge will confirm the exact departure time within 24 hours of booking.</p>
    </div>
  );
};

const LuxuryModal = ({ open, onClose, eyebrow, title, children }: { open: boolean; onClose: () => void; eyebrow: string; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easeLuxury }}>
        <motion.div onClick={onClose} className="absolute inset-0 bg-foreground/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.55, ease: easeLuxury }} className="relative w-full max-w-lg bg-background border hairline p-8 md:p-10 shadow-2xl">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-2"><AlertTriangle className="size-3" /> {eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl leading-[1.05] text-balance">{title}</h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-foreground transition-colors"><Plus className="size-5 rotate-45" /></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SummaryRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <div className={cn("flex items-baseline justify-between gap-4 py-2.5", !last && "border-b hairline")}>
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted shrink-0">{label}</span>
    <span className="text-sm text-foreground text-right truncate">{value}</span>
  </div>
);

const PriceLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-ink-muted">{label}</span>
    <span className="text-foreground tabular-nums">{value}</span>
  </div>
);

export default BookingPage;
