"use client";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

type Row = { rank: number; name: string; location: string; rides: number; hours: number; tier: "Maître" | "Compagnon" | "Initié" };

const RIDERS: Row[] = [
  { rank: 1, name: "Élodie Devereux",    location: "Paris",      rides: 14, hours: 38, tier: "Maître" },
  { rank: 2, name: "Kenji Hayashi",      location: "Kyoto",      rides: 12, hours: 31, tier: "Maître" },
  { rank: 3, name: "Amara Okonkwo",      location: "Lagos",      rides: 9,  hours: 24, tier: "Compagnon" },
  { rank: 4, name: "Sebastián Castellanos", location: "Madrid",  rides: 8,  hours: 22, tier: "Compagnon" },
  { rank: 5, name: "Ingrid Lindqvist",   location: "Stockholm",  rides: 7,  hours: 19, tier: "Compagnon" },
  { rank: 6, name: "Hassan Al-Rashid",   location: "Dubai",      rides: 6,  hours: 16, tier: "Initié" },
  { rank: 7, name: "Sofia Marchetti",    location: "Milan",      rides: 5,  hours: 14, tier: "Initié" },
  { rank: 8, name: "Dmitri Volkov",      location: "London",     rides: 4,  hours: 11, tier: "Initié" },
];

export const Leaderboard = ({ limit }: { limit?: number }) => {
  const rows = limit ? RIDERS.slice(0, limit) : RIDERS;
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">The Cercle</p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-2xl text-balance">
              Our most devoted riders, this season.
            </h2>
            <p className="text-sm text-ink-muted max-w-xs">
              A quiet register of those who have returned to the Plateau most often.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 border-t hairline">
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-4 border-b hairline text-[10px] tracking-luxury uppercase text-ink-muted">
            <div className="col-span-1">№</div>
            <div className="col-span-4">Rider</div>
            <div className="col-span-3">Origin</div>
            <div className="col-span-1 text-right">Rides</div>
            <div className="col-span-1 text-right">Hours</div>
            <div className="col-span-2 text-right">Tier</div>
          </div>
          <StaggerGroup gap={0.05}>
            {(rows || []).map((r) => (
              <StaggerItem key={r.rank}>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.4, ease: easeLuxury }}
                  className={cn(
                    "grid grid-cols-2 md:grid-cols-12 gap-4 px-2 py-6 border-b hairline items-center group",
                    r.rank <= 3 && "bg-surface/30",
                  )}
                >
                  <div className="md:col-span-1 font-display text-3xl tabular-nums leading-none">
                    {String(r.rank).padStart(2, "0")}
                  </div>
                  <div className="md:col-span-4">
                    <p className="font-display text-2xl leading-tight">{r.name}</p>
                    <p className="md:hidden text-xs text-ink-muted mt-1">{r.location}</p>
                  </div>
                  <div className="hidden md:block md:col-span-3 text-sm text-ink-soft">{r.location}</div>
                  <div className="md:col-span-1 text-sm md:text-right tabular-nums">{r.rides}</div>
                  <div className="hidden md:block md:col-span-1 text-sm text-right tabular-nums">{r.hours}</div>
                  <div className="md:col-span-2 md:text-right">
                    <span className="text-[10px] tracking-luxury uppercase">
                      {r.tier === "Maître" && <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-foreground" /> Maître</span>}
                      {r.tier === "Compagnon" && <span className="text-ink-soft">Compagnon</span>}
                      {r.tier === "Initié" && <span className="text-ink-muted">Initié</span>}
                    </span>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
};
