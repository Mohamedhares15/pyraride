"use client";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "@/components/shared/shims";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Check, CreditCard, Lock, Banknote, AlertTriangle, Tag } from "lucide-react";
import { Reveal, easeLuxury } from "@/components/shared/Motion";
import { stables, horses, promoCodes, currentUser } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Checkout for the HORSE funnel only. The curated-package funnel uses
// /checkout/package/:id — see CheckoutPackage.tsx.
type Sel = { stableId?: string; date?: Date; party: number; horseId?: string; slot?: string };

const Checkout = () => {
  const { state } = useLocation() as unknown as { state?: { sel?: Sel } };
  const sel = state?.sel;
  const [confirmed, setConfirmed] = useState(false);
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percentOff: number; label: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");

  if (!sel || !sel.stableId || !sel.horseId || !sel.date || !sel.slot) {
    return <Navigate to="/booking" replace />;
  }

  const stable = stables.find((s) => s.id === sel.stableId)!;
  const horse = horses.find((h) => h.id === sel.horseId)!;

  // Horse funnel pricing — pricePerHour × party (basePrice never exposed).
  const subtotal = horse.pricePerHour * sel.party;
  const discount = appliedPromo ? subtotal * appliedPromo.percentOff : 0;
  const concierge = (subtotal - discount) * 0.08;
  const total = subtotal - discount + concierge;

  const cashBlocked = paymentMethod === "cash" && !currentUser.isTrustedRider;

  const applyPromo = () => {
    const found = promoCodes.find((p) => p.code.toLowerCase() === promo.trim().toLowerCase());
    if (!found) { toast.error("That code is not recognised."); return; }
    setAppliedPromo(found);
    toast.success(`${found.label} applied.`);
  };

  const onConfirm = () => {
    if (cashBlocked) { toast.error("Cash is reserved for Trusted Riders. Please use a card."); return; }
    setConfirmed(true);
  };

  return (
    <div className="container pt-32 pb-32 min-h-screen">
      <Link to="/booking" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors mb-10">
        <ArrowLeft className="size-3.5" /> Back to reservation
      </Link>

      {confirmed ? (
        <Confirmed stableName={stable.name} date={sel.date!} />
      ) : (
        <>
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Concierge · Final review</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1] text-balance max-w-3xl">A frictionless farewell.</h1>
          </Reveal>

          <div className="mt-16 grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7 space-y-12">
              <Reveal>
                <Section eyebrow="Your ride">
                  <div className="grid sm:grid-cols-12 gap-6 items-start">
                    <div className="sm:col-span-4 aspect-[4/5] overflow-hidden bg-surface">
                      <img src={horse.image} alt={horse.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="sm:col-span-8">
                      <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{stable.name}</p>
                      <h3 className="font-display text-3xl mt-1 leading-tight">{horse.name}</h3>
                      <p className="mt-2 text-ink-muted">{horse.breed} · {horse.temperament}</p>

                      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <Meta label="Date" value={format(sel.date!, "d MMM yyyy")} />
                        <Meta label="Slot" value={sel.slot!} />
                        <Meta label="Party" value={`${sel.party} rider${sel.party === 1 ? "" : "s"}`} />
                        <Meta label="Tier" value={horse.adminTier} />
                      </dl>
                    </div>
                  </div>
                </Section>
              </Reveal>

              <Reveal delay={0.1}>
                <Section eyebrow="Guest details">
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                    <Field label="Full name" placeholder="As on passport" />
                    <Field label="Email" type="email" placeholder="concierge@example.com" />
                    <Field label="Phone" type="tel" placeholder="+20 ·" />
                    <Field label="Riding experience" placeholder="Novice · Intermediate · Advanced" />
                    <div className="sm:col-span-2">
                      <Field label="Special requests" placeholder="Allergies, dietary notes, photographer, anything" textarea />
                    </div>
                  </div>
                </Section>
              </Reveal>

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
                            {active && <motion.span layoutId="pay-toggle" className="absolute inset-0 bg-foreground" transition={{ duration: 0.45, ease: easeLuxury }} />}
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
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
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

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 border hairline bg-surface-elevated/60 p-8">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-6">Reservation summary</p>

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
                  <Line label={`${horse.name} · ${sel.party}h × $${horse.pricePerHour}`} value={`$${subtotal.toFixed(0)}`} />
                  {discount > 0 && <Line label={`Discount · ${appliedPromo?.code}`} value={`−$${discount.toFixed(0)}`} />}
                  <Line label="Concierge service (8%)" value={`$${concierge.toFixed(0)}`} />
                </div>

                <div className="mt-6 pt-5 border-t hairline flex items-baseline justify-between">
                  <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Total due</span>
                  <span className="font-display text-4xl">${total.toFixed(0)}</span>
                </div>

                <button
                  onClick={onConfirm}
                  disabled={cashBlocked}
                  className={cn(
                    "mt-8 w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-[12px] tracking-[0.2em] uppercase group overflow-hidden relative transition-colors",
                    cashBlocked ? "bg-foreground/20 text-foreground/40 cursor-not-allowed" : "bg-foreground text-background",
                  )}
                >
                  <span className="relative z-10">
                    {paymentMethod === "cash" ? "Reserve · pay in cash on arrival" : "Confirm reservation"}
                  </span>
                </button>

                <p className="mt-6 text-xs text-ink-muted text-pretty">
                  By confirming, you agree to the gracious cancellation policy: full refund up to 48 hours before arrival.
                </p>
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

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</p>
    <p className="mt-1 text-foreground">{value}</p>
  </div>
);

const Field = ({ label, placeholder, type = "text", textarea, icon }: { label: string; placeholder?: string; type?: string; textarea?: boolean; icon?: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</span>
    <div className="relative mt-2">
      {textarea ? (
        <textarea rows={3} placeholder={placeholder} className={cn(
          "w-full bg-transparent border-b hairline pb-3 pt-1 text-foreground placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors resize-none",
        )} />
      ) : (
        <input type={type} placeholder={placeholder} className={cn(
          "w-full bg-transparent border-b hairline pb-3 pt-1 text-foreground placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors",
          icon && "pr-8",
        )} />
      )}
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

const Confirmed = ({ stableName, date }: { stableName: string; date: Date }) => {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center pt-10">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: easeLuxury }}
        className="size-20 rounded-full bg-foreground text-background inline-flex items-center justify-center mb-10"
      >
        <Check className="size-8" />
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: easeLuxury }}
        className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Reservation received</motion.p>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.9, ease: easeLuxury }}
        className="font-display text-4xl md:text-6xl leading-[1.05] text-balance max-w-2xl">
        We'll see you at {stableName.split(" ")[0]}, on {format(date, "d MMMM")}.
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-6 max-w-md text-ink-soft text-pretty">
        Your concierge will write within 24 hours to confirm the precise hour, the linen, and the route.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}
        className="mt-12 flex gap-4">
        <Link to="/dashboard" className="inline-flex px-6 py-3.5 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase">View your journeys</Link>
        <Link to="/" className="inline-flex px-6 py-3.5 border hairline text-[12px] tracking-[0.2em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Return home</Link>
      </motion.div>
    </div>
  );
};

export default Checkout;
