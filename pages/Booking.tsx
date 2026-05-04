"use client";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/components/shared/shims";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarIcon, Check, Minus, Plus, MapPin, Lock, AlertTriangle, Sun, Moon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { easeLuxury } from "@/components/shared/Motion";
import { stables, horses, currentUser, TIER_THRESHOLDS, type AdminTier, type Horse } from "@/data/mock";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Funnel A — /booking
// Strictly the HORSE reservation wizard (no curated packages).
// Steps: Stable → Date & Party → Time slot → Horse
// Slots are rendered per-horse and enforce Horse Welfare:
//   - max 2 AM rides per horse per day
//   - max 1 PM ride per horse per day
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ["Stable", "Date & Party", "Time slot", "Horse"] as const;

const AM_SLOTS = ["06:00", "08:00", "10:00"] as const;
const PM_SLOTS = ["15:00", "17:00", "19:00"] as const;
type Slot = typeof AM_SLOTS[number] | typeof PM_SLOTS[number];

const isAM = (s: Slot) => (AM_SLOTS as readonly string[]).includes(s);

type Selection = {
  stableId?: string;
  date?: Date;
  party: number;
  slot?: Slot;
  horseId?: string;
};

// Mocked welfare ledger — { horseId: { dateKey: { am: count, pm: count } } }
// In production this is computed server-side from confirmed Bookings.
const dateKey = (d: Date) => d.toISOString().slice(0, 10);
const MOCK_LEDGER: Record<string, Record<string, { am: number; pm: number }>> = {
  // Today + a couple days, deterministic mock state
  h1: { [dateKey(new Date())]: { am: 2, pm: 0 } }, // AM full
  h6: { [dateKey(new Date())]: { am: 1, pm: 1 } }, // PM full
};

const tierMeets = (rankPoints: number, tier: AdminTier) => rankPoints >= TIER_THRESHOLDS[tier];

const horseSlotAvailable = (horseId: string, date: Date, slot: Slot) => {
  const ledger = MOCK_LEDGER[horseId]?.[dateKey(date)] ?? { am: 0, pm: 0 };
  return isAM(slot) ? ledger.am < 2 : ledger.pm < 1;
};

const Booking = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [sel, setSel] = useState<Selection>({
    stableId: params.get("stable") ?? undefined,
    party: 2,
  });

  const [overrideHorse, setOverrideHorse] = useState<string | null>(null);
  const [welfareHorse, setWelfareHorse] = useState<string | null>(null);

  useEffect(() => { if (params.get("stable")) setStep(1); }, []); // eslint-disable-line

  const stable = stables.find((s) => s.id === sel.stableId);
  const horse = horses.find((h) => h.id === sel.horseId);
  const stableHorses = useMemo(
    () => horses.filter((h) => h.stableId === sel.stableId && h.isActive),
    [sel.stableId],
  );

  const canNext = [
    !!sel.stableId,
    !!sel.date && sel.party > 0,
    !!sel.slot,
    !!sel.horseId,
  ][step];

  const next = () => {
    if (step < STEPS.length - 1) { setDirection(1); setStep(step + 1); }
          // @ts-ignore — TanStack navigate shim accepts state at runtime
    else navigate("/checkout", { state: { sel } });
  };
  const back = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  // Pricing from horse.pricePerHour (the horse funnel — no packages here)
  const subtotal = horse ? horse.pricePerHour * sel.party : 0;
  const concierge = subtotal * 0.08;
  const total = subtotal + concierge;

  return (
    <div className="container pt-32 pb-32 min-h-screen">
      {/* Header */}
      <div className="mb-12 md:mb-16 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Concierge · Horse reservation</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1] text-balance">
            {step === 0 ? "Choose your estate." :
             step === 1 ? "When, and how many." :
             step === 2 ? "An hour, gently set." :
                          "Your horse for the day."}
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

      {/* Progress */}
      <ol className="mb-14 grid grid-cols-4 gap-2 md:gap-6">
        {(STEPS || []).map((label, i) => {
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
              {/* STEP 0 — Stable */}
              {step === 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  {(stables || []).map((s) => {
                    const active = sel.stableId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSel({ ...sel, stableId: s.id, horseId: undefined, slot: undefined })}
                        className={cn(
                          "group text-left transition-all duration-500 relative overflow-hidden",
                          active ? "ring-1 ring-foreground" : "ring-1 ring-transparent hover:ring-hairline",
                        )}
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-surface">
                          <motion.img src={s.image} alt={s.name} className="h-full w-full object-cover" whileHover={{ scale: 1.04 }} transition={{ duration: 1.2, ease: easeLuxury }} />
                        </div>
                        <div className="p-5 bg-surface-elevated/60">
                          <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Est. {s.established}</p>
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
              )}

              {/* STEP 1 — Date & Party */}
              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={cn(
                          "w-full flex items-center justify-between gap-3 border-b hairline pb-4 text-left transition-colors hover:border-foreground",
                          sel.date ? "text-foreground" : "text-ink-muted",
                        )}>
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
                          disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
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
                      <button
                        onClick={() => setSel({ ...sel, party: Math.max(1, sel.party - 1) })}
                        className="size-12 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                        aria-label="Decrease party"
                      >
                        <Minus className="size-4" />
                      </button>
                      <div className="text-center">
                        <p className="font-display text-5xl leading-none">{sel.party}</p>
                        <p className="mt-2 text-xs tracking-luxury uppercase text-ink-muted">rider{sel.party === 1 ? "" : "s"}</p>
                      </div>
                      <button
                        onClick={() => setSel({ ...sel, party: Math.min(8, sel.party + 1) })}
                        className="size-12 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                        aria-label="Increase party"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-ink-muted">A separate horse will be paired with each rider in step four.</p>
                  </div>
                </div>
              )}

              {/* STEP 2 — Time slot, gated by per-horse welfare across the roster */}
              {step === 2 && sel.date && (
                <SlotPicker
                  date={sel.date}
                  horses={stableHorses}
                  value={sel.slot}
                  onSelect={(s) => setSel({ ...sel, slot: s, horseId: undefined })}
                />
              )}

              {/* STEP 3 — Horse, only those available for the chosen slot */}
              {step === 3 && sel.date && sel.slot && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(stableHorses || []).map((h) => {
                    const active = sel.horseId === h.id;
                    const allowed = tierMeets(currentUser.rankPoints, h.adminTier);
                    const slotOk = horseSlotAvailable(h.id, sel.date!, sel.slot!);
                    const onPick = () => {
                      if (!slotOk) { setWelfareHorse(h.id); return; }
                      if (!allowed) { setOverrideHorse(h.id); return; }
                      setSel({ ...sel, horseId: h.id });
                    };
                    return (
                      <button
                        key={h.id}
                        onClick={onPick}
                        className={cn(
                          "group text-left relative overflow-hidden transition-all duration-500",
                          active ? "ring-1 ring-foreground" : "ring-1 ring-transparent hover:ring-hairline",
                        )}
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-surface relative">
                          <motion.img
                            src={h.image}
                            alt={h.name}
                            className={cn("h-full w-full object-cover transition-[filter] duration-700", (!allowed || !slotOk) && "grayscale opacity-60")}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 1.2, ease: easeLuxury }}
                          />
                          {(!allowed || !slotOk) && (
                            <span className="absolute inset-x-3 top-3 inline-flex items-center justify-between gap-2 bg-foreground/90 text-background px-3 py-1.5 text-[10px] tracking-luxury uppercase">
                              <span className="inline-flex items-center gap-1.5">
                                <Lock className="size-3" />
                                {!slotOk ? "Resting this slot" : `${h.adminTier} tier`}
                              </span>
                              <span className="opacity-70">Tap to request</span>
                            </span>
                          )}
                        </div>
                        <div className="p-4 bg-surface-elevated/60">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="font-display text-xl leading-tight">{h.name}</h3>
                            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{h.adminTier}</span>
                          </div>
                          <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-muted">{h.breed} · {h.age} yrs</p>
                          <p className="mt-1.5 text-xs text-ink-soft">{h.temperament}</p>
                          <p className="mt-3 text-xs text-foreground tabular-nums">${h.pricePerHour}<span className="text-ink-muted"> / hour</span></p>
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
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-14 flex items-center justify-between border-t hairline pt-6">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-ink-muted transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className={cn(
                "group inline-flex items-center gap-3 px-6 py-3.5 text-[12px] tracking-[0.18em] uppercase transition-all",
                canNext ? "bg-foreground text-background" : "bg-foreground/20 text-foreground/40 cursor-not-allowed",
              )}
            >
              {step === STEPS.length - 1 ? "Review & checkout" : "Continue"}
              {step === STEPS.length - 1
                ? <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                : <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 border hairline bg-surface-elevated/60 p-7">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-5">Your reservation</p>

            <Row label="Estate" value={stable?.name ?? "—"} />
            <Row label="Date" value={sel.date ? format(sel.date, "d MMM yyyy") : "—"} />
            <Row label="Party" value={`${sel.party} rider${sel.party === 1 ? "" : "s"}`} />
            <Row label="Slot" value={sel.slot ?? "—"} />
            <Row label="Horse" value={horse?.name ?? "—"} last />

            <div className="mt-6 pt-5 border-t hairline space-y-2 text-sm">
              <Line label={horse ? `Horse · ${sel.party}h × $${horse.pricePerHour}` : "Subtotal"} value={subtotal ? `$${subtotal.toFixed(0)}` : "—"} />
              <Line label="Concierge (8%)" value={subtotal ? `$${concierge.toFixed(0)}` : "—"} />
            </div>
            <div className="mt-4 pt-4 border-t hairline flex items-baseline justify-between">
              <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Total</span>
              <span className="font-display text-3xl">{subtotal ? `$${total.toFixed(0)}` : "—"}</span>
            </div>

            <p className="mt-6 text-xs text-ink-muted text-pretty">
              No charge until your concierge confirms. Looking for a curated package?{" "}
              <Link to="/packages" className="text-foreground underline-offset-4 hover:underline">Browse journeys</Link>.
            </p>
          </div>
        </aside>
      </div>

      {/* Skill Override Modal */}
      <LuxuryModal
        open={!!overrideHorse}
        onClose={() => setOverrideHorse(null)}
        eyebrow="Skill mismatch"
        title="A quiet word from the master rider."
      >
        {overrideHorse && (() => {
          const h = horses.find((x) => x.id === overrideHorse)!;
          return (
            <>
              <p className="text-ink-soft text-pretty leading-relaxed">
                <span className="text-foreground">{h.name}</span> is reserved for our <span className="uppercase tracking-[0.18em] text-xs">{h.adminTier}</span> riders.
                Your current standing is <span className="text-foreground">{currentUser.rankPoints} pts</span>.
                You may request an override — our captain will personally review within the hour.
              </p>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setOverrideHorse(null)} className="px-5 py-3 text-[11px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground transition-colors">
                  Choose another
                </button>
                <button
                  onClick={() => { toast.success("Override request sent. Our captain will write within the hour."); setOverrideHorse(null); }}
                  className="px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase"
                >
                  Request override
                </button>
              </div>
            </>
          );
        })()}
      </LuxuryModal>

      {/* Welfare Modal */}
      <LuxuryModal
        open={!!welfareHorse}
        onClose={() => setWelfareHorse(null)}
        eyebrow="Horse welfare"
        title="Resting this slot, by gentle order."
      >
        {welfareHorse && (() => {
          const h = horses.find((x) => x.id === welfareHorse)!;
          return (
            <>
              <p className="text-ink-soft text-pretty leading-relaxed">
                <span className="text-foreground">{h.name}</span> has reached the daily welfare limit
                for this period (no more than two morning rides and one afternoon ride). Please choose another
                horse, or invite us to suggest a comparable companion from the roster.
              </p>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setWelfareHorse(null)} className="px-5 py-3 text-[11px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground transition-colors">
                  Choose another
                </button>
                <button
                  onClick={() => { toast.success("Concierge will suggest a comparable horse shortly."); setWelfareHorse(null); }}
                  className="px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase"
                >
                  Ask concierge
                </button>
              </div>
            </>
          );
        })()}
      </LuxuryModal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SlotPicker — renders AM and PM time slots, each annotated with how many
// horses in the roster still have welfare capacity at that hour.
// ─────────────────────────────────────────────────────────────────────────────
const SlotPicker = ({
  date, horses: roster, value, onSelect,
}: { date: Date; horses: Horse[]; value?: Slot; onSelect: (s: Slot) => void }) => {
  const availableCount = (slot: Slot) =>
    roster.filter((h) => horseSlotAvailable(h.id, date, slot)).length;

  const Block = ({ slot }: { slot: Slot }) => {
    const count = availableCount(slot);
    const disabled = count === 0;
    const active = value === slot;
    return (
      <button
        onClick={() => !disabled && onSelect(slot)}
        disabled={disabled}
        className={cn(
          "relative px-5 py-6 border hairline text-left transition-all duration-500",
          active ? "bg-foreground text-background border-foreground" : "hover:bg-surface/60",
          disabled && "opacity-30 cursor-not-allowed",
        )}
      >
        <p className="font-display text-3xl leading-none">{slot}</p>
        <p className={cn("mt-3 text-[10px] tracking-luxury uppercase", active ? "text-background/70" : "text-ink-muted")}>
          {disabled ? "All horses resting" : `${count} horse${count === 1 ? "" : "s"} available`}
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
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-4 inline-flex items-center gap-2">
          <Sun className="size-3.5" /> Morning · max 2 rides per horse
        </p>
        <div className="grid grid-cols-3 gap-3">
          {AM_SLOTS.map((s) => <Block key={s} slot={s} />)}
        </div>
      </div>
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-4 inline-flex items-center gap-2">
          <Moon className="size-3.5" /> Afternoon & evening · max 1 ride per horse
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PM_SLOTS.map((s) => <Block key={s} slot={s} />)}
        </div>
      </div>
      <p className="text-xs text-ink-muted">
        Slot capacity is computed per individual horse. Once you choose a time, only the horses with
        remaining welfare capacity for that hour will appear.
      </p>
    </div>
  );
};

const LuxuryModal = ({ open, onClose, eyebrow, title, children }: { open: boolean; onClose: () => void; eyebrow: string; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: easeLuxury }}
      >
        <motion.div
          onClick={onClose}
          className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.55, ease: easeLuxury }}
          className="relative w-full max-w-lg bg-background border hairline p-8 md:p-10 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-2">
                <AlertTriangle className="size-3" /> {eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl leading-[1.05] text-balance">{title}</h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-foreground transition-colors">
              <Plus className="size-5 rotate-45" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Row = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <div className={cn("flex items-baseline justify-between gap-4 py-2.5", !last && "border-b hairline")}>
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted shrink-0">{label}</span>
    <span className="text-sm text-foreground text-right truncate">{value}</span>
  </div>
);

const Line = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-ink-muted">{label}</span>
    <span className="text-foreground tabular-nums">{value}</span>
  </div>
);

export default Booking;
