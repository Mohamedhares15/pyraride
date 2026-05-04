"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "@/components/shared/shims";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/Motion";
const founder = "/assets/founder-portrait.jpg";
const courtyard = "/assets/stable-courtyard.jpg";
const desertRide = "/assets/desert-ride.jpg";
const masterRider = "/assets/master-rider.jpg";

const PILLARS = [
  { n: "01", title: "By reservation, only.", body: "We accept a small number of riders each day. The desert deserves stillness; our horses deserve rest." },
  { n: "02", title: "Every horse, by name.", body: "We do not rotate strangers. You will be matched with one horse, introduced before the saddle." },
  { n: "03", title: "Our families, our stables.", body: "We work with seven heritage stables, each independently owned by Egyptian families across four generations." },
  { n: "04", title: "Quiet, by design.", body: "No microphones, no theatre, no upsells in the saddle. The journey is the offer." },
];

const TIMELINE = [
  { year: "1924", title: "The first courtyard", body: "Sheikh Mahmoud Al-Nasr breaks ground on a stable within sight of the Great Pyramid." },
  { year: "1962", title: "A second generation", body: "His son Karim formalises the breeding programme for purebred Egyptian Arabians." },
  { year: "1998", title: "The concierge model", body: "Six allied families agree on a shared standard of care, hospitality, and reservation." },
  { year: "2024", title: "PyraRides, in name", body: "A century in, we open quietly to a wider readership of riders. Same stables. Same hands." },
];

const NUMBERS = [
  { v: "100", l: "Years of stewardship" },
  { v: "07", l: "Heritage stables" },
  { v: "84", l: "Horses, by name" },
  { v: "12", l: "Riders per day, max" },
];

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="pb-32">
      {/* Hero */}
      <section ref={heroRef} className="relative h-[92vh] min-h-[640px] overflow-hidden bg-foreground text-background">
        <motion.div style={{ y }} className="absolute inset-0">
          <img src={courtyard} alt="" className="absolute inset-0 w-full h-full object-cover opacity-55" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-transparent to-foreground/80" />
        <div className="relative h-full container flex flex-col justify-end pb-20">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase opacity-80 mb-6">The House · Est. 1924</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-[clamp(3rem,10vw,9rem)] leading-[0.92] max-w-5xl text-balance">
              Heritage, written in <em className="italic">hoofprints</em>.
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-lg text-background/85 text-pretty leading-relaxed">
              PyraRides is the quiet alliance of seven Egyptian families who have raised horses
              within sight of the Pyramids of Giza for one hundred years.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Numbers */}
      <section className="container mt-24">
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 border-y hairline py-12">
          {(NUMBERS || []).map((n) => (
            <StaggerItem key={n.l} className="text-center md:text-left">
              <p className="font-display text-6xl md:text-7xl leading-none">{n.v}</p>
              <p className="mt-3 text-[10px] tracking-luxury uppercase text-ink-muted">{n.l}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Founder portrait + opening letter */}
      <section className="container mt-32 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        <Reveal className="md:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-surface">
            <img src={founder} alt="Sheikh Mahmoud Al-Nasr, 1924" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <p className="mt-4 text-[10px] tracking-luxury uppercase text-ink-muted">
            Sheikh Mahmoud Al-Nasr · Founder · c. 1924
          </p>
        </Reveal>
        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">A letter from the house</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-display text-3xl md:text-4xl leading-[1.2] text-balance">
              "We have never advertised. We have only kept our promises — to the horses first, and to the rider second."
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 space-y-5 text-ink-soft leading-relaxed text-pretty">
              <p>
                My grandfather built this stable with his hands and three Arabians. He did not believe in volume.
                He believed in the slow morning, the same one we offer now.
              </p>
              <p>
                What we sell, if we must call it that, is restraint. A short list of stables, a short list of riders,
                a long memory between us.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-10 text-[11px] tracking-luxury uppercase text-ink-muted">
              — Yusuf Al-Nasr · Fourth generation
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="container mt-32">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">Four standards</p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl text-balance">
            What we agree on, before we agree on anything else.
          </h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-2 gap-px bg-hairline border hairline">
          {(PILLARS || []).map((p, i) => (
            <Reveal key={p.n} delay={i * 0.05} className="bg-background p-10 md:p-14">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{p.n}</p>
              <h3 className="font-display text-3xl mt-4 leading-tight">{p.title}</h3>
              <p className="mt-4 text-ink-soft text-pretty leading-relaxed">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container mt-32">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">A century, briefly</p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl text-balance">
            One hundred years. Four generations. The same courtyard.
          </h2>
        </Reveal>
        <div className="mt-16 relative">
          <div className="absolute left-[22px] md:left-1/2 top-2 bottom-2 w-px bg-hairline" />
          <div className="space-y-16">
            {(TIMELINE || []).map((t, i) => (
              <Reveal key={t.year} delay={i * 0.05}>
                <div className={`grid md:grid-cols-2 gap-8 items-start ${i % 2 ? "md:[direction:rtl]" : ""}`}>
                  <div className="relative pl-14 md:pl-0 md:[direction:ltr] md:text-right md:pr-12">
                    <span className="absolute left-[15px] md:left-auto md:right-[-7px] top-3 w-3.5 h-3.5 rounded-full bg-foreground ring-4 ring-background" />
                    <p className="font-display text-5xl md:text-6xl leading-none">{t.year}</p>
                  </div>
                  <div className="pl-14 md:pl-12 md:[direction:ltr]">
                    <h3 className="font-display text-2xl">{t.title}</h3>
                    <p className="mt-3 text-ink-soft text-pretty leading-relaxed">{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* People */}
      <section className="container mt-32 grid md:grid-cols-12 gap-10 items-center">
        <Reveal className="md:col-span-7 order-2 md:order-1">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">The people</p>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05] text-balance">
            We are riders, breeders, grooms, and one quiet concierge.
          </h2>
          <p className="mt-6 text-ink-soft leading-relaxed max-w-lg text-pretty">
            Behind every reservation is a small team — three generations of the Al-Nasr family,
            our master rider Hassan El-Masri, and a concierge who answers within the hour.
          </p>
          <Link
            to="/training"
            className="inline-block mt-10 text-[12px] tracking-[0.2em] uppercase border-b hairline pb-1 hover:border-foreground transition-colors"
          >
            Meet the master rider →
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-5 order-1 md:order-2">
          <div className="aspect-[4/5] overflow-hidden bg-surface">
            <img src={masterRider} alt="Hassan El-Masri" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </Reveal>
      </section>

      {/* Closing */}
      <section className="container mt-32">
        <div className="relative bg-foreground text-background p-12 md:p-20 overflow-hidden">
          <img src={desertRide} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] tracking-luxury uppercase opacity-80 mb-6">An invitation</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              When you are ready, the courtyard is open.
            </h2>
            <Link
              to="/booking"
              className="inline-block mt-10 text-[12px] tracking-[0.22em] uppercase border-b border-background/40 pb-1 hover:border-background transition-colors"
            >
              Reserve a morning →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
