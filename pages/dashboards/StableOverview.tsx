import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, StatGrid, SectionTitle, DashTable, Pill } from "@/components/shared/DashShell";
import { STABLES, HORSES, PACKAGES, REVIEWS } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";

const STABLE_ID = STABLES[0].id;

const fakeBookings = Array.from({ length: 6 }).map((_, i) => ({
  id: `bk-${i}`,
  ref: `PYR-0${4800 + i}`,
  rider: ["Yasmine A.", "Omar K.", "Lara T.", "Hassan M.", "Mira S.", "Daniel R."][i],
  horse: HORSES.filter((h) => h.stableId === STABLE_ID)[i % 3].name,
  date: new Date(Date.now() + 86400000 * (i - 1)),
  status: i < 3 ? "confirmed" : i < 5 ? "pending" : "completed",
  amount: 1200 + i * 230,
}));

const StableOverview = () => {
  const stable = STABLES[0];
  const horses = HORSES.filter((h) => h.stableId === stable.id);
  const stablePackages = PACKAGES.filter((p) => p.stableId === stable.id);
  const stableReviews = REVIEWS.filter((r) => r.stableId === stable.id);
  const monthRevenue = fakeBookings.reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <SubNav kind="stable" />
      <DashShell
        eyebrow="Stable Owner"
        title={stable.name}
        subtitle={`${stable.location} · ${stable.yearsOperating} years on the plateau`}
        actions={
          <Link to="/dashboard/stable/manage" className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
            Edit stable <ArrowUpRight className="size-4" />
          </Link>
        }
      >
        <StatGrid stats={[
          { label: "Horses", value: horses.length },
          { label: "Packages", value: stablePackages.length },
          { label: "This month", value: fmtMoney(monthRevenue), hint: `${fakeBookings.length} bookings` },
          { label: "Rating", value: stable.rating.toFixed(1), hint: `${stable.reviewCount} reviews` },
        ]} />

        <div className="mt-16">
          <SectionTitle title="Recent bookings" hint={`${fakeBookings.length} this period`} />
          <DashTable
            rows={fakeBookings}
            columns={[
              { key: "ref", header: "Reference", cell: (b) => <span className="font-mono text-xs">{b.ref}</span> },
              { key: "rider", header: "Rider", cell: (b) => b.rider },
              { key: "horse", header: "Horse", cell: (b) => b.horse },
              { key: "date", header: "Date", cell: (b) => b.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) },
              { key: "amount", header: "Amount", cell: (b) => <span className="tabular-nums">{fmtMoney(b.amount)}</span> },
              { key: "status", header: "Status", cell: (b) => <Pill tone={b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : "neutral"}>{b.status}</Pill> },
            ]}
          />
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-10">
          <div>
            <SectionTitle title="Latest reviews" />
            <div className="space-y-4">
              {stableReviews.slice(0, 3).map((r) => (
                <article key={r.id} className="border hairline p-5">
                  <div className="flex justify-between items-baseline">
                    <p className="font-display text-lg">{r.riderName}</p>
                    <span className="text-[11px] tracking-luxury uppercase text-ink-muted tabular-nums">{r.stableRating.toFixed(1)} ★</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>
                </article>
              ))}
              {stableReviews.length === 0 && <p className="text-sm text-ink-muted">No reviews yet.</p>}
            </div>
          </div>
          <div>
            <SectionTitle title="Payouts" />
            <div className="border hairline p-7">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Available for payout</p>
              <p className="mt-3 font-display text-5xl tabular-nums">{fmtMoney(monthRevenue * (1 - stable.commissionRate))}</p>
              <p className="mt-2 text-[11px] text-ink-muted">After {(stable.commissionRate * 100).toFixed(0)}% platform fee</p>
              <button className="mt-6 w-full px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">Request payout</button>
            </div>
          </div>
        </div>
      </DashShell>
    </>
  );
};

export default StableOverview;
