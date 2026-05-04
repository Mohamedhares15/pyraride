import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, MapPin, Clock, Users, Check } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { stables, horses, packages } from "@/data/mock";
import { RatingsSection } from "@/components/reviews/RatingsSection";
import { ReviewModal } from "@/components/reviews/ReviewModal";

const StableDetail = () => {
  const params = useParams<{ id?: string; stableId?: string }>();
  const id = params.id ?? params.stableId;
  const [reviewOpen, setReviewOpen] = useState(false);
  const stable = stables.find((s) => s.id === id);
  if (!stable) return <Navigate to="/stables" replace />;

  const stableHorses = horses.filter((h) => h.stableId === stable.id);
  const stablePackages = packages.filter((p) => p.stableId === stable.id);

  return (
    <>
      {/* HERO */}
      <section className="relative h-[88svh] min-h-[640px] overflow-hidden">
        <motion.div layoutId={`stable-image-${stable.id}`} className="absolute inset-0">
          <img src={stable.image} alt={stable.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/10 to-background" />
        </motion.div>

        <div className="relative h-full container flex flex-col justify-end pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLuxury, delay: 0.6 }}
          >
            <Link to="/stables" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-background/85 hover:text-background mb-8">
              <ArrowLeft className="size-3.5" /> All stables
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLuxury, delay: 0.7 }}
            className="text-[11px] tracking-luxury uppercase text-background/85"
          >
            Est. {stable.established} · {stable.location}
          </motion.p>

          <motion.h1 layoutId={`stable-name-${stable.id}`} className="mt-4 font-display text-background text-[12vw] sm:text-[8vw] md:text-[6vw] leading-[0.95] max-w-5xl text-balance">
            {stable.name}
          </motion.h1>
        </div>
      </section>

      {/* META BAR */}
      <Reveal className="border-y hairline bg-surface/40">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: MapPin, label: "Location", value: stable.location },
            { icon: Clock, label: "Hours", value: stable.hours },
            { icon: Users, label: "Roster", value: `${stable.riders} riders · ${stableHorses.length} horses` },
            { icon: ArrowUpRight, label: "Packages", value: `${stablePackages.length} signature journeys` },
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

      {/* STORY */}
      <section className="container py-32 md:py-40 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-4">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">The estate</p>
        </Reveal>
        <Reveal className="md:col-span-8" delay={0.1}>
          <p className="font-display text-3xl md:text-5xl leading-[1.15] text-balance">{stable.story}</p>
        </Reveal>
      </section>

      {/* HORSES */}
      <section className="container">
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b hairline pb-6">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">The roster · {stableHorses.length}</p>
            <h2 className="font-display text-4xl md:text-6xl leading-none">Our horses.</h2>
          </div>
          <p className="hidden sm:block max-w-xs text-sm text-ink-muted text-right">Each animal raised on the estate, trained from foal, named for a deity.</p>
        </div>

        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
          {stableHorses.map((h) => (
            <StaggerItem key={h.id}>
              <article className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  <motion.img
                    src={h.image} alt={h.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.2, ease: easeLuxury }}
                  />
                </div>
                <div className="pt-4">
                  <h3 className="font-display text-2xl leading-tight">{h.name}</h3>
                  <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-muted">{h.breed} · {h.age} yrs</p>
                  <p className="mt-2 text-sm text-ink-soft">{h.temperament}</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* PACKAGES */}
      <section className="container py-32 md:py-40">
        <div className="grid md:grid-cols-12 gap-10 mb-12 md:mb-16">
          <Reveal className="md:col-span-5">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">From this estate</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] text-balance">Signature journeys.</h2>
          </Reveal>
        </div>

        {stablePackages.length > 0 ? (
          <StaggerGroup className="space-y-0" gap={0.08}>
            {stablePackages.map((p, i) => (
              <StaggerItem key={p.id}>
                <Link to={`/packages/${p.id}`} className="group grid md:grid-cols-12 gap-8 items-center py-8 border-t hairline last:border-b">
                  <div className="md:col-span-1 text-[11px] tracking-luxury uppercase text-ink-muted">№ {String(i + 1).padStart(2, "0")}</div>
                  <div className="md:col-span-5">
                    <h3 className="font-display text-3xl md:text-4xl leading-tight">{p.name}</h3>
                    <p className="mt-2 text-ink-muted">{p.tagline}</p>
                  </div>
                  <div className="md:col-span-3 text-sm text-ink-soft">
                    <p>{p.duration}</p>
                    <p className="text-ink-muted">{p.minPeople}–{p.maxPeople} guests</p>
                  </div>
                  <div className="md:col-span-2 text-sm">
                    <p className="text-ink-muted text-[11px] tracking-luxury uppercase">From</p>
                    <p className="font-display text-2xl">${p.price}</p>
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

      {/* AMENITIES */}
      <section className="container pb-32">
        <Reveal>
          <div className="border-t hairline pt-12 grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Quiet luxuries</p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.05] text-balance">All included.</h2>
              <p className="mt-5 text-ink-soft text-pretty max-w-xs">Nothing on this list is optional, surcharged, or upsold. It is simply how we receive guests.</p>
            </div>
            <StaggerGroup className="md:col-span-8 grid sm:grid-cols-2 gap-x-10 gap-y-1" gap={0.05}>
              {stable.amenities.map((a) => (
                <StaggerItem key={a}>
                  <div className="flex items-center gap-4 py-4 border-b hairline">
                    <Check className="size-4 text-foreground shrink-0" />
                    <span className="text-foreground">{a}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </Reveal>
      </section>

      {/* REVIEWS */}
      <RatingsSection onWrite={() => setReviewOpen(true)} />
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} packageName={stable.name} />

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

export default StableDetail;
