import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { Leaderboard as CercleLeaderboard } from "@/components/social/Leaderboard";
import { LEADERBOARD } from "@/lib/mock-data/seed";
import { cn } from "@/lib/utils";

const Leaderboard = () => (
  <div className="min-h-screen pt-28">
    <section className="container py-16 md:py-24 border-b hairline">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">The Register</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">
          Riders of the season, in order.
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
          A quiet ranking. Hours in the saddle, journeys completed, letters received. Updated at first light each Monday.
        </p>
      </Reveal>
    </section>

    {/* Editorial Cercle visual */}
    <CercleLeaderboard />

    {/* Full register, with rider profile links */}
    <section className="container pb-32">
      <Reveal>
        <div className="flex items-end justify-between mb-10 border-b hairline pb-6">
          <h2 className="font-display text-3xl md:text-5xl">The full register</h2>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{LEADERBOARD.length} riders</p>
        </div>
      </Reveal>

      <StaggerGroup gap={0.04}>
        {LEADERBOARD.map((r) => (
          <StaggerItem key={r.id}>
            <Link
              to={`/users/${r.id}`}
              className={cn(
                "group grid grid-cols-12 gap-4 items-center py-5 border-b hairline hover:bg-surface/40 transition-colors px-2",
                r.position <= 3 && "bg-surface/30",
              )}
            >
              <p className="col-span-2 md:col-span-1 font-display text-2xl tabular-nums leading-none">
                {String(r.position).padStart(2, "0")}
              </p>
              <div className="col-span-2 md:col-span-1">
                <span className="block size-10 overflow-hidden bg-surface">
                  <motion.img
                    src={r.profileImageUrl}
                    alt=""
                    className="h-full w-full object-cover grayscale"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: easeLuxury }}
                  />
                </span>
              </div>
              <div className="col-span-8 md:col-span-5">
                <p className="font-display text-xl md:text-2xl leading-tight">{r.fullName}</p>
                <p className="md:hidden text-[11px] tracking-luxury uppercase text-ink-muted mt-1">{r.league} · {r.ridesCompleted} rides</p>
              </div>
              <p className="hidden md:block md:col-span-2 text-sm text-ink-soft capitalize">{r.league}</p>
              <p className="hidden md:block md:col-span-1 text-sm text-right tabular-nums">{r.ridesCompleted}</p>
              <p className="hidden md:block md:col-span-1 text-sm text-right tabular-nums">{r.rankPoints.toLocaleString()}</p>
              <span className="col-span-12 md:col-span-1 md:justify-self-end inline-flex size-9 items-center justify-center border hairline rounded-full transition-all duration-500 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                <ArrowUpRight className="size-3.5" />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  </div>
);

export default Leaderboard;
