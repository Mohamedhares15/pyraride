import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Loader2 } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  minPeople: number;
  maxPeople: number;
  duration: number;
  imageUrl?: string;
  stable: { id: string; name: string; location: string };
}

const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

const PackagesPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setPackages([]))
      .finally(() => setIsLoading(false));
  }, []);

  const stableFilters = useMemo(() => {
    const seen = new Map<string, string>();
    packages.forEach((p) => { if (p.stable?.id) seen.set(p.stable.id, p.stable.name); });
    return [{ id: "all", label: "All journeys" }, ...Array.from(seen.entries()).map(([id, name]) => ({ id, label: name }))];
  }, [packages]);

  const filtered = useMemo(
    () => (filter === "all" ? packages : packages.filter((p) => p.stable?.id === filter)),
    [packages, filter],
  );

  return (
    <>
      <section className="container pt-40 pb-16">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">
            Signature Journeys{!isLoading && packages.length > 0 ? ` · ${packages.length}` : ""}
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance max-w-5xl">
            Curated, never crowded.
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 max-w-xl text-ink-soft text-pretty">
            Each journey is limited to one party. From sunrise processions to full-day immersions, every detail is arranged before you arrive.
          </p>
        </Reveal>
      </section>

      {/* Sticky filter */}
      <div className="sticky top-20 z-30 bg-background/85 backdrop-blur-md border-y hairline">
        <div className="container">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
            {stableFilters.map((f) => {
              const active = filter === f.id;
              return (
                <li key={f.id}>
                  <button
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "relative text-[11px] tracking-luxury uppercase pb-1 transition-colors",
                      active ? "text-foreground" : "text-ink-muted hover:text-foreground",
                    )}
                  >
                    {f.label}
                    {active && (
                      <motion.span layoutId="pkg-filter-underline" className="absolute left-0 right-0 -bottom-px h-px bg-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
            <li className="ml-auto text-[10px] tracking-luxury uppercase text-ink-muted tabular-nums">
              {isLoading ? "—" : `${filtered.length} ${filtered.length === 1 ? "journey" : "journeys"}`}
            </li>
          </ul>
        </div>
      </div>

      {/* List */}
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
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="size-5" />}
                  eyebrow="Nothing in this estate"
                  title="No journeys here yet."
                  description="The house has not yet curated a journey from this estate. Browse all journeys, or write to the concierge."
                  cta={{ label: "View all journeys", to: "/packages" }}
                />
              ) : (
                <StaggerGroup className="grid gap-10 md:grid-cols-2" gap={0.1}>
                  {filtered.map((p, i) => (
                    <StaggerItem key={p.id}>
                      <Link to={`/packages/${p.id}`} className="group block">
                        <div className="relative aspect-[5/6] overflow-hidden bg-surface">
                          <motion.img
                            src={p.imageUrl || "/hero-bg.webp"} alt={p.title} loading="lazy"
                            className="h-full w-full object-cover"
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 1.2, ease: easeLuxury }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-90" />
                          <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-background">
                            <span className="text-[10px] tracking-luxury uppercase">№ {String(i + 1).padStart(2, "0")}</span>
                            <span className="text-[10px] tracking-luxury uppercase">{fmtDuration(p.duration)}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-background">
                            <p className="text-[10px] tracking-luxury uppercase text-background/80 mb-2">{p.stable?.name}</p>
                            <h3 className="font-display text-3xl md:text-4xl leading-tight">{p.title}</h3>
                            <p className="mt-1.5 text-background/85 line-clamp-2">{p.description}</p>
                          </div>
                        </div>
                        <div className="pt-5 flex items-baseline justify-between border-b hairline pb-5 group-hover:border-foreground transition-colors">
                          <div>
                            <p className="text-[10px] tracking-luxury uppercase text-ink-muted">From</p>
                            <p className="font-display text-2xl">EGP {p.price.toLocaleString()}<span className="text-sm text-ink-muted"> / guest</span></p>
                          </div>
                          <span className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted group-hover:text-foreground transition-colors">
                            View journey <ArrowUpRight className="size-3.5" />
                          </span>
                        </div>
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

export default PackagesPage;
