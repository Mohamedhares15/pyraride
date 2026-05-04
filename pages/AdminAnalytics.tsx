import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { packages } from "@/data/mock";

const MONTHLY = [
  { m: "May", v: 28 }, { m: "Jun", v: 32 }, { m: "Jul", v: 41 }, { m: "Aug", v: 38 },
  { m: "Sep", v: 44 }, { m: "Oct", v: 52 }, { m: "Nov", v: 49 }, { m: "Dec", v: 61 },
  { m: "Jan", v: 58 }, { m: "Feb", v: 64 }, { m: "Mar", v: 72 }, { m: "Apr", v: 78 },
];

const BREAKDOWN = packages.map((p, i) => ({
  name: p.name,
  revenue: [18420, 22640, 14280, 9320][i] ?? 8000,
  bookings: [38, 22, 8, 26][i] ?? 12,
}));

const KPI = [
  { label: "Revenue · YTD",       value: "$284,460", trend: 18.4, up: true },
  { label: "Avg. ticket",         value: "$1,068",   trend: 6.2, up: true },
  { label: "Repeat guests",       value: "31%",      trend: 4.1, up: true },
  { label: "Cancellation rate",   value: "2.4%",     trend: -1.2, up: false },
];

const AdminAnalytics = () => {
  const max = Math.max(...MONTHLY.map((d) => d.v));
  const maxRev = Math.max(...BREAKDOWN.map((b) => b.revenue));

  return (
    <div className="min-h-screen pt-28">
      <div className="container">
        <Link to="/admin" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Stable OS
        </Link>
      </div>

      <div className="container border-b hairline pb-6 pt-6">
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Revenue analytics</p>
        <h1 className="font-display text-4xl md:text-6xl leading-none">A quiet ledger.</h1>
      </div>

      <div className="container py-12 space-y-16">
        {/* KPI band */}
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
          {KPI.map((k) => {
            const Trend = k.up ? TrendingUp : TrendingDown;
            return (
              <StaggerItem key={k.label}>
                <div className="bg-background p-8">
                  <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{k.label}</p>
                  <p className="mt-3 font-display text-4xl">{k.value}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-foreground/70">
                    <Trend className="size-3" /> {k.trend > 0 ? "+" : ""}{k.trend}%
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Revenue trend bars */}
        <Reveal className="border hairline bg-surface-elevated/40 p-8 md:p-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Revenue · 12 months (in thousands)</p>
              <p className="font-display text-3xl">Trailing year</p>
            </div>
            <p className="text-xs text-ink-muted">+38% YoY</p>
          </div>
          <div className="grid grid-cols-12 gap-2 md:gap-3 h-64 items-end">
            {MONTHLY.map((d, i) => (
              <div key={d.m} className="flex flex-col items-center gap-3 h-full">
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: d.v / max }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.05, ease: easeLuxury }}
                    style={{ transformOrigin: "bottom" }}
                    className="w-full bg-foreground"
                  />
                </div>
                <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{d.m}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Breakdown by package */}
        <Reveal className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Composition</p>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Revenue by signature journey</h2>
            <p className="mt-4 text-sm text-ink-soft max-w-md">
              The Pharaoh's Banquet leads — a quiet confirmation that guests reach for the most considered experience.
            </p>
          </div>
          <div className="lg:col-span-7 space-y-6">
            {BREAKDOWN.map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: easeLuxury }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-display text-xl">{b.name}</p>
                  <p className="font-display text-xl tabular-nums">${b.revenue.toLocaleString()}</p>
                </div>
                <div className="h-px bg-hairline relative overflow-hidden">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: b.revenue / maxRev }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.08, ease: easeLuxury }}
                    style={{ transformOrigin: "left" }}
                    className="absolute inset-0 bg-foreground"
                  />
                </div>
                <p className="mt-2 text-xs text-ink-muted">{b.bookings} bookings · ${Math.round(b.revenue / b.bookings)} avg.</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AdminAnalytics;
