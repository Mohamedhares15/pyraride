"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/components/shared/shims";
import { ArrowUpRight, Calendar, Check, Clock, Plus, TrendingUp, Users, BarChart3, Layers } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { horses, packages, stables } from "@/data/mock";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Bookings", "Roster", "Packages"] as const;
type Tab = typeof TABS[number];

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const BOOKINGS = [
  { id: "b1", guest: "Mr. & Mrs. Devereux", packageId: "p1", date: new Date(Date.now() + 86400000 * 2), party: 2, total: 1037, status: "confirmed" },
  { id: "b2", guest: "Hayashi party",        packageId: "p4", date: new Date(Date.now() + 86400000 * 5), party: 4, total: 1556, status: "pending" },
  { id: "b3", guest: "Ms. Okonkwo",          packageId: "p1", date: new Date(Date.now() + 86400000 * 9), party: 1, total: 518,  status: "confirmed" },
  { id: "b4", guest: "Castellanos family",   packageId: "p4", date: new Date(Date.now() + 86400000 * 14), party: 6, total: 2333, status: "confirmed" },
  { id: "b5", guest: "Mr. Lindqvist",        packageId: "p1", date: new Date(Date.now() - 86400000 * 3), party: 2, total: 1037, status: "completed" },
] as const;

const Admin = () => {
  const [tab, setTab] = useState<Tab>("Overview");
  const stable = stables[0]; // current operator
  const stableHorses = horses.filter((h) => h.stableId === stable.id);
  const stablePackages = packages.filter((p) => p.stableId === stable.id);

  return (
    <div className="min-h-screen pt-28">
      {/* Brand bar */}
      <div className="container border-b hairline pb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Stable OS · Operator console</p>
          <h1 className="font-display text-4xl md:text-5xl leading-none">{stable.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
            <Plus className="size-3.5" /> New booking
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
            Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container border-b hairline">
        <ul className="flex gap-8 overflow-x-auto">
          {(TABS || []).map((t) => {
            const active = tab === t;
            return (
              <li key={t}>
                <button
                  onClick={() => setTab(t)}
                  className={cn(
                    "relative py-5 text-[11px] tracking-luxury uppercase transition-colors",
                    active ? "text-foreground" : "text-ink-muted hover:text-foreground",
                  )}
                >
                  {t}
                  {active && <motion.span layoutId="admin-tab" className="absolute left-0 right-0 -bottom-px h-px bg-foreground" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="container py-12 pb-32">
        {tab === "Overview" && <Overview />}
        {tab === "Bookings" && <Bookings />}
        {tab === "Roster" && <Roster horses={stableHorses} />}
        {tab === "Packages" && <PackagesPanel pkgs={stablePackages} />}
      </div>
    </div>
  );
};

/* ---------- OVERVIEW ---------- */

const STATS = [
  { label: "Revenue · 30d", value: "$48,210", trend: "+12.4%" },
  { label: "Bookings · 30d", value: "32", trend: "+6" },
  { label: "Occupancy",      value: "78%", trend: "+4 pts" },
  { label: "Avg. party",     value: "2.6", trend: "+0.2" },
];

const SPARK = [12, 18, 16, 22, 28, 24, 32, 36, 30, 38, 44, 41, 48, 52];

const Overview = () => (
  <>
    <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
      {(STATS || []).map((s) => (
        <StaggerItem key={s.label}>
          <div className="bg-background p-8">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.label}</p>
            <p className="mt-3 font-display text-4xl">{s.value}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-foreground/70"><TrendingUp className="size-3" /> {s.trend}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>

    <div className="mt-12 grid lg:grid-cols-3 gap-8">
      <Reveal className="lg:col-span-2 border hairline bg-surface-elevated/40 p-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Revenue · last 14 days</p>
            <p className="font-display text-3xl">$48,210</p>
          </div>
          <p className="text-xs text-ink-muted">vs. $42,860 prior period</p>
        </div>
        <Spark data={SPARK} />
      </Reveal>

      <Reveal delay={0.1} className="border hairline bg-surface-elevated/40 p-8">
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-5">Today's roster</p>
        <ul className="space-y-4">
          {BOOKINGS.slice(0, 3).map((b) => {
            const pkg = packages.find((p) => p.id === b.packageId)!;
            return (
              <li key={b.id} className="flex items-center justify-between gap-3 border-b hairline pb-4 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-foreground truncate">{b.guest}</p>
                  <p className="text-xs text-ink-muted truncate">{pkg.name} · {b.party} guests</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm">{fmt(b.date)}</p>
                  <p className="text-xs text-ink-muted">${b.total}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </div>

    {/* Sub-page nav */}
    <Reveal className="mt-12">
      <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-5">Deep dive</p>
      <div className="grid md:grid-cols-3 gap-px bg-hairline border hairline">
        {[
          { to: "/admin/horses",    icon: Layers,    label: "Horse management",  hint: "Roster, CRUD, retire" },
          { to: "/admin/schedule",  icon: Calendar,  label: "Booking schedule",  hint: "Calendar & day ledger" },
          { to: "/admin/analytics", icon: BarChart3, label: "Revenue analytics", hint: "Trends & composition" },
        ].map(({ to, icon: Icon, label, hint }) => (
          <Link key={to} to={to} className="bg-background p-7 group hover:bg-surface/60 transition-colors flex items-start justify-between gap-6">
            <div>
              <Icon className="size-4 mb-4" />
              <p className="font-display text-2xl leading-tight">{label}</p>
              <p className="text-xs text-ink-muted mt-1.5">{hint}</p>
            </div>
            <ArrowUpRight className="size-4 mt-1 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Reveal>
  </>
);

const Spark = ({ data }: { data: number[] }) => {
  const w = 600, h = 140, max = Math.max(...data), min = Math.min(...data);
  const pts = (data || []).map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 12) - 6;
    return [x, y] as const;
  });
  const path = (pts || []).map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
      <motion.path d={area} fill="hsl(var(--foreground) / 0.06)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, ease: easeLuxury }} />
      <motion.path d={path} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1.25}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: easeLuxury }} />
      {(pts || []).map((p, i) => (
        <motion.circle key={i} cx={p[0]} cy={p[1]} r={1.75} fill="hsl(var(--foreground))"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.04, duration: 0.4 }} />
      ))}
    </svg>
  );
};

/* ---------- BOOKINGS ---------- */

const Bookings = () => (
  <div>
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Bookings · {BOOKINGS.length}</p>
        <h2 className="font-display text-3xl md:text-4xl">All reservations</h2>
      </div>
      <div className="flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted">
        <Calendar className="size-3.5" /> Last 30 days
      </div>
    </div>

    <div className="border hairline">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b hairline bg-surface/40 text-[10px] tracking-luxury uppercase text-ink-muted">
        <div className="col-span-3">Guest</div>
        <div className="col-span-3">Journey</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1">Party</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1 text-right">Status</div>
      </div>
      <StaggerGroup gap={0.05}>
        {(BOOKINGS || []).map((b) => {
          const pkg = packages.find((p) => p.id === b.packageId)!;
          return (
            <StaggerItem key={b.id}>
              <div className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 border-b hairline last:border-b-0 hover:bg-surface/50 transition-colors items-center">
                <div className="md:col-span-3 font-display text-xl">{b.guest}</div>
                <div className="md:col-span-3 text-sm text-ink-soft">{pkg.name}</div>
                <div className="md:col-span-2 text-sm">{fmt(b.date)}</div>
                <div className="md:col-span-1 text-sm">{b.party}</div>
                <div className="md:col-span-2 text-sm md:text-right tabular-nums">${b.total}</div>
                <div className="md:col-span-1 md:text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] tracking-luxury uppercase",
                    b.status === "confirmed" ? "text-foreground" :
                    b.status === "pending"   ? "text-ink-muted" : "text-ink-muted/60",
                  )}>
                    <span className={cn("size-1.5 rounded-full",
                      b.status === "confirmed" ? "bg-foreground" : "bg-ink-muted")} />
                    {b.status}
                  </span>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  </div>
);

/* ---------- ROSTER ---------- */

const Roster = ({ horses: hs }: { horses: typeof horses }) => (
  <div>
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Roster · {hs.length}</p>
        <h2 className="font-display text-3xl md:text-4xl">Our horses</h2>
      </div>
      <button className="inline-flex items-center gap-2 px-4 py-2.5 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
        <Plus className="size-3.5" /> Add horse
      </button>
    </div>
    <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
      {(hs || []).map((h) => (
        <StaggerItem key={h.id}>
          <article className="border hairline bg-surface-elevated/40 group overflow-hidden">
            <div className="aspect-[3/4] overflow-hidden bg-surface">
              <motion.img src={h.image} alt={h.name} className="h-full w-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 1.2, ease: easeLuxury }} />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl leading-tight">{h.name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] tracking-luxury uppercase text-foreground"><Check className="size-3" /> Active</span>
              </div>
              <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-muted">{h.age} yrs</p>
              <p className="mt-2 text-xs text-ink-soft">{h.temperament}</p>
            </div>
          </article>
        </StaggerItem>
      ))}
    </StaggerGroup>
  </div>
);

/* ---------- PACKAGES ---------- */

const PackagesPanel = ({ pkgs }: { pkgs: typeof packages }) => (
  <div>
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Packages · {pkgs.length}</p>
        <h2 className="font-display text-3xl md:text-4xl">Signature journeys</h2>
      </div>
      <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
        <Plus className="size-3.5" /> New package
      </button>
    </div>
    <StaggerGroup className="space-y-0 border-t hairline" gap={0.06}>
      {(pkgs || []).map((p, i) => (
        <StaggerItem key={p.id}>
          <div className="grid md:grid-cols-12 gap-6 items-center py-6 border-b hairline">
            <div className="md:col-span-1 text-[11px] tracking-luxury uppercase text-ink-muted">№ {String(i + 1).padStart(2, "0")}</div>
            <div className="md:col-span-5">
              <h3 className="font-display text-2xl leading-tight">{p.name}</h3>
              <p className="text-sm text-ink-muted mt-1">{p.tagline}</p>
            </div>
            <div className="md:col-span-2 text-sm text-ink-soft inline-flex items-center gap-1.5"><Clock className="size-3" /> {p.duration}</div>
            <div className="md:col-span-2 text-sm text-ink-soft inline-flex items-center gap-1.5"><Users className="size-3" /> {p.minPeople}–{p.maxPeople}</div>
            <div className="md:col-span-1 font-display text-xl">${p.price}</div>
            <div className="md:col-span-1 flex md:justify-end">
              <button className="inline-flex size-9 items-center justify-center border hairline rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-500">
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  </div>
);

export default Admin;
