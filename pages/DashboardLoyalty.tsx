"use client";
import { Link } from "@/components/shared/shims";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Trophy } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { currentUser, TIER_THRESHOLDS, type AdminTier } from "@/data/mock";
import { cn } from "@/lib/utils";

const PERKS = [
  { tier: "novice", label: "Welcome", note: "A first ride, a quiet introduction. Your record opens." },
  { tier: "intermediate", label: "Standing", note: "Priority on sunrise and sunset slots, complimentary tea service." },
  { tier: "advanced", label: "Cercle", note: "Direct line to the concierge, complimentary photographer once a season." },
  { tier: "master", label: "House", note: "Private estate visits, single-party reservations, an annual desert dinner." },
] as const;

const HISTORY = [
  { date: "Apr 2026", note: "Saqqara Half-Day Expedition", points: 240 },
  { date: "Mar 2026", note: "Sunrise at the Pyramids", points: 180 },
  { date: "Feb 2026", note: "Sunset Ride for Two", points: 140 },
  { date: "Jan 2026", note: "Cercle annual contribution", points: 220 },
  { date: "Dec 2025", note: "Anniversary ride · Meridian", points: 160 },
];

const DashboardLoyalty = () => {
  const tiers: AdminTier[] = ["novice", "intermediate", "advanced", "master"];
  const points = currentUser.rankPoints;
  const currentTier: AdminTier = [...tiers].reverse().find((t) => points >= TIER_THRESHOLDS[t]) ?? "novice";
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : TIER_THRESHOLDS.master;
  const prevThreshold = TIER_THRESHOLDS[currentTier];
  const progress = nextTier ? Math.min(1, (points - prevThreshold) / (nextThreshold - prevThreshold)) : 1;

  return (
    <div className="container pt-32 pb-32 min-h-screen">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Le Cercle · Your standing</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance max-w-3xl">A small loyalty, kept in private.</h1>
      </Reveal>

      {/* Standing card */}
      <Reveal className="mt-16">
        <div className="border hairline bg-surface-elevated/40 p-10 md:p-14 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-2"><Trophy className="size-3" /> Current standing</p>
            <p className="mt-4 font-display text-7xl tabular-nums leading-none">{points}<span className="text-2xl text-ink-muted"> pts</span></p>
            <p className="mt-3 text-[11px] tracking-luxury uppercase capitalize text-foreground">{currentTier} tier</p>
          </div>
          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{nextTier ? `Toward ${nextTier}` : "Master tier reached"}</p>
              {nextTier && <p className="text-xs text-ink-muted tabular-nums">{points} / {nextThreshold} pts</p>}
            </div>
            <div className="relative h-px bg-hairline overflow-hidden">
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: progress }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: easeLuxury }}
                style={{ originX: 0 }}
                className="absolute inset-0 bg-foreground"
              />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {(tiers || []).map((t) => {
                const reached = points >= TIER_THRESHOLDS[t];
                return (
                  <div key={t} className={cn("border-t pt-3", reached ? "border-foreground" : "border-hairline")}>
                    <p className={cn("text-[10px] tracking-luxury uppercase capitalize", reached ? "text-foreground" : "text-ink-muted")}>{t}</p>
                    <p className="text-xs text-ink-muted tabular-nums">{TIER_THRESHOLDS[t]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Perks ladder */}
      <section className="mt-24">
        <div className="flex items-end justify-between mb-10 border-b hairline pb-5">
          <h2 className="font-display text-3xl md:text-5xl">What each tier unlocks</h2>
          <Link to="/cercle" className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors inline-flex items-center gap-2">
            <Sparkles className="size-3" /> About Le Cercle
          </Link>
        </div>
        <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
          {(PERKS || []).map((p) => {
            const reached = points >= TIER_THRESHOLDS[p.tier as AdminTier];
            return (
              <StaggerItem key={p.tier}>
                <div className={cn("bg-background p-8 h-full", reached && "bg-surface")}>
                  <p className={cn("text-[10px] tracking-luxury uppercase capitalize", reached ? "text-foreground" : "text-ink-muted")}>{p.tier}</p>
                  <h3 className="mt-3 font-display text-2xl">{p.label}</h3>
                  <p className="mt-4 text-sm text-ink-soft text-pretty">{p.note}</p>
                  {reached && <p className="mt-5 text-[10px] tracking-luxury uppercase text-foreground">Unlocked</p>}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      {/* Earnings history */}
      <section className="mt-24">
        <div className="flex items-end justify-between mb-10 border-b hairline pb-5">
          <h2 className="font-display text-3xl md:text-5xl">Your record</h2>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{HISTORY.length} entries</p>
        </div>
        <ul>
          {(HISTORY || []).map((h, i) => (
            <li key={i} className="grid md:grid-cols-12 gap-4 py-5 border-b hairline items-center">
              <p className="md:col-span-2 text-[11px] tracking-luxury uppercase text-ink-muted">{h.date}</p>
              <p className="md:col-span-8 font-display text-xl">{h.note}</p>
              <p className="md:col-span-2 md:text-right tabular-nums text-foreground">+{h.points} pts</p>
            </li>
          ))}
        </ul>
      </section>

      <Reveal className="mt-16">
        <Link to="/booking" className="inline-flex items-center gap-3 px-7 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase group">
          Earn more points → reserve <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>
    </div>
  );
};

export default DashboardLoyalty;
