"use client";
import { motion } from "framer-motion";
import { Car, MapPin, Clock, CheckCircle2, Navigation } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import { transportZones } from "@/data/mock";

// ─────────────────────────────────────────────────────────────────────────────
// Driver dashboard — Transportation queue & history
// Surfaces /api/checkout/package notifications dispatched to the driver pool.
// ─────────────────────────────────────────────────────────────────────────────

type Run = {
  id: string;
  status: "queued" | "en-route" | "completed";
  pickupZoneId: string;
  pickupAt: string;       // ISO time string for display
  guest: string;
  party: number;
  destination: string;
  estimateMin: number;
  fee: number;
};

const today = new Date();
const t = (h: number, m = 0) => { const d = new Date(today); d.setHours(h, m, 0, 0); return d.toISOString(); };

const RUNS: Run[] = [
  { id: "r1", status: "queued",    pickupZoneId: "tz-zamalek",   pickupAt: t(6, 0),  guest: "Devereux party",   party: 2, destination: "Al-Nasr Heritage Stables", estimateMin: 35, fee: 45 },
  { id: "r2", status: "queued",    pickupZoneId: "tz-newcairo",  pickupAt: t(7, 30), guest: "Hayashi",          party: 4, destination: "Saqqara Royal Equestrian", estimateMin: 55, fee: 70 },
  { id: "r3", status: "en-route",  pickupZoneId: "tz-airport",   pickupAt: t(5, 30), guest: "Lindqvist",        party: 2, destination: "House of Horus",           estimateMin: 60, fee: 95 },
  { id: "r4", status: "completed", pickupZoneId: "tz-giza",      pickupAt: t(-1, 0), guest: "Castellanos",      party: 6, destination: "Saqqara Royal Equestrian", estimateMin: 0,  fee: 0  },
  { id: "r5", status: "completed", pickupZoneId: "tz-zamalek",   pickupAt: t(-3, 0), guest: "Okonkwo",          party: 1, destination: "Al-Nasr Heritage Stables", estimateMin: 0,  fee: 45 },
];

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const DriverDashboard = () => {
  const queued = RUNS.filter((r) => r.status === "queued");
  const enroute = RUNS.filter((r) => r.status === "en-route");
  const completed = RUNS.filter((r) => r.status === "completed");

  return (
    <div className="min-h-screen pt-28">
      <div className="container border-b hairline pb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Logistics · Driver</p>
          <h1 className="font-display text-4xl md:text-5xl leading-none">Transport queue</h1>
        </div>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted">Today · {today.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>
      </div>

      <div className="container py-12 pb-32 space-y-16">
        <StaggerGroup className="grid grid-cols-3 gap-px bg-hairline border hairline" gap={0.06}>
          {[
            { label: "Queued", value: queued.length, icon: Clock },
            { label: "En route", value: enroute.length, icon: Navigation },
            { label: "Completed today", value: completed.length, icon: CheckCircle2 },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <div className="bg-background p-8">
                <s.icon className="size-4 text-ink-muted mb-4" />
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.label}</p>
                <p className="mt-3 font-display text-4xl">{s.value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Queue */}
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl mb-6 border-b hairline pb-5">Up next</h2>
          <ul className="space-y-0">
            {[...enroute, ...queued].map((r) => {
              const zone = transportZones.find((z) => z.id === r.pickupZoneId);
              return (
                <li key={r.id} className="grid grid-cols-12 gap-4 items-center py-6 border-b hairline">
                  <div className="col-span-2">
                    <p className="font-display text-3xl leading-none tabular-nums">{fmtTime(r.pickupAt)}</p>
                    <span className={cn(
                      "mt-2 inline-flex items-center gap-1.5 text-[10px] tracking-luxury uppercase",
                      r.status === "en-route" ? "text-foreground" : "text-ink-muted",
                    )}>
                      <span className={cn("size-1.5 rounded-full", r.status === "en-route" ? "bg-foreground animate-pulse" : "bg-ink-muted")} />
                      {r.status}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <p className="text-foreground font-display text-2xl">{r.guest}</p>
                    <p className="text-xs text-ink-muted mt-1">{r.party} guest{r.party === 1 ? "" : "s"}</p>
                  </div>
                  <div className="col-span-3 text-sm">
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1 inline-flex items-center gap-1.5"><MapPin className="size-3" /> Pick-up</p>
                    <p className="text-foreground">{zone?.name}</p>
                    <p className="text-xs text-ink-muted">→ {r.destination}</p>
                  </div>
                  <div className="col-span-2 flex flex-col items-end gap-2">
                    <p className="text-xs text-ink-muted tabular-nums">~{r.estimateMin}m</p>
                    <button className="px-4 py-2 border hairline text-[10px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
                      {r.status === "en-route" ? "Mark complete" : "Accept"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* History */}
        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl md:text-4xl mb-6 border-b hairline pb-5">In the archive</h2>
          <div className="border hairline">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b hairline bg-surface/40 text-[10px] tracking-luxury uppercase text-ink-muted">
              <div className="col-span-3">Guest</div>
              <div className="col-span-3">Pick-up zone</div>
              <div className="col-span-3">Destination</div>
              <div className="col-span-1 text-right">Party</div>
              <div className="col-span-2 text-right">Fee</div>
            </div>
            {(completed || []).map((r) => {
              const zone = transportZones.find((z) => z.id === r.pickupZoneId);
              return (
                <div key={r.id} className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 border-b hairline last:border-b-0 hover:bg-surface/50 transition-colors items-center">
                  <div className="md:col-span-3 font-display text-xl">{r.guest}</div>
                  <div className="md:col-span-3 text-sm text-ink-soft inline-flex items-center gap-1.5"><MapPin className="size-3" /> {zone?.name}</div>
                  <div className="md:col-span-3 text-sm">{r.destination}</div>
                  <div className="md:col-span-1 text-sm md:text-right tabular-nums">{r.party}</div>
                  <div className="md:col-span-2 text-sm md:text-right tabular-nums">{r.fee ? `$${r.fee}` : "Included"}</div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default DriverDashboard;
