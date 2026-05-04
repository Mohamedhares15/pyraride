"use client";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle, DashTable, Pill, StatGrid } from "@/components/shared/DashShell";
import RoleGuard from "@/components/shared/RoleGuard";
import {
  STABLES, HORSES, PACKAGES, LOCATIONS, TRANSPORT_ZONES, ACADEMIES, DEMO_USERS,
} from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";
import { Check, X, Edit2, Plus, Trash2, Mail, Upload } from "lucide-react";

/** Generic admin page wrapper with SubNav + RoleGuard */
const AdminPage = ({ title, subtitle, actions, children }: {
  title: string; subtitle?: string; actions?: ReactNode; children: ReactNode;
}) => (
  <RoleGuard allow={["admin"]}>
    <SubNav kind="admin" />
    <DashShell eyebrow="Admin" title={title} subtitle={subtitle} actions={actions}>
      {children}
    </DashShell>
  </RoleGuard>
);

/* ============ ANALYTICS (was /admin/analytics, now also /dashboard/analytics) */
export const AdminAnalyticsPage = () => {
  const monthly = [12, 15, 18, 22, 19, 26, 31, 28, 34, 38, 42, 47];
  return (
    <AdminPage title="Analytics" subtitle="Revenue, growth, and platform health.">
      <StatGrid stats={[
        { label: "Revenue (mo)", value: fmtMoney(286400) },
        { label: "Bookings (mo)", value: 412, hint: "+18% vs last" },
        { label: "Active stables", value: STABLES.length },
        { label: "Active riders", value: 1240 },
      ]} />
      <div className="mt-12 border hairline p-8">
        <SectionTitle title="Bookings — last 12 months" />
        <div className="flex items-end gap-2 h-48">
          {(monthly || []).map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-foreground" style={{ height: `${(v / 50) * 100}%` }} />
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminPage>
  );
};

/* ============ OVERVIEW */
export const AdminOverviewPage = () => (
  <AdminPage title="Platform overview" subtitle="Pending approvals, system health, and quick actions.">
    <StatGrid stats={[
      { label: "Pending stables", value: 2, hint: "Awaiting review" },
      { label: "Pending changes", value: 5 },
      { label: "Open tickets", value: 3 },
      { label: "Uptime", value: "99.98%" },
    ]} />
    <div className="mt-12 grid lg:grid-cols-2 gap-8">
      <div className="border hairline p-7">
        <SectionTitle title="Pending approvals" />
        <ul className="space-y-3 text-sm">
          {STABLES.slice(0, 2).map((s) => (
            <li key={s.id} className="flex justify-between items-center border-b hairline pb-3">
              <span>{s.name}</span>
              <div className="flex gap-2">
                <button onClick={() => toast.success("Approved.")} className="p-1.5 border hairline hover:bg-foreground hover:text-background"><Check className="size-3" /></button>
                <button onClick={() => toast.success("Rejected.")} className="p-1.5 border hairline hover:bg-destructive hover:text-background"><X className="size-3" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="border hairline p-7">
        <SectionTitle title="System health" />
        <ul className="space-y-3 text-sm">
          {["API gateway", "Database", "Payment gateway", "Email service"].map((n) => (
            <li key={n} className="flex justify-between border-b hairline pb-3">
              <span>{n}</span>
              <Pill tone="success">operational</Pill>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </AdminPage>
);

/* ============ STABLES */
export const AdminStablesPage = () => {
  const [rows, setRows] = useState(STABLES);
  return (
    <AdminPage title="Stables" subtitle="Approve, reject, and set commission per stable.">
      <DashTable
        rows={rows}
        columns={[
          { key: "name", header: "Stable", cell: (s) => <span className="font-display">{s.name}</span> },
          { key: "loc", header: "Location", cell: (s) => <span className="text-ink-soft">{s.location}</span> },
          { key: "owner", header: "Owner", cell: (s) => s.ownerName },
          { key: "horses", header: "Horses", cell: (s) => <span className="tabular-nums">{s.horseCount}</span> },
          { key: "comm", header: "Commission", cell: (s) => (
            <input type="number" defaultValue={s.commissionRate * 100} onBlur={(e) => {
              setRows((p) => (p || []).map((x) => x.id === s.id ? { ...x, commissionRate: Number(e.target.value) / 100 } : x));
              toast.success(`${s.name}: commission updated`);
            }} className="w-16 bg-transparent border-b hairline text-sm text-right tabular-nums focus:outline-none focus:border-foreground" />
          ) },
          { key: "status", header: "Status", cell: (s) => <Pill tone={s.status === "approved" ? "success" : s.status === "pending_approval" ? "warning" : "danger"}>{s.status.replace("_", " ")}</Pill> },
          { key: "actions", header: "", cell: (s) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => toast.success(`${s.name} approved`)} className="p-2 border hairline hover:bg-foreground hover:text-background"><Check className="size-3.5" /></button>
              <button onClick={() => toast.success(`${s.name} rejected`)} className="p-2 border hairline hover:bg-destructive hover:text-background"><X className="size-3.5" /></button>
            </div>
          ) },
        ]}
      />
    </AdminPage>
  );
};

/* ============ HORSES (tier overrides) */
export const AdminHorsesPage = () => {
  const tiers = ["novice", "intermediate", "advanced", "master"] as const;
  return (
    <AdminPage title="Horse tiers" subtitle="Override admin tier classifications across all stables.">
      <DashTable
        rows={HORSES.slice(0, 20)}
        columns={[
          { key: "name", header: "Horse", cell: (h) => <span className="font-display">{h.name}</span> },
          { key: "stable", header: "Stable", cell: (h) => <span className="text-ink-soft">{h.stableName}</span> },
          { key: "color", header: "Color", cell: (h) => <span className="capitalize">{h.color}</span> },
          { key: "current", header: "Current tier", cell: (h) => <Pill>{h.adminTier}</Pill> },
          { key: "set", header: "Override", cell: (h) => (
            <select defaultValue={h.adminTier} onChange={(e) => toast.success(`${h.name}: tier → ${e.target.value}`)} className="bg-transparent border hairline px-2 py-1 text-xs">
              {(tiers || []).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) },
        ]}
      />
    </AdminPage>
  );
};

/* ============ HORSE CHANGES */
export const AdminHorseChangesPage = () => {
  const changes = HORSES.slice(0, 5).map((h, i) => ({
    id: `c-${i}`,
    horse: h,
    field: ["price", "skills", "tier", "bio", "images"][i],
    requestedBy: h.stableName,
    submittedAt: new Date(Date.now() - 86400000 * (i + 1)),
  }));
  return (
    <AdminPage title="Pending horse changes" subtitle="Stable-side edits awaiting review.">
      <DashTable
        rows={changes}
        empty="No pending changes."
        columns={[
          { key: "h", header: "Horse", cell: (c) => <span className="font-display">{c.horse.name}</span> },
          { key: "f", header: "Field", cell: (c) => <span className="capitalize">{c.field}</span> },
          { key: "by", header: "Requested by", cell: (c) => <span className="text-ink-soft">{c.requestedBy}</span> },
          { key: "when", header: "Submitted", cell: (c) => c.submittedAt.toLocaleDateString("en-GB") },
          { key: "act", header: "", cell: (c) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => toast.success("Change approved")} className="p-2 border hairline hover:bg-foreground hover:text-background"><Check className="size-3.5" /></button>
              <button onClick={() => toast.success("Change rejected")} className="p-2 border hairline hover:bg-destructive hover:text-background"><X className="size-3.5" /></button>
            </div>
          ) },
        ]}
      />
    </AdminPage>
  );
};

/* ============ PACKAGES */
export const AdminPackagesPage = () => (
  <AdminPage
    title="Packages"
    subtitle="All curated packages across the platform."
    actions={<button onClick={() => toast("Package editor would open.")} className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase"><Plus className="size-4" /> New package</button>}
  >
    <DashTable
      rows={PACKAGES}
      columns={[
        { key: "t", header: "Title", cell: (p) => <span className="font-display">{p.title}</span> },
        { key: "s", header: "Stable", cell: (p) => <span className="text-ink-soft">{p.stableName}</span> },
        { key: "type", header: "Type", cell: (p) => <Pill>{p.packageType.replace("_", " ").toLowerCase()}</Pill> },
        { key: "price", header: "Price", cell: (p) => <span className="tabular-nums">{fmtMoney(p.price)}</span> },
        { key: "feat", header: "Featured", cell: (p) => p.isFeatured ? <Pill tone="success">yes</Pill> : <Pill>no</Pill> },
        { key: "act", header: "", cell: () => (
          <button className="p-2 border hairline hover:bg-foreground hover:text-background"><Edit2 className="size-3.5" /></button>
        ) },
      ]}
    />
  </AdminPage>
);

/* ============ PACKAGE BOOKINGS */
export const AdminPackageBookingsPage = () => {
  const rows = Array.from({ length: 10 }).map((_, i) => ({
    id: `pb-${i}`, ref: `PBK-${4800 + i}`,
    pkg: PACKAGES[i % PACKAGES.length],
    rider: ["Y. Akel", "O. Karim", "L. Tabet", "H. Murad", "M. Said"][i % 5],
    date: new Date(Date.now() + 86400000 * (i - 3)),
    party: 1 + (i % 4),
    amount: PACKAGES[i % PACKAGES.length].price,
    status: i < 5 ? "confirmed" : i < 8 ? "pending" : "refunded",
  }));
  return (
    <AdminPage title="Package bookings" subtitle="All curated package reservations.">
      <DashTable rows={rows} columns={[
        { key: "ref", header: "Ref", cell: (r) => <span className="font-mono text-xs">{r.ref}</span> },
        { key: "pkg", header: "Package", cell: (r) => <span className="font-display">{r.pkg.title}</span> },
        { key: "rider", header: "Rider", cell: (r) => r.rider },
        { key: "date", header: "Date", cell: (r) => r.date.toLocaleDateString("en-GB") },
        { key: "party", header: "Party", cell: (r) => <span className="tabular-nums">{r.party}</span> },
        { key: "amt", header: "Amount", cell: (r) => <span className="tabular-nums">{fmtMoney(r.amount)}</span> },
        { key: "st", header: "Status", cell: (r) => <Pill tone={r.status === "confirmed" ? "success" : r.status === "pending" ? "warning" : "danger"}>{r.status}</Pill> },
      ]} />
    </AdminPage>
  );
};

/* ============ LOCATIONS */
export const AdminLocationsPage = () => {
  const [items, setItems] = useState(LOCATIONS);
  const [name, setName] = useState("");
  return (
    <AdminPage title="Locations" subtitle="Where stables operate.">
      <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; setItems((p) => [...p, { id: `loc-${Date.now()}`, name, region: "Giza" }]); setName(""); toast.success("Location added"); }} className="flex gap-3 mb-8 max-w-md">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Location name" className="flex-1 bg-transparent border-b hairline pb-2 focus:outline-none focus:border-foreground" />
        <button className="px-5 py-2 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">Add</button>
      </form>
      <DashTable rows={items} columns={[
        { key: "name", header: "Name", cell: (l) => l.name },
        { key: "region", header: "Region", cell: (l) => <span className="text-ink-soft">{l.region}</span> },
        { key: "act", header: "", cell: (l) => (
          <button onClick={() => { setItems((p) => p.filter((x) => x.id !== l.id)); toast.success("Removed"); }} className="p-2 border hairline hover:bg-destructive hover:text-background"><Trash2 className="size-3.5" /></button>
        ) },
      ]} />
    </AdminPage>
  );
};

/* ============ TRANSPORT ZONES */
export const AdminTransportZonesPage = () => {
  const [items, setItems] = useState(TRANSPORT_ZONES);
  return (
    <AdminPage title="Transport zones" subtitle="Pickup zones and per-zone pricing.">
      <DashTable rows={items} columns={[
        { key: "name", header: "Zone", cell: (z) => <span className="font-display">{z.name}</span> },
        { key: "price", header: "Price", cell: (z) => (
          <input type="number" defaultValue={z.price} onBlur={(e) => {
            setItems((p) => (p || []).map((x) => x.id === z.id ? { ...x, price: Number(e.target.value) } : x));
            toast.success(`${z.name}: price updated`);
          }} className="w-24 bg-transparent border-b hairline text-right tabular-nums focus:outline-none focus:border-foreground" />
        ) },
      ]} />
    </AdminPage>
  );
};

/* ============ USERS */
export const AdminUsersPage = () => {
  const users = Object.values(DEMO_USERS);
  return (
    <AdminPage title="Users" subtitle="All accounts on the platform.">
      <DashTable rows={users} columns={[
        { key: "name", header: "Name", cell: (u) => <span className="font-display">{u.fullName}</span> },
        { key: "email", header: "Email", cell: (u) => <span className="text-ink-soft text-xs">{u.email}</span> },
        { key: "role", header: "Role", cell: (u) => <Pill>{u.role.replace("_", " ")}</Pill> },
        { key: "league", header: "League", cell: (u) => <span className="capitalize">{u.currentLeague}</span> },
        { key: "act", header: "", cell: (u) => (
          <button onClick={() => toast.success(`Reset email sent to ${u.email}`)} className="inline-flex items-center gap-2 px-3 py-1.5 border hairline text-[10px] tracking-luxury uppercase hover:bg-foreground hover:text-background">
            <Mail className="size-3" /> Reset password
          </button>
        ) },
      ]} />
    </AdminPage>
  );
};

/* ============ ACADEMIES */
export const AdminAcademiesPage = () => (
  <AdminPage title="Academies" subtitle="Training academies and their captains.">
    <DashTable rows={ACADEMIES} columns={[
      { key: "name", header: "Academy", cell: (a) => <span className="font-display">{a.name}</span> },
      { key: "loc", header: "Location", cell: (a) => <span className="text-ink-soft">{a.location}</span> },
      { key: "cap", header: "Captain", cell: (a) => a.captainName },
      { key: "prog", header: "Programs", cell: (a) => <span className="tabular-nums">{a.programs.length}</span> },
      { key: "st", header: "Status", cell: (a) => <Pill tone={a.isActive ? "success" : "neutral"}>{a.isActive ? "active" : "inactive"}</Pill> },
    ]} />
  </AdminPage>
);

/* ============ PREMIUM */
export const AdminPremiumPage = () => (
  <AdminPage title="Premium & subscriptions" subtitle="Le Cercle membership tiers and active subscribers.">
    <StatGrid stats={[
      { label: "Wood", value: 842 },
      { label: "Silver", value: 218 },
      { label: "Gold", value: 87 },
      { label: "Platinum", value: 24 },
    ]} />
    <div className="mt-10">
      <SectionTitle title="Tier configuration" />
      <DashTable rows={[
        { tier: "Silver", price: 1200, points: 500, perks: "Priority booking" },
        { tier: "Gold", price: 3200, points: 2000, perks: "Concierge + 10% off" },
        { tier: "Platinum", price: 8400, points: 6000, perks: "All access + private guide" },
      ]} columns={[
        { key: "t", header: "Tier", cell: (r) => <span className="font-display">{r.tier}</span> },
        { key: "p", header: "Monthly", cell: (r) => <span className="tabular-nums">{fmtMoney(r.price)}</span> },
        { key: "pt", header: "Min points", cell: (r) => <span className="tabular-nums">{r.points}</span> },
        { key: "pk", header: "Perks", cell: (r) => <span className="text-ink-soft">{r.perks}</span> },
      ]} />
    </div>
  </AdminPage>
);

/* ============ INSTANT BOOKING */
export const AdminInstantBookingPage = () => {
  const [rider, setRider] = useState("");
  const [stable, setStable] = useState(STABLES[0].id);
  const [horse, setHorse] = useState("");
  const [date, setDate] = useState("");
  const horses = HORSES.filter((h) => h.stableId === stable);
  const inp = "w-full bg-transparent border-b hairline pb-2 focus:outline-none focus:border-foreground";
  return (
    <AdminPage title="Instant booking" subtitle="Create a booking on behalf of a rider.">
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Booking created."); }} className="max-w-xl space-y-6">
        <label className="block">
          <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Rider email</span>
          <input value={rider} onChange={(e) => setRider(e.target.value)} className={`mt-2 ${inp}`} required />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Stable</span>
          <select value={stable} onChange={(e) => { setStable(e.target.value); setHorse(""); }} className={`mt-2 ${inp}`}>
            {(STABLES || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Horse</span>
          <select value={horse} onChange={(e) => setHorse(e.target.value)} className={`mt-2 ${inp}`} required>
            <option value="">Select…</option>
            {(horses || []).map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Date / time</span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-2 ${inp}`} required />
        </label>
        <button className="px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase">Create booking</button>
      </form>
    </AdminPage>
  );
};

/* ============ UPLOAD HORSES (lives at /admin/upload-horses) */
export const AdminUploadHorsesPage = () => {
  const [text, setText] = useState("");
  return (
    <RoleGuard allow={["admin"]}>
      <DashShell eyebrow="Admin" title="Bulk horse upload" subtitle="Paste CSV: name,stable,color,age,price,tier">
        <form onSubmit={(e) => { e.preventDefault(); const lines = text.trim().split("\n").filter(Boolean); toast.success(`Imported ${lines.length} horses.`); setText(""); }} className="max-w-3xl">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} placeholder="Anubis,Meridian Stables,bay,8,850,intermediate" className="w-full bg-transparent border hairline p-4 font-mono text-xs focus:outline-none focus:border-foreground" />
          <div className="mt-6 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase"><Upload className="size-4" /> Import</button>
            <button type="button" onClick={() => setText("")} className="px-8 py-4 border hairline text-[12px] tracking-[0.22em] uppercase">Clear</button>
          </div>
        </form>
      </DashShell>
    </RoleGuard>
  );
};

export default AdminUploadHorsesPage;
