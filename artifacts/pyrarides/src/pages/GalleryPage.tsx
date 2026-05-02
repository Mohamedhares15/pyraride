import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import desertRide from "@/assets/desert-ride.jpg";
import horsePortrait from "@/assets/horse-portrait.jpg";
import stableCourtyard from "@/assets/stable-courtyard.jpg";

type Frame = {
  src: string;
  caption: string;
  meta: string;
  category: "Desert" | "Stables" | "Riders" | "Detail";
  span?: "tall" | "wide" | "square";
};

const FRAMES: Frame[] = [
  { src: g1, caption: "Of cloth and shadow, of horse and hour.", meta: "Giza · 06:14", category: "Riders", span: "tall" },
  { src: g2, caption: "A century of hands, the same gentle pressure.", meta: "Al-Nasr Stables · 1998", category: "Stables", span: "wide" },
  { src: g3, caption: "Two riders, one silence.", meta: "Western Desert · Spring", category: "Desert", span: "wide" },
  { src: g4, caption: "Hand-tooled in Cairo, soft as old letters.", meta: "Saddlery, no.7", category: "Detail", span: "tall" },
  { src: g5, caption: "She arrived a guest. She left a rider.", meta: "Concierge · April", category: "Riders", span: "tall" },
  { src: g6, caption: "After the last guest. Before the moon.", meta: "Courtyard · 19:42", category: "Stables", span: "wide" },
  { src: desertRide, caption: "The sand keeps every hoofprint, briefly.", meta: "Plateau · West", category: "Desert", span: "square" },
  { src: horsePortrait, caption: "A bay named Najma. Star, in Arabic.", meta: "Roster · 014", category: "Detail", span: "square" },
  { src: stableCourtyard, caption: "The courtyard wakes before we do.", meta: "Al-Nasr · 05:30", category: "Stables", span: "square" },
];

const FILTERS = ["All", "Desert", "Stables", "Riders", "Detail"] as const;

const GalleryPage = () => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState<Frame | null>(null);

  const visible = filter === "All" ? FRAMES : FRAMES.filter((f) => f.category === filter);

  return (
    <div className="pt-32 pb-32">
      <section className="container">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">Gallery · No. 04</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.95] text-balance max-w-5xl">
            A century, <em className="italic text-ink-soft">in silver</em>.
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 max-w-xl text-ink-soft text-pretty leading-relaxed">
            An archive — partial, deliberate. The desert at every hour, the courtyard between guests, and the horses who carry our quiet hours.
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t hairline border-b py-5">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted mr-2">Filter</span>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="relative text-[12px] tracking-[0.18em] uppercase pb-1 text-ink-soft hover:text-foreground transition-colors"
              >
                {f}
                {filter === f && (
                  <motion.span
                    layoutId="filter-underline"
                    className="absolute left-0 right-0 -bottom-[6px] h-px bg-foreground"
                    transition={{ duration: 0.5, ease: easeLuxury }}
                  />
                )}
              </button>
            ))}
            <span className="ml-auto text-[10px] tracking-luxury uppercase text-ink-muted">
              {String(visible.length).padStart(2, "0")} frames
            </span>
          </div>
        </Reveal>
      </section>

      <section className="container mt-16">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-6 gap-5 md:gap-6">
          <AnimatePresence mode="popLayout">
            {visible.map((frame, i) => {
              const spanCls =
                frame.span === "tall"
                  ? "md:col-span-2 md:row-span-2 aspect-[3/4]"
                  : frame.span === "wide"
                  ? "md:col-span-4 aspect-[16/10]"
                  : "md:col-span-2 aspect-square";
              return (
                <motion.button
                  layout
                  key={frame.src}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.7, ease: easeLuxury, delay: i * 0.04 }}
                  onClick={() => setActive(frame)}
                  className={`group relative overflow-hidden bg-surface text-left ${spanCls}`}
                >
                  <img
                    src={frame.src}
                    alt={frame.caption}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute left-5 right-5 bottom-5 text-background opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <p className="text-[10px] tracking-luxury uppercase opacity-80">{frame.meta}</p>
                    <p className="font-display text-xl mt-1 leading-snug text-balance">{frame.caption}</p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="container mt-32 grid md:grid-cols-12 gap-10 items-end">
        <Reveal className="md:col-span-5">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">Curatorial note</p>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">
            We photograph rarely, and only what stays still long enough to be remembered.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-6 md:col-start-7 text-ink-soft leading-relaxed text-pretty">
          <p>
            Our archive is built from the residue of quiet mornings. We do not stage. We do not retouch the desert. What you see here is what our riders see — once, slowly, and never the same way twice.
          </p>
          <p className="mt-5">
            For licensing, prints, or to commission a private session with our resident photographer, write to the concierge.
          </p>
        </Reveal>
      </section>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeLuxury }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[100] bg-foreground/95 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out"
          >
            <motion.figure
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.6, ease: easeLuxury }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full"
            >
              <img src={active.src} alt={active.caption} className="w-full h-auto max-h-[78vh] object-contain" />
              <figcaption className="mt-5 flex items-baseline justify-between gap-6 text-background/85">
                <p className="font-display text-2xl text-balance">{active.caption}</p>
                <p className="text-[10px] tracking-luxury uppercase opacity-70 shrink-0">{active.meta}</p>
              </figcaption>
            </motion.figure>
            <button
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 text-background/80 text-[11px] tracking-luxury uppercase hover:text-background"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
