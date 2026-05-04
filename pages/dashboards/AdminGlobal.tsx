"use client";
import { Link } from "@/components/shared/shims";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Users, Crown, MapPin, Settings, ShieldAlert } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { stables, transportZones, horses } from "@/data/mock";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Global Admin dashboard — platform-wide oversight
// /api/admin/stables/[id]/commission, /api/admin/horse-changes/[id]/approve
// ─────────────────────────────────────────────────────────────────────────────

const HORSE_CHANGES = [
  { id: "hc1", stable: "Al-Nasr",          horse: "Anubis",     change: "Rename → Anubis Mk II",     submitted: "2h ago", status: "pending" },
  { id: "hc2", stable: "Saqqara",          horse: "Ra",         change: "Price · $220 → $260 / hr",  submitted: "1d ago", status: "pending" },
  { id: "hc3", stable: "House of Horus",   horse: "Nut",        change: "Tier · novice → intermediate", submitted: "3d ago", status: "approved" },
];

const OVERRIDES = [
  { id: "or1", rider: "Yusuf Hadid", rank: 980,  horse: "Ra (master)",     submitted: "20m ago", status: "pending" },
  { id: "or2", rider: "Mei Lin",     rank: 1180, horse: "Nefertari (advanced)", submitted: "1h ago", status: "pending" },
];

const PLATFORM_USERS = [
  { role: "Riders",       count: 1284, growth: "+8.2%" },
  { role: "Stable owners", count: 12,   growth: "+1" },
  { role: "Captains",     count: 6,    growth: "—" },
  { role: "Drivers",      count: 22,   growth: "+3" },
  { role: "CX media",     count: 4,    growth: "—" },
];

const AdminGlobal = () => (
  <div className="min-h-screen pt-28">
    <div className="container border-b hairline pb-6">
      <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Platform · Administrator</p>
      <h1 className="font-display text-4xl md:text-5xl leading-none">The whole house.</h1>
    </div>

    <div className="container py-12 pb-32 space-y-16">
      {/* Platform KPIs */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
        {[
          { label: "GMV · 30d",    value: "$214,580", icon: Crown },
          { label: "Net commission · 30d", value: "$32,187", icon: Building2 },
          { label: "Active stables",       value: stables.length, icon: Building2 },
          { label: "Active horses",        value: horses.filter((h) => h.isActive).length, icon: Users },
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

      {/* Stables · commission editor */}
      <Reveal>
        <div className="flex items-end justify-between mb-6 border-b hairline pb-5">
          <h2 className="font-display text-3xl md:text-4xl">Stables</h2>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">PATCH /api/admin/stables/[id]/commission</p>
        </div>
        <div className="border hairline">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b hairline bg-surface/40 text-[10px] tracking-luxury uppercase text-ink-muted">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-2">Established</div>
            <div className="col-span-2 text-right">Commission</div>
            <div className="col-span-1 text-right" />
          </div>
          {(stables || []).map((s) => (
            <div key={s.id} className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 border-b hairline last:border-b-0 hover:bg-surface/50 transition-colors items-center">
              <div className="md:col-span-4 font-display text-xl">{s.name}</div>
              <div className="md:col-span-3 text-sm text-ink-soft inline-flex items-center gap-1.5"><MapPin className="size-3" /> {s.location}</div>
              <div className="md:col-span-2 text-xs tracking-luxury uppercase text-ink-muted">{s.established}</div>
              <div className="md:col-span-2 text-right font-display text-2xl tabular-nums">{(s.commissionRate * 100).toFixed(0)}<span className="text-sm text-ink-muted">%</span></div>
              <div className="md:col-span-1 flex md:justify-end">
                <button className="inline-flex size-9 items-center justify-center border hairline rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-500">
                  <Settings className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Horse change approvals */}
        <Reveal>
          <h2 className="font-display text-3xl mb-6 border-b hairline pb-4">Horse change requests</h2>
          <ul className="space-y-0">
            {HORSE_CHANGES.map((c) => (
              <li key={c.id} className="grid grid-cols-12 gap-3 items-center py-5 border-b hairline">
                <div className="col-span-6">
                  <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{c.stable} · {c.horse}</p>
                  <p className="font-display text-lg mt-1">{c.change}</p>
                  <p className="text-xs text-ink-muted">{c.submitted}</p>
                </div>
                <div className="col-span-6 flex justify-end gap-2">
                  {c.status === "pending" ? (
                    <>
                      <button className="px-4 py-2 border hairline text-[10px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Decline</button>
                      <button className="px-4 py-2 bg-foreground text-background text-[10px] tracking-[0.18em] uppercase">Approve</button>
                    </>
                  ) : (
                    <span className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-foreground" /> {c.status}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Skill override requests */}
        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl mb-6 border-b hairline pb-4 inline-flex items-center gap-3">
            <ShieldAlert className="size-5" /> Skill overrides
          </h2>
          <ul className="space-y-0">
            {(OVERRIDES || []).map((o) => (
              <li key={o.id} className="grid grid-cols-12 gap-3 items-center py-5 border-b hairline">
                <div className="col-span-7">
                  <p className="font-display text-lg">{o.rider}</p>
                  <p className="text-xs text-ink-muted">{o.rank} pts · requesting {o.horse}</p>
                  <p className="text-xs text-ink-muted">{o.submitted}</p>
                </div>
                <div className="col-span-5 flex justify-end gap-2">
                  <button className="px-4 py-2 border hairline text-[10px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Decline</button>
                  <button className="px-4 py-2 bg-foreground text-background text-[10px] tracking-[0.18em] uppercase">Grant</button>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Transport zones */}
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl mb-6 border-b hairline pb-5">Transport zones</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-hairline border hairline">
          {(transportZones || []).map((z) => (
            <div key={z.id} className="bg-background p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{z.id}</p>
              <p className="font-display text-xl mt-2">{z.name}</p>
              <p className="mt-3 font-display text-3xl">{z.price ? `$${z.price}` : "Included"}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Users */}
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl mb-6 border-b hairline pb-5">Members</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-hairline border hairline">
          {PLATFORM_USERS.map((u) => (
            <div key={u.role} className="bg-background p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{u.role}</p>
              <p className="mt-3 font-display text-3xl tabular-nums">{u.count.toLocaleString()}</p>
              <p className="mt-1 text-xs text-ink-muted">{u.growth}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-5">Other consoles</p>
        <div className="grid md:grid-cols-3 gap-px bg-hairline border hairline">
          {[
            { to: "/dashboard/captain",  label: "Captain · Academy",     hint: "Programmes, students, sessions" },
            { to: "/dashboard/driver",   label: "Driver · Logistics",    hint: "Transport queue & history" },
            { to: "/dashboard/cx-media", label: "CX media · Gallery",    hint: "Photo curation & tickets" },
          ].map((d) => (
            <Link key={d.to} to={d.to} className="bg-background p-7 group hover:bg-surface/60 transition-colors flex items-start justify-between gap-6">
              <div>
                <p className="font-display text-2xl leading-tight">{d.label}</p>
                <p className="text-xs text-ink-muted mt-1.5">{d.hint}</p>
              </div>
              <ArrowUpRight className="size-4 mt-1 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  </div>
);

export default AdminGlobal;
