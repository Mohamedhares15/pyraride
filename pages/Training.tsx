import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, Plus, Minus } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import arena from "@/assets/training-arena.jpg";
import master from "@/assets/master-rider.jpg";

const PROGRAMMES = [
  {
    id: "novice",
    eyebrow: "Programme I",
    name: "First Saddle",
    audience: "For those who have never ridden",
    duration: "3 mornings",
    price: 1240,
    inclusions: ["Private master rider", "Ground school & seat work", "Two desert rides", "Linen breakfast each morning"],
  },
  {
    id: "intermediate",
    eyebrow: "Programme II",
    name: "The Continental Seat",
    audience: "For confident riders",
    duration: "5 mornings",
    price: 2680,
    inclusions: ["Dressage in private arena", "Sunrise plateau rides", "Trot, canter, lateral work", "Daily concierge transfer"],
    featured: true,
  },
  {
    id: "advanced",
    eyebrow: "Programme III",
    name: "The Horus Initiation",
    audience: "For accomplished horsemen",
    duration: "7 mornings",
    price: 4980,
    inclusions: ["Olympic-grade dressage hall", "Egyptian Arabian assigned to you", "Desert long-rides", "Private banquet on closing"],
  },
];

const CURRICULUM = [
  { day: "Morning I",   title: "Seat & silence",   body: "We begin on the ground. Posture, breath, and the quiet language a horse already understands." },
  { day: "Morning II",  title: "First contact",    body: "Mounted at the walk in the private arena. Reins, weight, the simple geometry of turning." },
  { day: "Morning III", title: "Onto the sand",    body: "Out of the arena and onto the plateau at first light, at the walk and trot." },
  { day: "Morning IV",  title: "Cadence",          body: "Canter work in the dunes, transitions, and the first proper gallop on safe ground." },
  { day: "Morning V",   title: "The procession",   body: "A solo ride to the pyramid and back, escorted but unguided. The morning is yours." },
];

const FAQ = [
  { q: "I've never ridden. Will I be safe?", a: "Programme I is designed for absolute beginners. Each guest is assigned a master rider one-to-one, and we never leave the arena until you ask." },
  { q: "What should I wear?", a: "Long trousers and closed shoes. We provide helmets, boots, and linen jackets — sized to you and waiting in your private dressing salon." },
  { q: "Are programmes private?", a: "Always. We accept one rider, or one party, per programme. You will never share your master rider, your horse, or the morning." },
  { q: "Can the programme be tailored?", a: "Of course. Tell your concierge what you'd like — competition prep, photography, a child's first ride — and the programme will be re-shaped." },
];

const Training = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative h-[88svh] min-h-[640px] overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <img src={arena} alt="Private dressage arena at golden hour with rider on grey Arabian horse" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/15 via-transparent to-background" />
        </motion.div>
        <div className="relative h-full container flex flex-col justify-end pb-20 md:pb-28">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easeLuxury, delay: 0.4 }}
            className="text-[11px] tracking-luxury uppercase text-background/90">
            Training · By private programme
          </motion.p>
          <motion.h1
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.55 } } }}
            className="mt-4 font-display text-background text-[12vw] sm:text-[8vw] md:text-[6.5vw] leading-[0.95] max-w-5xl text-balance"
          >
            {["From novice", "to noble."].map((line, i) => (
              <motion.span key={i} variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 1.05, ease: easeLuxury } } }} className="block">
                {line}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.9, ease: easeLuxury }}
            className="mt-6 max-w-xl text-background/90 text-pretty">
            One rider, one master, one horse. A private equestrian programme on the sand the pharaohs rode.
          </motion.p>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="container py-32 md:py-44 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-4">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">The method</p>
        </Reveal>
        <Reveal className="md:col-span-8" delay={0.15}>
          <p className="font-display text-3xl md:text-5xl leading-[1.15] text-balance">
            We do not teach in groups. We do not teach in a hurry. Each programme begins on the ground, in silence, and ends on the sand at the foot of the pyramids — at the rider's own quiet pace.
          </p>
        </Reveal>
      </section>

      {/* PROGRAMMES */}
      <section className="container">
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b hairline pb-6">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Programmes · {PROGRAMMES.length}</p>
            <h2 className="font-display text-4xl md:text-6xl leading-none">Three paths.</h2>
          </div>
          <p className="hidden md:block text-sm text-ink-muted max-w-xs text-right">All programmes are one-to-one. Pricing is per rider.</p>
        </div>

        <StaggerGroup className="grid gap-px bg-hairline border hairline" gap={0.1}>
          {PROGRAMMES.map((p) => (
            <StaggerItem key={p.id}>
              <article className={cn(
                "group h-full p-8 md:p-10 flex flex-col transition-colors duration-700",
                p.featured ? "bg-foreground text-background" : "bg-background hover:bg-surface/60",
              )}>
                <p className={cn("text-[10px] tracking-luxury uppercase mb-6", p.featured ? "text-background/60" : "text-ink-muted")}>{p.eyebrow}</p>
                <h3 className="font-display text-4xl md:text-5xl leading-[1.05]">{p.name}</h3>
                <p className={cn("mt-3", p.featured ? "text-background/80" : "text-ink-muted")}>{p.audience}</p>

                <div className={cn("mt-8 pt-6 border-t", p.featured ? "border-background/20" : "hairline")}>
                  <div className="flex items-baseline justify-between">
                    <span className={cn("text-[10px] tracking-luxury uppercase", p.featured ? "text-background/60" : "text-ink-muted")}>From</span>
                    <span className="font-display text-3xl">${p.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className={cn("text-[10px] tracking-luxury uppercase", p.featured ? "text-background/60" : "text-ink-muted")}>Duration</span>
                    <span className="text-sm">{p.duration}</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-3 text-sm">
                  {p.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-3">
                      <Check className={cn("size-4 mt-0.5 shrink-0", p.featured ? "text-background" : "text-foreground")} />
                      <span className={p.featured ? "text-background/90" : "text-ink-soft"}>{inc}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/training/checkout?programme=${p.id}`}
                  className={cn(
                    "mt-10 inline-flex items-center justify-center gap-3 px-6 py-3.5 text-[12px] tracking-[0.2em] uppercase transition-colors group/btn",
                    p.featured
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-foreground text-background hover:bg-foreground/90",
                  )}
                >
                  Reserve programme
                  <ArrowUpRight className="size-4 transition-transform duration-500 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                </Link>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* MASTER RIDER */}
      <section className="container py-32 md:py-44">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-surface">
              <img src={master} alt="Master rider Hassan El-Masri" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
          <Reveal className="lg:col-span-7 lg:pl-8" delay={0.15}>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">Your master</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">Hassan El-Masri</h2>
            <p className="mt-3 text-[11px] tracking-[0.18em] uppercase text-ink-muted">Olympic dressage · 42 years on the plateau</p>

            <p className="mt-8 font-display text-2xl md:text-3xl leading-[1.3] text-balance">
              "A horse is not a vehicle. It is a guest you have invited to carry you. The first lesson is to be worth the invitation."
            </p>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t hairline pt-8">
              {[
                ["1982", "First saddle"],
                ["1996", "Atlanta Olympics"],
                ["2009", "Founded the school"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-display text-3xl">{k}</dt>
                  <dd className="text-xs tracking-[0.14em] uppercase text-ink-muted mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="container">
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b hairline pb-6">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">The curriculum · Programme II</p>
            <h2 className="font-display text-4xl md:text-6xl leading-none">Five mornings.</h2>
          </div>
        </div>

        <StaggerGroup className="relative" gap={0.08}>
          <span aria-hidden className="absolute left-[8.5rem] top-2 bottom-2 w-px bg-hairline hidden md:block" />
          {CURRICULUM.map((step) => (
            <StaggerItem key={step.title}>
              <div className="grid md:grid-cols-[10rem_1fr] gap-4 md:gap-10 py-8 border-b hairline last:border-b-0">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted md:pt-1.5 relative">
                  <span className="hidden md:inline-block size-2 rounded-full bg-foreground absolute left-[7.5rem] top-2.5" />
                  {step.day}
                </p>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl leading-tight">{step.title}</h3>
                  <p className="mt-2 text-ink-soft text-pretty max-w-xl">{step.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* FAQ */}
      <section className="container py-32 md:py-44 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-4">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Quietly answered</p>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05] text-balance">Before you ride.</h2>
        </Reveal>
        <div className="md:col-span-8">
          <StaggerGroup gap={0.06}>
            {FAQ.map((item, i) => (
              <StaggerItem key={item.q}>
                <FaqRow item={item} defaultOpen={i === 0} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-32">
        <Reveal>
          <div className="bg-foreground text-background p-10 md:p-20 grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-5">Begin</p>
              <p className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">Your concierge is ready to write your programme.</p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link to="/booking" className="inline-flex items-center gap-3 px-7 py-4 bg-background text-foreground text-[12px] tracking-[0.2em] uppercase group">
                Speak with concierge
                <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

const FaqRow = ({ item, defaultOpen = false }: { item: { q: string; a: string }; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b hairline">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-6 py-6 text-left group">
        <span className="font-display text-2xl md:text-3xl leading-tight transition-colors group-hover:text-foreground/80">{item.q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.5, ease: easeLuxury }} className="shrink-0">
          {open ? <Plus className="size-5" /> : <Plus className="size-5" />}
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.5, ease: easeLuxury }}
        className="overflow-hidden"
      >
        <p className="pb-6 max-w-2xl text-ink-soft text-pretty">{item.a}</p>
      </motion.div>
    </div>
  );
};

export default Training;
