import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MapPin, Search, Loader2 } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface Stable {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl?: string;
  rating: number;
  totalBookings: number;
  totalReviews: number;
}

const StablesPage = () => {
  const [stables, setStables] = useState<Stable[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStables = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("location", filter);
      const res = await fetch(`/api/stables?${params}`);
      const data = await res.json();
      const list: Stable[] = data.stables ?? [];
      setStables(list);
      if (locations.length === 0) {
        const locs = Array.from(new Set(list.map((s) => s.location))).filter(Boolean);
        setLocations(locs);
      }
    } catch {
      setStables([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchStables(); }, [fetchStables]);

  const allLocations = ["all", ...locations];

  return (
    <>
      <section className="container pt-40 pb-16">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">The Stables{!isLoading && stables.length > 0 ? ` · ${stables.length} estates` : ""}</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance max-w-5xl">Our estates. One plateau. A century of horses.</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 max-w-xl text-ink-soft text-pretty">Each of our partner stables has been chosen for one quiet reason: their horses, their history, and the way they keep both. Select an estate to enter.</p>
        </Reveal>
      </section>

      <div className="sticky top-20 z-30 bg-background/85 backdrop-blur-md border-y hairline">
        <div className="container">
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 py-4">
            {allLocations.map((loc) => {
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
              {isLoading ? "—" : `${stables.length} ${stables.length === 1 ? "estate" : "estates"}`}
            </li>
          </ul>
        </div>
      </div>

      <section className="container py-16 md:py-20">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-ink-muted" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: easeLuxury }}
            >
              {stables.length === 0 ? (
                <EmptyState
                  icon={<Search className="size-5" />}
                  eyebrow="No estates here"
                  title="The plateau is quiet."
                  description="No estates currently operate in this location. View all stables, or write to the concierge."
                  cta={{ label: "View all estates", to: "/stables" }}
                />
              ) : (
                <StaggerGroup className="grid gap-6 md:grid-cols-3" gap={0.12}>
                  {stables.map((s) => (
                    <StaggerItem key={s.id}>
                      <Link to={`/stables/${s.id}`} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                          <motion.img
                            src={s.imageUrl || "/hero-bg.webp"} alt={s.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 1.2, ease: easeLuxury }}
                          />
                          <div className="absolute top-4 left-4 text-[10px] tracking-luxury uppercase text-background/90">{s.location}</div>
                        </div>
                        <div className="pt-5 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-2xl leading-tight">{s.name}</h3>
                            <p className="mt-1.5 text-xs tracking-[0.14em] uppercase text-ink-muted inline-flex items-center gap-1.5">
                              <MapPin className="size-3" /> {s.location}
                            </p>
                          </div>
                          <ArrowUpRight className="size-4 text-ink-muted transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                        <p className="mt-3 text-sm text-ink-soft text-pretty line-clamp-2">{s.description}</p>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </>
  );
};

export default StablesPage;
