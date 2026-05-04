import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useRef } from "react";
import heroImg from "@/assets/hero-pyramids.jpg";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { stables, packages } from "@/data/mock";
import { SAMPLE_REVIEWS } from "@/components/reviews/RatingsSection";
import { Stars } from "@/components/reviews/Stars";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[680px] overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <img src={heroImg} alt="Rider in cream linen on a dark Arabian horse before the Great Pyramid at golden hour" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        </motion.div>

        <motion.div style={{ opacity }} className="relative h-full container flex flex-col justify-end pb-24 md:pb-32">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeLuxury, delay: 0.3 }}
            className="text-[11px] tracking-luxury uppercase text-background/90"
          >
            Est. Giza · By reservation only
          </motion.p>
          <motion.h1
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.45 } } }}
            className="mt-5 font-display text-background text-[14vw] sm:text-[10vw] md:text-[7.5vw] leading-[0.95] max-w-5xl text-balance"
          >
            {["The heritage", "of the Pyramids,", "by horseback."].map((line, i) => (
              <motion.span key={i} variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: easeLuxury } } }} className="block">
                {line}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeLuxury, delay: 1.2 }}
            className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <Link to="/booking" className="group inline-flex items-center gap-3 px-7 py-4 bg-background text-foreground text-[12px] tracking-[0.2em] uppercase">
              Reserve a journey
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link to="/stables" className="text-[12px] tracking-[0.2em] uppercase text-background/90 hover:text-background underline-offset-8 hover:underline">
              Discover the stables
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-background/80 text-[10px] tracking-luxury uppercase"
        >
          Scroll
        </motion.div>
      </section>

      {/* MANIFESTO */}
      <section className="container py-32 md:py-44 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-4">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">Our house</p>
        </Reveal>
        <Reveal className="md:col-span-8" delay={0.15}>
          <p className="font-display text-3xl md:text-5xl leading-[1.15] text-balance">
            For one hundred years, our families have raised the finest Arabians in the shadow of the pyramids. PyraRides curates that lineage into a single, quiet experience — a private concierge for those who would rather arrive by saddle than by car.
          </p>
        </Reveal>
      </section>

      {/* FEATURED STABLES */}
      <section className="container">
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b hairline pb-6">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">The stables</p>
            <h2 className="font-display text-4xl md:text-6xl leading-none">Three estates. One plateau.</h2>
          </div>
          <Link to="/stables" className="hidden sm:inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink-muted hover:text-foreground transition-colors">
            View all <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <StaggerGroup className="grid gap-6 md:grid-cols-3" gap={0.12}>
          {stables.map((s) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-4 left-4 text-[10px] tracking-luxury uppercase text-background/90">Est. {s.established}</div>
                </motion.div>
                <div className="pt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl leading-tight">{s.name}</h3>
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
      </section>

      {/* SIGNATURE PACKAGES */}
      <section className="container py-32 md:py-44">
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <Reveal className="md:col-span-5">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Signature journeys</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] text-balance">Curated, never crowded.</h2>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7 self-end" delay={0.15}>
            <p className="text-ink-soft text-pretty">Three signature experiences, each limited to a small party. Every detail — from your horse's lineage to the linen on the table — is arranged before you arrive.</p>
          </Reveal>
        </div>

        <StaggerGroup className="space-y-4" gap={0.08}>
          {packages.map((p, i) => (
            <StaggerItem key={p.id}>
              <Link to={`/packages/${p.id}`} className="group grid md:grid-cols-12 gap-8 items-center py-8 border-t hairline last:border-b">
                <div className="md:col-span-1 text-[11px] tracking-luxury uppercase text-ink-muted">№ {String(i+1).padStart(2,"0")}</div>
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
      </section>

      {/* GUEST LETTERS */}
      <section className="container py-32 md:py-44 border-t hairline">
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <Reveal className="md:col-span-5">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Guest letters</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] text-balance">In their own hand.</h2>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7 self-end" delay={0.15}>
            <p className="text-ink-soft text-pretty">A small selection of letters from riders who have spent a morning with us. Read the rest in our archive.</p>
          </Reveal>
        </div>

        <StaggerGroup className="grid gap-px bg-hairline border hairline md:grid-cols-3" gap={0.1}>
          {SAMPLE_REVIEWS.slice(0, 3).map((r) => (
            <StaggerItem key={r.id}>
              <article className="h-full bg-background p-8 md:p-10 flex flex-col">
                <Stars value={r.rating} size="sm" />
                <h3 className="mt-5 font-display text-2xl leading-tight text-balance">{r.title}</h3>
                <p className="mt-4 text-ink-soft text-sm leading-relaxed text-pretty line-clamp-5">{r.body}</p>
                <div className="mt-auto pt-8 border-t hairline">
                  <p className="font-display text-lg leading-tight">{r.author}</p>
                  <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ink-muted">{r.location} · {r.date}</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 flex justify-center">
          <Link to="/reviews" className="inline-flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-ink-muted hover:text-foreground transition-colors">
            Read all letters <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <Reveal className="relative overflow-hidden">
          <div className="bg-foreground text-background p-10 md:p-20 grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-5">Concierge</p>
              <p className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">A single email is all that stands between you and the desert at first light.</p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link to="/booking" className="inline-flex items-center gap-3 px-7 py-4 bg-background text-foreground text-[12px] tracking-[0.2em] uppercase group">
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

export default Index;
