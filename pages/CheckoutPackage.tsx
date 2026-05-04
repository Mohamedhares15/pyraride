"use client";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "@/components/shared/shims";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, Check, CreditCard, Lock, Banknote, AlertTriangle, Tag, CalendarIcon, ChevronDown, MapPin, Minus, Plus,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Reveal, easeLuxury } from "@/components/shared/Motion";
import { packages, stables, transportZones, promoCodes, currentUser } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Funnel B — /checkout/package/:id
// Standalone direct checkout for curated packages. Does NOT route through the
// horse wizard. Mirrors POST /api/checkout/package payload:
//   { packageId, date, startTime, ticketsCount, transportationZoneId, pickupLocationUrl }
// ─────────────────────────────────────────────────────────────────────────────

const START_TIMES = ["06:00", "08:00", "15:00", "17:00", "19:00"] as const;

const CheckoutPackage = () => {
  const { id } = useParams<{ id: string }>();
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) return <Navigate to="/packages" replace />;
  const stable = stables.find((s) => s.id === pkg.stableId)!;

  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>("");
  const [tickets, setTickets] = useState(pkg.minPeople);
  const [zoneId, setZoneId] = useState<string>("");
  const [pickupUrl, setPickupUrl] = useState("");
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percentOff: number; label: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [confirmed, setConfirmed] = useState(false);

  const zone = transportZones.find((z) => z.id === zoneId);

  const subtotal = pkg.price * tickets;
  const transport = pkg.hasTransportation && zone ? zone.price : 0;
  const discount = appliedPromo ? (subtotal + transport) * appliedPromo.percentOff : 0;
  const concierge = (subtotal + transport - discount) * 0.08;
  const total = subtotal + transport - discount + concierge;

  const cashBlocked = paymentMethod === "cash" && !currentUser.isTrustedRider;

  const applyPromo = () => {
    const found = promoCodes.find((p) => p.code.toLowerCase() === promo.trim().toLowerCase());
    if (!found) { toast.error("That code is not recognised."); return; }
    setAppliedPromo(found);
    toast.success(`${found.label} applied.`);
  };

  const ready = !!date && !!startTime && tickets >= pkg.minPeople && (!pkg.hasTransportation || !!zoneId);

  const onConfirm = () => {
    if (!ready) { toast.error("Please complete date, hour, and pick-up zone."); return; }
    if (cashBlocked) { toast.error("Cash is reserved for Trusted Riders. Please use a card."); return; }
    // Payload mirrors POST /api/checkout/package
    const payload = {
      packageId: pkg.id,
      date: date!.toISOString(),
      startTime,
      ticketsCount: tickets,
      transportationZoneId: zoneId || null,
      pickupLocationUrl: pickupUrl || null,
      paymentMethod,
      promoCode: appliedPromo?.code ?? null,
    };
    // eslint-disable-next-line no-console
    console.info("[POST /api/checkout/package]", payload);
    setConfirmed(true);
  };

  return (
    <div className="container pt-32 pb-32 min-h-screen">
      <Link to={`/packages/${pkg.id}`} className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors mb-10">
        <ArrowLeft className="size-3.5" /> Back to journey
      </Link>

      {confirmed ? (
        <Confirmed pkgName={pkg.name} stableName={stable.name} date={date!} startTime={startTime} />
      ) : (
        <>
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Curated journey · Direct checkout</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1] text-balance max-w-3xl">{pkg.name}.</h1>
            <p className="mt-4 text-ink-muted">{pkg.tagline}</p>
          </Reveal>

          <div className="mt-16 grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7 space-y-12">
              {/* Schedule */}
              <Reveal>
                <Section eyebrow="Schedule">
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
                    <div>
                      <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Date</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={cn(
                            "w-full flex items-center justify-between gap-3 border-b hairline pb-3 text-left transition-colors hover:border-foreground",
                            date ? "text-foreground" : "text-ink-muted",
                          )}>
                            <span className="font-display text-2xl">
                              {date ? format(date, "EEE, d MMM yyyy") : "Choose a date"}
                            </span>
                            <CalendarIcon className="size-5 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-surface-elevated border hairline" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Departure hour</p>
                      <div className="relative">
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full appearance-none bg-transparent border-b hairline pb-3 pr-8 font-display text-2xl text-foreground focus:outline-none focus:border-foreground transition-colors cursor-pointer"
                        >
                          <option value="" disabled>Select hour</option>
                          {START_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-0 bottom-3.5 size-4 text-ink-muted pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Tickets · {pkg.minPeople}–{pkg.maxPeople} guests</p>
                      <div className="flex items-center justify-between gap-6 border-b hairline pb-3">
                        <button
                          onClick={() => setTickets(Math.max(pkg.minPeople, tickets - 1))}
                          className="size-11 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                          aria-label="Decrease tickets"
                        >
                          <Minus className="size-4" />
                        </button>
                        <div className="text-center">
                          <p className="font-display text-4xl leading-none">{tickets}</p>
                          <p className="mt-2 text-[10px] tracking-luxury uppercase text-ink-muted">guest{tickets === 1 ? "" : "s"}</p>
                        </div>
                        <button
                          onClick={() => setTickets(Math.min(pkg.maxPeople, tickets + 1))}
                          className="size-11 inline-flex items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                          aria-label="Increase tickets"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>
              </Reveal>

              {/* Transportation */}
              {pkg.hasTransportation && (
                <Reveal>
                  <Section eyebrow="Transportation">
                    <div className="grid sm:grid-cols-12 gap-6 items-end">
                      <div className="sm:col-span-7 relative">
                        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Pick-up zone</p>
                        <select
                          value={zoneId}
                          onChange={(e) => setZoneId(e.target.value)}
                          className="w-full appearance-none bg-transparent border-b hairline pb-3 pr-8 font-display text-xl text-foreground focus:outline-none focus:border-foreground transition-colors cursor-pointer"
                        >
                          <option value="" disabled>Select your pick-up</option>
                          {(transportZones || []).map((z) => (
                            <option key={z.id} value={z.id}>{z.name}{z.price > 0 ? `  ·  +$${z.price}` : "  ·  included"}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-0 bottom-3.5 size-4 text-ink-muted pointer-events-none" />
                      </div>
                      <div className="sm:col-span-5">
                        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Pick-up location URL <span className="text-ink-muted/60 normal-case tracking-normal">(optional)</span></p>
                        <div className="relative">
                          <MapPin className="absolute left-0 bottom-3 size-3.5 text-ink-muted" />
                          <input
                            value={pickupUrl}
                            onChange={(e) => setPickupUrl(e.target.value)}
                            placeholder="https://maps.app.goo.gl/…"
                            className="w-full bg-transparent border-b hairline pb-3 pl-6 text-foreground placeholder:text-ink-muted/60 text-sm focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-ink-muted">A private chauffeur will collect your party 60 minutes before departure.</p>
                  </Section>
                </Reveal>
              )}

              {/* Guest details */}
              <Reveal delay={0.1}>
                <Section eyebrow="Guest details">
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                    <Field label="Full name" placeholder="As on passport" />
                    <Field label="Email" type="email" placeholder="concierge@example.com" />
                    <Field label="Phone" type="tel" placeholder="+20 ·" />
                    <Field label="Special requests" placeholder="Allergies, dietary notes, photographer" />
                  </div>
                </Section>
              </Reveal>

              {/* Payment */}
              <Reveal delay={0.15}>
                <Section eyebrow="Payment">
                  <div className="mb-8">
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Method</p>
                    <div className="relative inline-grid grid-cols-2 border hairline">
                      {(["card", "cash"] as const).map((m) => {
                        const active = paymentMethod === m;
                        return (
                          <button
                            key={m}
                            onClick={() => setPaymentMethod(m)}
                            className={cn(
                              "relative px-6 py-3 text-[11px] tracking-[0.2em] uppercase inline-flex items-center gap-2 transition-colors",
                              active ? "text-background" : "text-ink-muted hover:text-foreground",
                            )}
                          >
                            {active && <motion.span layoutId="pkg-pay-toggle" className="absolute inset-0 bg-foreground" transition={{ duration: 0.45, ease: easeLuxury }} />}
                            <span className="relative z-10 inline-flex items-center gap-2">
                              {m === "card" ? <CreditCard className="size-3.5" /> : <Banknote className="size-3.5" />}
                              {m === "card" ? "Card" : "Cash"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {cashBlocked && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.4, ease: easeLuxury }}
                          className="mt-4 inline-flex items-start gap-2 text-xs text-ink-muted text-pretty max-w-md border-l-2 border-foreground/40 pl-3"
                        >
                          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                          <span>Cash payments are reserved for Trusted Riders. First-time guests must secure their reservation via card.</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentMethod === "card" && (
                      <motion.div
                        key="card-fields"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.4, ease: easeLuxury }}
                        className="grid sm:grid-cols-2 gap-x-8 gap-y-6"
                      >
                        <div className="sm:col-span-2">
                          <Field label="Card number" placeholder="•••• •••• •••• ••••" icon={<CreditCard className="size-4 text-ink-muted" />} />
                        </div>
                        <Field label="Expiry" placeholder="MM / YY" />
                        <Field label="CVC" placeholder="•••" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="mt-6 inline-flex items-center gap-2 text-xs text-ink-muted">
                    <Lock className="size-3" /> No charge until your concierge confirms within 24 hours.
                  </p>
                </Section>
              </Reveal>
            </div>

            {/* Summary */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 border hairline bg-surface-elevated/60 p-8">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1">{stable.name}</p>
                <h3 className="font-display text-2xl leading-tight mb-6">{pkg.name}</h3>

                <div className="aspect-[16/10] overflow-hidden bg-surface mb-6">
                  <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" loading="lazy" />
                </div>

                <div className="mb-6 pb-6 border-b hairline">
                  <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Promo code</p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-0 bottom-3 size-3.5 text-ink-muted" />
                      <input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value.toUpperCase())}
                        placeholder="CERCLE10"
                        className="w-full bg-transparent border-b hairline pb-3 pl-6 text-foreground placeholder:text-ink-muted/50 tracking-[0.18em] uppercase text-sm focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <button
                      onClick={applyPromo}
                      disabled={!promo}
                      className="px-4 py-2.5 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-foreground inline-flex items-center gap-2">
                      <Check className="size-3" /> {appliedPromo.label}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <Line label={`${pkg.name} × ${tickets}`} value={`$${subtotal.toFixed(0)}`} />
                  {transport > 0 && <Line label={`Transport · ${zone?.name}`} value={`$${transport.toFixed(0)}`} />}
                  {discount > 0 && <Line label={`Discount · ${appliedPromo?.code}`} value={`−$${discount.toFixed(0)}`} />}
                  <Line label="Concierge service (8%)" value={`$${concierge.toFixed(0)}`} />
                </div>

                <div className="mt-6 pt-5 border-t hairline flex items-baseline justify-between">
                  <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Total due</span>
                  <span className="font-display text-4xl">${total.toFixed(0)}</span>
                </div>

                <button
                  onClick={onConfirm}
                  disabled={cashBlocked || !ready}
                  className={cn(
                    "mt-8 w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-[12px] tracking-[0.2em] uppercase",
                    (cashBlocked || !ready) ? "bg-foreground/20 text-foreground/40 cursor-not-allowed" : "bg-foreground text-background",
                  )}
                >
                  {paymentMethod === "cash" ? "Reserve · pay in cash" : "Confirm reservation"}
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
};

const Section = ({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) => (
  <section className="border-t hairline pt-8">
    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-6">{eyebrow}</p>
    {children}
  </section>
);

const Field = ({ label, placeholder, type = "text", icon }: { label: string; placeholder?: string; type?: string; icon?: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</span>
    <div className="relative mt-2">
      <input type={type} placeholder={placeholder} className={cn(
        "w-full bg-transparent border-b hairline pb-3 pt-1 text-foreground placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors",
        icon && "pr-8",
      )} />
      {icon && <span className="absolute right-0 bottom-3.5">{icon}</span>}
    </div>
  </label>
);

const Line = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-ink-soft">{label}</span>
    <span className="text-foreground tabular-nums">{value}</span>
  </div>
);

const Confirmed = ({ pkgName, stableName, date, startTime }: { pkgName: string; stableName: string; date: Date; startTime: string }) => {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center pt-10">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: easeLuxury }}
        className="size-20 rounded-full bg-foreground text-background inline-flex items-center justify-center mb-10"
      >
        <Check className="size-8" />
      </motion.div>
      <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Reservation received</p>
      <h1 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance max-w-2xl">
        {pkgName}, on {format(date, "d MMMM")} at {startTime}.
      </h1>
      <p className="mt-6 max-w-md text-ink-soft text-pretty">
        Your concierge at {stableName} will write within 24 hours to confirm every detail.
      </p>
      <div className="mt-12 flex gap-4">
        <Link to="/dashboard" className="inline-flex px-6 py-3.5 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase">View your journeys</Link>
        <Link to="/" className="inline-flex px-6 py-3.5 border hairline text-[12px] tracking-[0.2em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Return home</Link>
      </div>
    </div>
  );
};

export default CheckoutPackage;

// Forced SSR to bypass static pre-render errors during UI migration
export const getServerSideProps = async () => ({ props: {} });
