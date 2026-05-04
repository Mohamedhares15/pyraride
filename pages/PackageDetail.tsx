"use client";
import { Link, Navigate, useParams } from "@/components/shared/shims";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Clock, Coffee, Music, Users, Car } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { packages, stables } from "@/data/mock";

const ITINERARY = [
  { time: "Pre-dawn", title: "Concierge transfer", body: "A driver collects you from your residence in a dark sedan, ninety minutes before first light." },
  { time: "Arrival", title: "Mint tea & briefing", body: "You meet your master rider over a quiet cup of tea, choose your saddle, and dress in linen." },
  { time: "Dawn", title: "The procession begins", body: "You ride out across the plateau as the sun lifts the pyramids from shadow." },
  { time: "Mid-morning", title: "A breakfast in the sand", body: "Linen is laid in a private hollow. Coffee, dates, fresh bread, and silence." },
  { time: "Return", title: "Back to the estate", body: "A slow walk home, the horses calm, the morning entirely yours." },
];

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) return <Navigate to="/packages" replace />;
  const stable = stables.find((s) => s.id === pkg.stableId)!;

  const inclusions: { icon: typeof Coffee; label: string; on: boolean }[] = [
    { icon: Coffee, label: "Linen tea & dining", on: pkg.hasFood },
    { icon: ArrowUpRight, label: "Private horseback ride", on: pkg.hasHorseRide },
    { icon: Car, label: "Concierge transfer", on: pkg.hasTransportation },
    { icon: Music, label: "Folkloric performance", on: pkg.hasDancingShow },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative h-[80svh] min-h-[600px] overflow-hidden">
        <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: easeLuxury }} className="absolute inset-0">
          <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/10 to-background" />
        </motion.div>
        <div className="relative h-full container flex flex-col justify-end pb-20 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeLuxury, delay: 0.5 }}>
            <Link to="/packages" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-background/85 hover:text-background mb-8">
              <ArrowLeft className="size-3.5" /> All journeys
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easeLuxury, delay: 0.6 }}
            className="text-[11px] tracking-luxury uppercase text-background/85">
            {stable.name} · {pkg.duration}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: easeLuxury, delay: 0.75 }}
            className="mt-4 font-display text-background text-[12vw] sm:text-[8vw] md:text-[6vw] leading-[0.95] max-w-5xl text-balance">
            {pkg.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1, ease: easeLuxury }}
            className="mt-4 text-background/85 max-w-xl text-pretty">{pkg.tagline}</motion.p>
        </div>
      </section>

      {/* META BAR */}
      <Reveal className="border-y hairline bg-surface/40">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Clock, label: "Duration", value: pkg.duration },
            { icon: Users, label: "Party", value: `${pkg.minPeople}–${pkg.maxPeople} guests` },
            { icon: ArrowUpRight, label: "Estate", value: stable.name },
            { icon: Coffee, label: "From", value: `$${pkg.price} / guest` },
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

      {/* CONTENT */}
      <section className="container py-32 md:py-40 grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-32">
          {/* Story */}
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">The journey</p>
            <p className="font-display text-3xl md:text-4xl leading-[1.2] text-balance">
              An unhurried morning at the foot of antiquity. You ride the same sand the pharaohs rode, with a master rider at your shoulder and a linen breakfast waiting in the dunes.
            </p>
          </Reveal>

          {/* Inclusions */}
          <div>
            <Reveal>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">What is included</p>
              <h2 className="font-display text-3xl md:text-5xl leading-[1.05]">All arranged. None upsold.</h2>
            </Reveal>
            <StaggerGroup className="mt-10 grid sm:grid-cols-2 gap-x-10" gap={0.06}>
              {(inclusions || []).map((it) => (
                <StaggerItem key={it.label}>
                  <div className="flex items-center justify-between gap-4 py-5 border-b hairline">
                    <div className="flex items-center gap-4">
                      <it.icon className={`size-4 ${it.on ? "text-foreground" : "text-ink-muted/40"}`} />
                      <span className={it.on ? "text-foreground" : "text-ink-muted/50 line-through"}>{it.label}</span>
                    </div>
                    {it.on
                      ? <Check className="size-4 text-foreground" />
                      : <span className="text-[10px] tracking-luxury uppercase text-ink-muted/50">N/A</span>}
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          {/* Itinerary */}
          <div>
            <Reveal>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">The itinerary</p>
              <h2 className="font-display text-3xl md:text-5xl leading-[1.05]">Hour by hour.</h2>
            </Reveal>
            <StaggerGroup className="mt-12 relative" gap={0.08}>
              <span aria-hidden className="absolute left-[7.5rem] top-2 bottom-2 w-px bg-hairline hidden md:block" />
              {(ITINERARY || []).map((step) => (
                <StaggerItem key={step.title}>
                  <div className="grid md:grid-cols-[8rem_1fr] gap-4 md:gap-10 py-7 border-b hairline last:border-b-0">
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted md:pt-1.5 relative">
                      <span className="hidden md:inline-block size-2 rounded-full bg-foreground absolute left-[5.5rem] top-2.5" />
                      {step.time}
                    </p>
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl leading-tight">{step.title}</h3>
                      <p className="mt-2 text-ink-soft text-pretty max-w-xl">{step.body}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>

        {/* RESERVE PANEL */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 border hairline bg-surface-elevated/60 p-8">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">{stable.name}</p>
            <h3 className="font-display text-3xl leading-tight">{pkg.name}</h3>

            <div className="mt-8 pt-6 border-t hairline space-y-3 text-sm">
              <Row label="Duration" value={pkg.duration} />
              <Row label="Party" value={`${pkg.minPeople}–${pkg.maxPeople} guests`} />
              <Row label="From" value={`$${pkg.price} / guest`} />
            </div>

            <Link
              to={`/checkout/package/${pkg.id}`}
              className="mt-8 w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase group"
            >
              Begin reservation
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <Link
              to={`/stables/${stable.id}`}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border hairline text-[12px] tracking-[0.2em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
            >
              Visit the estate
            </Link>

            <p className="mt-6 text-xs text-ink-muted text-pretty">
              No charge until your concierge confirms availability within 24 hours.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</span>
    <span className="text-foreground text-right">{value}</span>
  </div>
);

export default PackageDetail;

// Forced SSR to bypass static pre-render errors during UI migration
export const getServerSideProps = async () => ({ props: {} });
