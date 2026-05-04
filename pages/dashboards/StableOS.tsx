import { useState } from "react";
import { Check, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle, DashTable, Pill } from "@/components/shared/DashShell";
import { STABLES, HORSES, REVIEWS } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";

type Section = "bookings" | "horses" | "reviews" | "payouts";

const StableOS = () => {
  const stable = STABLES[0];
  const horses = HORSES.filter((h) => h.stableId === stable.id);
  const reviews = REVIEWS.filter((r) => r.stableId === stable.id);
  const [section, setSection] = useState<Section>("bookings");

  const fakeBookings = Array.from({ length: 8 }).map((_, i) => ({
    id: `bk-${i}`,
    ref: `PYR-0${4900 + i}`,
    rider: ["Yasmine A.", "Omar K.", "Lara T.", "Hassan M.", "Mira S.", "Daniel R.", "Sara N.", "Karim J."][i],
    horse: horses[i % horses.length].name,
    date: new Date(Date.now() + 86400000 * (i - 2)),
    status: i < 4 ? "confirmed" : i < 6 ? "pending" : "completed",
    amount: 1200 + i * 230,
  }));

  return (
    <>
      <SubNav kind="stable" />
      <DashShell
        eyebrow="Stable Owner"
        title="Stable OS"
        subtitle="One desk for the whole stable — bookings, horses, reviews, payouts."
      >
        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(["bookings", "horses", "reviews", "payouts"] as Section[]).map((s) => (
            <button key={s} onClick={() => setSection(s)} className={`px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase ${section === s ? "bg-foreground text-background" : "border hairline text-ink-muted hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        {section === "bookings" && (
          <>
            <SectionTitle title="All bookings" hint={`${fakeBookings.length} total`} />
            <DashTable
              rows={fakeBookings}
              columns={[
                { key: "ref", header: "Ref", cell: (b) => <span className="font-mono text-xs">{b.ref}</span> },
                { key: "rider", header: "Rider", cell: (b) => b.rider },
                { key: "horse", header: "Horse", cell: (b) => b.horse },
                { key: "date", header: "Date", cell: (b) => b.date.toLocaleDateString("en-GB") },
                { key: "amount", header: "Amount", cell: (b) => <span className="tabular-nums">{fmtMoney(b.amount)}</span> },
                { key: "status", header: "Status", cell: (b) => <Pill tone={b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : "neutral"}>{b.status}</Pill> },
                { key: "actions", header: "", cell: (b) => (
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.success(`Confirmed ${b.ref}`)} className="p-2 border hairline hover:bg-foreground hover:text-background"><Check className="size-3.5" /></button>
                    <button onClick={() => toast(`Messaged rider`)} className="p-2 border hairline hover:bg-foreground hover:text-background"><MessageSquare className="size-3.5" /></button>
                  </div>
                ) },
              ]}
            />
          </>
        )}

        {section === "horses" && (
          <>
            <SectionTitle title="Roster" hint={`${horses.length} horses`} />
            <DashTable
              rows={horses}
              columns={[
                { key: "name", header: "Name", cell: (h) => <span className="font-display">{h.name}</span> },
                { key: "color", header: "Color", cell: (h) => <span className="capitalize">{h.color}</span> },
                { key: "tier", header: "Tier", cell: (h) => <Pill>{h.adminTier}</Pill> },
                { key: "price", header: "Per hour", cell: (h) => <span className="tabular-nums">{fmtMoney(h.pricePerHour)}</span> },
                { key: "status", header: "Status", cell: (h) => <Pill tone={h.isActive ? "success" : "neutral"}>{h.isActive ? "active" : "inactive"}</Pill> },
              ]}
            />
          </>
        )}

        {section === "reviews" && (
          <>
            <SectionTitle title="Reviews to moderate" hint={`${reviews.length} on record`} />
            <div className="space-y-4">
              {reviews.map((r) => (
                <article key={r.id} className="border hairline p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-display text-xl">{r.riderName}</p>
                      <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{r.stableRating.toFixed(1)} ★ · {new Date(r.createdAt).toLocaleDateString("en-GB")}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toast.success("Review approved.")} className="p-2 border hairline hover:bg-foreground hover:text-background"><Check className="size-4" /></button>
                      <button onClick={() => toast.success("Review hidden.")} className="p-2 border hairline hover:bg-destructive hover:text-background"><X className="size-4" /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-soft">{r.comment}</p>
                </article>
              ))}
            </div>
          </>
        )}

        {section === "payouts" && (
          <>
            <SectionTitle title="Payouts" />
            <div className="grid md:grid-cols-3 gap-px bg-hairline border hairline">
              <div className="bg-background p-7">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Available now</p>
                <p className="mt-3 font-display text-4xl tabular-nums">{fmtMoney(38420)}</p>
              </div>
              <div className="bg-background p-7">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">In escrow</p>
                <p className="mt-3 font-display text-4xl tabular-nums">{fmtMoney(12300)}</p>
              </div>
              <div className="bg-background p-7">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Last payout</p>
                <p className="mt-3 font-display text-4xl tabular-nums">{fmtMoney(24850)}</p>
                <p className="mt-1 text-[11px] text-ink-muted">2 weeks ago</p>
              </div>
            </div>
            <button onClick={() => toast.success("Payout requested.")} className="mt-8 px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase">Request payout</button>
          </>
        )}
      </DashShell>
    </>
  );
};

export default StableOS;
