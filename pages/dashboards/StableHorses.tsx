"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle, DashTable, Pill } from "@/components/shared/DashShell";
import { STABLES, HORSES } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";

const StableHorses = () => {
  const stable = STABLES[0];
  const initial = HORSES.filter((h) => h.stableId === stable.id);
  const [horses, setHorses] = useState(initial);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const visible = horses.filter((h) =>
    filter === "all" ? true : filter === "active" ? h.isActive : !h.isActive,
  );

  const toggleActive = (id: string) => {
    setHorses((prev) => (prev || []).map((h) => h.id === id ? { ...h, isActive: !h.isActive } : h));
    toast.success("Horse status updated.");
  };

  const remove = (id: string) => {
    setHorses((prev) => prev.filter((h) => h.id !== id));
    toast.success("Horse retired from the stable.");
  };

  return (
    <>
      <SubNav kind="stable" />
      <DashShell
        eyebrow="Stable Owner"
        title="Horses"
        subtitle={`${horses.length} horses in your care`}
        actions={
          <button onClick={() => toast("Horse form would open here.")} className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
            <Plus className="size-4" /> Add horse
          </button>
        }
      >
        <div className="flex items-center gap-2 mb-6">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[11px] tracking-[0.18em] uppercase ${filter === f ? "bg-foreground text-background" : "border hairline text-ink-muted hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        <SectionTitle title="Roster" hint={`${visible.length} shown`} />
        <DashTable
          rows={visible}
          empty="No horses match this filter."
          columns={[
            { key: "name", header: "Horse", cell: (h) => (
              <div className="flex items-center gap-3">
                <img src={h.imageUrls[0]} alt="" className="size-10 rounded-full object-cover" />
                <div>
                  <p className="font-display text-base">{h.name}</p>
                  <p className="text-[11px] text-ink-muted">{h.breed}</p>
                </div>
              </div>
            ) },
            { key: "color", header: "Color", cell: (h) => <span className="capitalize text-ink-soft">{h.color}</span> },
            { key: "tier", header: "Tier", cell: (h) => <Pill>{h.adminTier}</Pill> },
            { key: "price", header: "Per hour", cell: (h) => <span className="tabular-nums">{fmtMoney(h.pricePerHour)}</span> },
            { key: "status", header: "Status", cell: (h) => (
              <Pill tone={h.isActive ? "success" : "neutral"}>{h.isActive ? "active" : "inactive"}</Pill>
            ) },
            { key: "actions", header: "", cell: (h) => (
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => toggleActive(h.id)} className="p-2 border hairline hover:bg-foreground hover:text-background transition-colors" title="Toggle active">
                  <Edit2 className="size-3.5" />
                </button>
                <button onClick={() => remove(h.id)} className="p-2 border hairline hover:bg-destructive hover:text-background transition-colors" title="Remove">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ) },
          ]}
        />
      </DashShell>
    </>
  );
};

export default StableHorses;
