import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MapPin, Search } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { stables } from "@/data/mock";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

const LOCATIONS = ["all", ...Array.from(new Set(stables.map((s) => s.location)))] as const;

const StablesPage = () => {
  const [filter, setFilter] = useState<string>("all");
  const visible = useMemo(
    () => (filter === "all" ? stables : stables.filter((s) => s.location === filter)),
    [filter],
  );

  return (
    <>
      <section className="container pt-40 pb-16">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">The Stables · {stables.length} estates</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance max-w-5xl">Three estates. One plateau. A century of horses.</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 max-w-xl text-ink-soft text-pretty">Each of our partner stables has been chosen for one quiet reason: their horses, their history, and the way they keep both. Select an estate to enter.</p>
        </Reveal>
      </section>

      <div className="sticky top-20 z-30 bg-background/85 backdrop-blur-md border-y hairline">
        <div className="container">
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 py-4">
            {LOCATIONS.map((loc) => {
              const active = filter === loc;
              const label = loc === "all" ? "All estates" : loc;
              return (
                <li key={loc}>
                  <button
                    onClick={() => setFilter(loc)}
                    className={cn(
                      "relative text-[11px] tracking-luxury uppercase pb-1 transition-colors",
                      active ? "text-foreground" : "text-ink-muted hover:text-foreground",
                    )}
                  >
                    {label}
                    {active && (
                      <motion.span layoutId="stables-filter-underline" className="absolute left-0 right-0 -bottom-px h-px bg-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
            <li className="ml-auto text-[10px] tracking-luxury uppercase text-ink-muted tabular-nums">
              {visible.length} {visible.length === 1 ? "estate" : "estates"}
            </li>
          </ul>
        </div>
      </div>

      <section className="container py-16 md:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: easeLuxury }}
          >
            {visible.length === 0 ? (
              <EmptyState
                icon={<Search className="size-5" />}
                eyebrow="No estates here"
                title="The plateau is quiet."
                description="No estates currently operate in this location. View all stables, or write to the concierge."
                cta={{ label: "View all estates", to: "/stables" }}
              />
            ) : (
              <StaggerGroup className="grid gap-6 md:grid-cols-3" gap={0.12}>
                {visible.map((s) => (
                  <StaggerItem key={s.id}>
                    <Link to={`/stables/${s.id}`} className="group block">
                      <motion.div layoutId={`stable-image-${s.id}`} className="relative aspect-[4/5] overflow-hidden bg-surface">
                        <motion.img
                          src={s.image} alt={s.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 1.2, ease: easeLuxury }}
                        />
                        <div className="absolute top-4 left-4 text-[10px] tracking-luxury uppercase text-background/90">Est. {s.established}</div>
                      </motion.div>
                      <div className="pt-5 flex items-start justify-between gap-4">
                        <div>
                          <motion.h3 layoutId={`stable-name-${s.id}`} className="font-display text-2xl leading-tight">{s.name}</motion.h3>
                          <p className="mt-1.5 text-xs tracking-[0.14em] uppercase text-ink-muted inline-flex items-center gap-1.5">
                            <MapPin className="size-3" /> {s.location}
                          </p>
                        </div>
                        <ArrowUpRight className="size-4 text-ink-muted transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                      <p className="mt-3 text-sm text-ink-soft text-pretty">{s.description}</p>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
};

export default StablesPage;
