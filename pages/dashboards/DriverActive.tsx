"use client";
import { useState } from "react";
import { MapPin, Navigation2, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle } from "@/components/shared/DashShell";
import { TRANSPORT_ZONES } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";

const ACTIVE = {
  id: "r-active",
  ref: "TRX-04812",
  status: "en-route" as const,
  guest: "Hayashi party",
  party: 3,
  pickupZoneId: TRANSPORT_ZONES[2].id,
  pickupAddress: "Four Seasons Hotel Cairo at Nile Plaza, Garden City",
  destination: "Meridian Stables, Nazlet El-Semman",
  pickupAt: new Date(Date.now() + 30 * 60_000),
  fee: 400,
  phone: "+20 100 234 5678",
  notes: "Two adults + one child (8). Has booked sunrise package.",
};

const DriverActive = () => {
  const [phase, setPhase] = useState<"to-pickup" | "to-destination" | "arrived">("to-pickup");
  const zone = TRANSPORT_ZONES.find((z) => z.id === ACTIVE.pickupZoneId);

  const advance = () => {
    if (phase === "to-pickup") { setPhase("to-destination"); toast.success("Marked picked up."); }
    else if (phase === "to-destination") { setPhase("arrived"); toast.success("Run completed."); }
  };

  return (
    <>
      <SubNav kind="driver" />
      <DashShell eyebrow="Driver" title="Active run" subtitle={`Reference ${ACTIVE.ref}`}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border hairline p-8 bg-surface-elevated/40">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Status</p>
              <span className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase">
                <span className="size-1.5 rounded-full bg-foreground animate-pulse" /> {phase.replace("-", " ")}
              </span>
            </div>
            <h2 className="mt-3 font-display text-4xl">{ACTIVE.guest}</h2>
            <p className="text-sm text-ink-muted">{ACTIVE.party} guest{ACTIVE.party === 1 ? "" : "s"} · pickup at {ACTIVE.pickupAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>

            {/* Three phase cards */}
            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {([
                { key: "to-pickup", label: "To pickup", desc: "Drive to guest" },
                { key: "to-destination", label: "En route", desc: "Drive to stable" },
                { key: "arrived", label: "Arrived", desc: "Run completed" },
              ] as const).map((p, i) => {
                const order = ["to-pickup", "to-destination", "arrived"] as const;
                const currentIdx = order.indexOf(phase);
                const isActive = phase === p.key;
                const isDone = order.indexOf(p.key as typeof phase) < currentIdx;
                return (
                  <div
                    key={p.key}
                    className={`border hairline p-5 transition-colors ${
                      isActive ? "bg-foreground text-background border-foreground" :
                      isDone ? "bg-surface-elevated/60" : "bg-background"
                    }`}
                  >
                    <p className={`text-[10px] tracking-luxury uppercase ${isActive ? "text-background/70" : "text-ink-muted"}`}>Phase {i + 1}</p>
                    <p className="mt-2 font-display text-xl">{p.label}</p>
                    <p className={`mt-1 text-xs ${isActive ? "text-background/70" : "text-ink-soft"}`}>{p.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-1.5"><MapPin className="size-3" /> Pickup</p>
                <p className="mt-2 font-display text-xl">{zone?.name}</p>
                <p className="text-sm text-ink-soft">{ACTIVE.pickupAddress}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-1.5"><Navigation2 className="size-3" /> Destination</p>
                <p className="mt-2 font-display text-xl">{ACTIVE.destination}</p>
              </div>
              <div className="border-t hairline pt-6">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Notes</p>
                <p className="mt-2 text-sm text-ink-soft">{ACTIVE.notes}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${ACTIVE.phone}`} className="inline-flex items-center gap-2 px-5 py-3 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
                <Phone className="size-4" /> Call guest
              </a>
              {phase !== "arrived" ? (
                <button onClick={advance} className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
                  <CheckCircle2 className="size-4" /> {phase === "to-pickup" ? "Mark picked up" : "Mark complete"}
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-5 py-3 border hairline text-[11px] tracking-[0.18em] uppercase">Run completed</span>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Fare</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{fmtMoney(ACTIVE.fee)}</p>
            </div>
            <div className="border hairline p-6 aspect-square bg-surface-elevated/40 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="size-8 mx-auto text-ink-muted" />
                <p className="mt-3 text-[11px] tracking-luxury uppercase text-ink-muted">Map placeholder</p>
              </div>
            </div>
          </aside>
        </div>
      </DashShell>
    </>
  );
};

export default DriverActive;
