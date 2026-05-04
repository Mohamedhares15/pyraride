import { SubNav } from "@/components/shared/SubNav";
import { DashShell, StatGrid, SectionTitle, DashTable } from "@/components/shared/DashShell";
import { TRANSPORT_ZONES } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";

const HISTORY = Array.from({ length: 12 }).map((_, i) => ({
  id: `r-${i}`,
  ref: `TRX-04${700 + i}`,
  date: new Date(Date.now() - 86400000 * (i + 1)),
  guest: ["Devereux", "Hayashi", "Lindqvist", "Castellanos", "Okonkwo", "Tabet"][i % 6],
  zone: TRANSPORT_ZONES[i % TRANSPORT_ZONES.length],
  party: 1 + (i % 4),
  fee: 350 + (i % 5) * 75,
  rating: 4 + ((i * 7) % 10) / 10,
}));

const DriverHistory = () => {
  const total = HISTORY.reduce((s, r) => s + r.fee, 0);
  const avg = (HISTORY.reduce((s, r) => s + r.rating, 0) / HISTORY.length).toFixed(1);

  return (
    <>
      <SubNav kind="driver" />
      <DashShell eyebrow="Driver" title="Past runs" subtitle="The week's record, in chronological order.">
        <StatGrid stats={[
          { label: "Runs", value: HISTORY.length },
          { label: "Earned", value: fmtMoney(total) },
          { label: "Avg. rating", value: `${avg} ★` },
          { label: "Hours driven", value: HISTORY.length * 1.4 + "h" },
        ]} />

        <div className="mt-12">
          <SectionTitle title="Trip log" />
          <DashTable
            rows={HISTORY}
            columns={[
              { key: "ref", header: "Ref", cell: (r) => <span className="font-mono text-xs">{r.ref}</span> },
              { key: "date", header: "Date", cell: (r) => r.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) },
              { key: "guest", header: "Guest", cell: (r) => r.guest },
              { key: "zone", header: "Pickup", cell: (r) => <span className="text-ink-soft">{r.zone.name}</span> },
              { key: "party", header: "Party", cell: (r) => <span className="tabular-nums">{r.party}</span> },
              { key: "fee", header: "Fare", cell: (r) => <span className="tabular-nums">{fmtMoney(r.fee)}</span> },
              { key: "rating", header: "Rating", cell: (r) => <span className="tabular-nums">{r.rating.toFixed(1)} ★</span> },
            ]}
          />
        </div>
      </DashShell>
    </>
  );
};

export default DriverHistory;
