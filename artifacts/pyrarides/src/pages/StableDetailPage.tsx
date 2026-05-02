import { useEffect, useState } from "react";
import { Link, Redirect, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, MapPin, Star, Users, Clock, Loader2, Check } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";

interface Horse {
  id: string;
  name: string;
  imageUrls?: string[];
  pricePerHour: number;
  color?: string | null;
  skills?: string[];
  skillLevel?: string;
  adminTier?: string | null;
  isActive: boolean;
}

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  minPeople: number;
  maxPeople: number;
  duration: number;
}

interface Review {
  id: string;
  stableRating: number;
  comment: string;
  rider: { fullName: string };
  createdAt: string;
}

interface Stable {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  imageUrl?: string;
  rating: number;
  totalBookings: number;
  totalReviews: number;
  minLeadTimeHours: number;
  createdAt: string;
  horses?: Horse[];
  reviews?: Review[];
  owner?: { fullName: string };
}

const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

const StableDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [stable, setStable] = useState<Stable | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/stables/${id}`).then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      }),
      fetch(`/api/packages?stableId=${id}`).then((r) => r.json()).catch(() => []),
    ]).then(([stableData, pkgData]) => {
      if (stableData) setStable(stableData);
      setPackages(Array.isArray(pkgData) ? pkgData : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-10 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (notFound || !stable) return <Redirect to="/stables" />;

  const horses = stable.horses?.filter((h) => h.isActive) ?? [];
  const reviews = stable.reviews ?? [];

  return (
    <>
      {/* HERO */}
      <section className="relative h-[88svh] min-h-[640px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={stable.imageUrl || "/hero-bg.webp"} alt={stable.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/10 to-background" />
        </div>

        <div className="relative h-full container flex flex-col justify-end pb-20 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeLuxury, delay: 0.6 }}>
            <Link to="/stables" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-background/85 hover:text-background mb-8">
              <ArrowLeft className="size-3.5" /> All stables
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easeLuxury, delay: 0.7 }}
            className="text-[11px] tracking-luxury uppercase text-background/85">
            {stable.location}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: easeLuxury, delay: 0.75 }}
            className="mt-4 font-display text-background text-[12vw] sm:text-[8vw] md:text-[6vw] leading-[0.95] max-w-5xl text-balance">
            {stable.name}
          </motion.h1>
        </div>
      </section>

      {/* META BAR */}
      <Reveal className="border-y hairline bg-surface/40">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: MapPin, label: "Location", value: stable.location },
            { icon: Star, label: "Rating", value: `${stable.rating.toFixed(1)} · ${stable.totalReviews} reviews` },
            { icon: Users, label: "Total bookings", value: stable.totalBookings.toLocaleString() },
            { icon: Clock, label: "Lead time", value: `${stable.minLeadTimeHours}h minimum` },
          ].map((m) => (
            <div key={m.label} className="flex items-start gap-3">
              <m.icon className="size-4 mt-1 text-ink-muted shrink-0" />
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1">{m.label}</p>
                <p className="text-sm text-foreground">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ABOUT */}
      <section className="container py-32 md:py-40 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-4">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">The estate</p>
        </Reveal>
        <Reveal className="md:col-span-8" delay={0.1}>
          <p className="font-display text-3xl md:text-5xl leading-[1.15] text-balance">{stable.description}</p>
        </Reveal>
      </section>

      {/* HORSES */}
      {horses.length > 0 && (
        <section className="container">
          <div className="flex items-end justify-between mb-12 md:mb-16 border-b hairline pb-6">
            <div>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">The roster · {horses.length}</p>
              <h2 className="font-display text-4xl md:text-6xl leading-none">Our horses.</h2>
            </div>
            <p className="hidden sm:block max-w-xs text-sm text-ink-muted text-right">Each animal raised on the estate, trained for the plateau.</p>
          </div>

          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
            {horses.map((h) => (
              <StaggerItem key={h.id}>
                <article className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    <motion.img
                      src={h.imageUrls?.[0] || "/hero-bg.webp"} alt={h.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.2, ease: easeLuxury }}
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="font-display text-2xl leading-tight">{h.name}</h3>
                    {h.color && <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-muted">{h.color}{h.skillLevel ? ` · ${h.skillLevel}` : ""}</p>}
                    {h.skills && h.skills.length > 0 && (
                      <p className="mt-2 text-sm text-ink-soft">{h.skills.slice(0, 2).join(" · ")}</p>
                    )}
                    <p className="mt-2 text-sm text-foreground">EGP {h.pricePerHour.toLocaleString()}<span className="text-ink-muted"> / hr</span></p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* PACKAGES */}
      <section className="container py-32 md:py-40">
        <div className="grid md:grid-cols-12 gap-10 mb-12 md:mb-16">
          <Reveal className="md:col-span-5">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">From this estate</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] text-balance">Signature journeys.</h2>
          </Reveal>
        </div>

        {packages.length > 0 ? (
          <StaggerGroup className="space-y-0" gap={0.08}>
            {packages.map((p, i) => (
              <StaggerItem key={p.id}>
                <Link to={`/packages/${p.id}`} className="group grid md:grid-cols-12 gap-8 items-center py-8 border-t hairline last:border-b">
                  <div className="md:col-span-1 text-[11px] tracking-luxury uppercase text-ink-muted">№ {String(i + 1).padStart(2, "0")}</div>
                  <div className="md:col-span-5">
                    <h3 className="font-display text-3xl md:text-4xl leading-tight">{p.title}</h3>
                    <p className="mt-2 text-ink-muted line-clamp-1">{p.description}</p>
                  </div>
                  <div className="md:col-span-3 text-sm text-ink-soft">
                    <p>{fmtDuration(p.duration)}</p>
                    <p className="text-ink-muted">{p.minPeople}–{p.maxPeople} guests</p>
                  </div>
                  <div className="md:col-span-2 text-sm">
                    <p className="text-ink-muted text-[11px] tracking-luxury uppercase">From</p>
                    <p className="font-display text-2xl">EGP {p.price.toLocaleString()}</p>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <span className="inline-flex size-10 items-center justify-center border hairline rounded-full transition-all duration-500 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <p className="text-ink-muted">Bespoke itineraries arranged on request.</p>
        )}
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="container pb-32">
          <Reveal>
            <div className="border-t hairline pt-12">
              <div className="mb-12 grid md:grid-cols-12 gap-10">
                <div className="md:col-span-4">
                  <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Letters from guests</p>
                  <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">What riders say.</h2>
                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="font-display text-5xl">{stable.rating.toFixed(1)}</span>
                    <span className="text-ink-muted text-sm">{stable.totalReviews} reviews</span>
                  </div>
                </div>
                <StaggerGroup className="md:col-span-8 space-y-6" gap={0.06}>
                  {reviews.slice(0, 4).map((r) => (
                    <StaggerItem key={r.id}>
                      <div className="border-b hairline pb-6">
                        <div className="flex items-center gap-2 mb-3">
                          {Array.from({ length: r.stableRating }).map((_, i) => (
                            <Star key={i} className="size-3 fill-foreground text-foreground" />
                          ))}
                        </div>
                        <p className="text-foreground text-pretty leading-relaxed">"{r.comment}"</p>
                        <p className="mt-3 text-[10px] tracking-luxury uppercase text-ink-muted">{r.rider.fullName} · {new Date(r.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* CTA */}
      <section className="container pb-24">
        <Reveal>
          <div className="bg-foreground text-background p-10 md:p-16 grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-5">Reserve at {stable.name.split(" ")[0]}</p>
              <p className="font-display text-4xl md:text-5xl leading-[1.05] text-balance">A horse, a date, a sunrise. We arrange the rest.</p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link to={`/booking?stable=${stable.id}`} className="inline-flex items-center gap-3 px-7 py-4 bg-background text-foreground text-[12px] tracking-[0.2em] uppercase group">
                Begin reservation
                <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default StableDetailPage;
