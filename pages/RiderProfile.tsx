import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Trophy, MapPin, Award } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { LEADERBOARD, GALLERY_ITEMS, REVIEWS, STABLES } from "@/lib/mock-data/seed";

const RiderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const rider = LEADERBOARD.find((r) => r.id === id);
  if (!rider) return <Navigate to="/leaderboard" replace />;

  // Pull a curated slice of related photos and letters.
  const photos = GALLERY_ITEMS.filter((g) => g.riderName === rider.fullName).slice(0, 6);
  const letters = REVIEWS.filter((r) => r.riderName === rider.fullName).slice(0, 4);
  const visited = Array.from(new Set(photos.map((p) => p.stableName).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen pt-28">
      {/* Header */}
      <section className="container py-16 md:py-24 border-b hairline grid md:grid-cols-12 gap-10 items-end">
        <Reveal className="md:col-span-7">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Rider · № {String(rider.position).padStart(2, "0")}</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">{rider.fullName}</h1>
          <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
            {rider.ridesCompleted} journeys completed · {rider.league} league · {rider.rankPoints.toLocaleString()} pts
          </p>
        </Reveal>
        <Reveal className="md:col-span-5 md:justify-self-end" delay={0.1}>
          <div className="relative size-44 md:size-56 overflow-hidden bg-surface">
            <motion.img
              src={rider.profileImageUrl}
              alt={rider.fullName}
              className="h-full w-full object-cover grayscale"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 1.2, ease: easeLuxury }}
            />
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="container">
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border-b hairline" gap={0.06}>
          {[
            { label: "Rank", value: `№ ${rider.position}`, icon: Trophy },
            { label: "Journeys", value: rider.ridesCompleted, icon: Award },
            { label: "League", value: rider.league, icon: Award },
            { label: "Estates", value: visited.length || 1, icon: MapPin },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <div className="bg-background p-8">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-1.5"><s.icon className="size-3" /> {s.label}</p>
                <p className="mt-3 font-display text-4xl md:text-5xl capitalize">{s.value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Visited */}
      {visited.length > 0 && (
        <section className="container py-20 md:py-28">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Estates ridden</p>
            <h2 className="font-display text-3xl md:text-5xl">Where they have been.</h2>
          </Reveal>
          <ul className="mt-10 border-t hairline">
            {visited.map((name) => {
              const stable = STABLES.find((s) => s.name === name);
              return (
                <li key={name} className="border-b hairline py-6 grid md:grid-cols-12 gap-4 items-center">
                  <p className="md:col-span-7 font-display text-2xl">{name}</p>
                  <p className="md:col-span-3 text-sm text-ink-muted">{stable?.location ?? "—"}</p>
                  {stable && (
                    <Link to={`/stables/${stable.id}`} className="md:col-span-2 md:justify-self-end inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
                      Enter <ArrowUpRight className="size-3" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <section className="container pb-20 md:pb-28">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">From the album</p>
            <h2 className="font-display text-3xl md:text-5xl">Their record on the plateau.</h2>
          </Reveal>
          <StaggerGroup className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3" gap={0.06}>
            {photos.map((p) => (
              <StaggerItem key={p.id}>
                <figure className="relative aspect-[4/5] overflow-hidden bg-surface group">
                  <motion.img src={p.url} alt={p.caption} className="h-full w-full object-cover" whileHover={{ scale: 1.04 }} transition={{ duration: 1.2, ease: easeLuxury }} />
                  <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-foreground/70 to-transparent text-background text-[10px] tracking-luxury uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">{p.caption}</figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* Letters */}
      {letters.length > 0 && (
        <section className="container pb-28">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">In their hand</p>
            <h2 className="font-display text-3xl md:text-5xl">Letters they have left.</h2>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-2 gap-px bg-hairline border hairline">
            {letters.map((l) => (
              <article key={l.id} className="bg-background p-8">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{l.stableName}{l.horseName ? ` · ${l.horseName}` : ""}</p>
                <p className="mt-4 font-display text-xl leading-snug text-pretty">"{l.comment}"</p>
                <p className="mt-6 text-[11px] tracking-luxury uppercase text-ink-muted">{new Date(l.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RiderProfile;
