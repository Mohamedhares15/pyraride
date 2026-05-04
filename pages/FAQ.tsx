import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal, easeLuxury } from "@/components/shared/Motion";

type QA = { q: string; a: string };

const SECTIONS: { title: string; eyebrow: string; items: QA[] }[] = [
  {
    eyebrow: "Section · 01",
    title: "Before you ride",
    items: [
      { q: "How do I reserve a ride?", a: "Every journey is by reservation. Choose a stable and a package, then our concierge confirms within the hour. We do not accept walk-ins." },
      { q: "What should I wear?", a: "Long, loose linen or cotton trousers, closed-toe shoes with a small heel, and a light layer. We provide silk scarves for the desert wind and helmets for those who prefer them." },
      { q: "Do I need experience to ride?", a: "No. Our Novice journeys are designed for first-time riders and matched with our gentlest horses. For Intermediate and Advanced rides, we ask for a brief honest note about your experience." },
      { q: "What is the youngest age you accept?", a: "Eight years for accompanied rides, twelve for solo. Younger riders are welcome to visit the courtyard and meet the horses." },
    ],
  },
  {
    eyebrow: "Section · 02",
    title: "On the day",
    items: [
      { q: "When should I arrive?", a: "Twenty minutes before your reserved hour. We use this time for tea, a brief introduction to your horse, and the fitting of your saddle." },
      { q: "Will I ride alone or in a group?", a: "By default, your party rides as a private group with one of our riders. We never combine reservations from different parties." },
      { q: "What if the weather turns?", a: "We move quietly. If conditions are unsafe, we reschedule at no charge — the desert keeps its own calendar, and we keep ours." },
      { q: "Are photographs included?", a: "Our resident photographer is available on request. A small selection of edited frames is delivered within a week." },
    ],
  },
  {
    eyebrow: "Section · 03",
    title: "Booking & policies",
    items: [
      { q: "How is payment handled?", a: "We hold the reservation with a deposit. Full payment is settled the morning of your ride, in cash, card, or wire." },
      { q: "What is your cancellation policy?", a: "Cancellations more than seventy-two hours in advance are fully refunded. Within seventy-two hours, the deposit is held as credit for a future date." },
      { q: "Can I bring guests who do not ride?", a: "Of course. They are welcome in the courtyard, with tea and shade. There is no charge for company." },
      { q: "Do you offer private events?", a: "Yes — engagements, anniversaries, and small films. The concierge will design the morning around you." },
    ],
  },
  {
    eyebrow: "Section · 04",
    title: "About our horses",
    items: [
      { q: "What breeds do you keep?", a: "Predominantly purebred Egyptian Arabians, with a small number of Anglo-Arabians for advanced riders. Each is bred and trained on the sands of Giza." },
      { q: "How are the horses cared for?", a: "Each horse rides no more than once per day, with two days of rest weekly. They live on the property, with a resident veterinarian on call." },
      { q: "Can I request a specific horse?", a: "Yes. Once you have ridden with us, we keep a record. Many of our guests return to the same horse for years." },
    ],
  },
];

const Row = ({ q, a, i }: QA & { i: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: easeLuxury, delay: i * 0.04 }}
      className="border-b hairline"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-8 py-7 text-left group"
      >
        <span className="font-display text-2xl md:text-3xl leading-tight text-balance group-hover:text-ink-soft transition-colors">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.5, ease: easeLuxury }}
          className="shrink-0 mt-3 text-2xl font-light leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: easeLuxury }}
            className="overflow-hidden"
          >
            <p className="pb-8 pr-12 max-w-2xl text-ink-soft leading-relaxed text-pretty">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  return (
    <div className="pt-32 pb-32">
      <section className="container">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">Frequently asked · No. 11</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.95] max-w-5xl text-balance">
            Quietly <em className="italic text-ink-soft">answered</em>.
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-xl text-ink-soft text-pretty leading-relaxed">
            Most of what guests ask, we have heard before. What follows is the short version —
            the long one is a conversation with the concierge.
          </p>
        </Reveal>
      </section>

      <div className="container mt-24 grid md:grid-cols-12 gap-12">
        {/* Sticky index */}
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-32 space-y-3">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-4">Index</p>
            {SECTIONS.map((s, i) => (
              <a
                key={s.title}
                href={`#section-${i}`}
                className="block text-[12px] tracking-[0.18em] uppercase text-ink-soft hover:text-foreground transition-colors"
              >
                {String(i + 1).padStart(2, "0")} · {s.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Sections */}
        <div className="md:col-span-9 space-y-24">
          {SECTIONS.map((s, si) => (
            <section key={s.title} id={`section-${si}`}>
              <Reveal>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">{s.eyebrow}</p>
                <h2 className="font-display text-4xl md:text-5xl leading-[1.05] mb-10">{s.title}</h2>
              </Reveal>
              <div className="border-t hairline">
                {s.items.map((qa, i) => (
                  <Row key={qa.q} {...qa} i={i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Concierge CTA */}
      <section className="container mt-32">
        <div className="bg-foreground text-background p-12 md:p-20 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-luxury uppercase opacity-80 mb-5">Still wondering</p>
            <h3 className="font-display text-3xl md:text-5xl leading-[1.05] text-balance">
              The concierge answers within the hour, in any language you write in.
            </h3>
          </div>
          <div className="md:col-span-5 md:text-right space-y-3">
            <Link
              to="/booking"
              className="inline-block text-[12px] tracking-[0.22em] uppercase border-b border-background/40 pb-1 hover:border-background transition-colors"
            >
              Reserve a morning →
            </Link>
            <p className="text-[11px] tracking-luxury uppercase opacity-70">
              concierge@pyrarides.eg
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
