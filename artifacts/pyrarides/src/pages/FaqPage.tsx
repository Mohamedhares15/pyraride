import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus } from "lucide-react";
import { Reveal } from "@/components/shared/Motion";
import heroImg from "@/assets/hero-pyramids.jpg";
import { Link } from "wouter";

const faqData = [
  {
    category: "Booking",
    items: [
      {
        question: "How do I book a horse riding experience?",
        answer: "Browse our verified stables, compare packages and reviews, select your preferred option, choose a date and party size, then confirm. You receive instant email confirmation. The entire process takes under 5 minutes."
      },
      {
        question: "How far in advance should I book?",
        answer: "We recommend booking at least 48 hours in advance — especially during peak season (October–April). For sunrise rides, private sessions, or specific horses, 3–7 days ahead is ideal. Last-minute availability is occasionally available via our concierge."
      },
      {
        question: "Can I modify or cancel my booking?",
        answer: "48+ hours before your ride: 100% refund. 24–48 hours before: 50% refund. Less than 24 hours: no refund. Modifications are free if made 48+ hours in advance. All changes must be made through the PyraRides platform."
      },
      {
        question: "Can I book for a group?",
        answer: "Yes — most packages accommodate 1–12 guests. For larger groups (weddings, corporate events, film productions), contact our concierge team at support@pyrarides.com for a bespoke arrangement."
      },
    ]
  },
  {
    category: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Visa, Mastercard, and major debit cards. Local Egyptian payment options are being added. All payments are processed securely via our certified payment partners — PyraRides never stores your card details."
      },
      {
        question: "Are prices shown in EGP?",
        answer: "Yes. All prices are in Egyptian Pounds (EGP) unless otherwise specified. There are no hidden fees — the price shown at checkout is the final price you pay."
      },
      {
        question: "When am I charged?",
        answer: "You are charged at the time of booking confirmation. In the event of a cancelled session by the stable or a force-majeure cancellation by PyraRides, a full refund is issued within 5 business days."
      },
    ]
  },
  {
    category: "Safety",
    items: [
      {
        question: "Is horse riding safe for complete beginners?",
        answer: "Absolutely. All PyraRides partner stables provide certified safety helmets, well-trained gentle horses matched to your experience level, a mandatory safety briefing before each ride, and a qualified guide throughout your journey."
      },
      {
        question: "Are there age or weight restrictions?",
        answer: "Children aged 6 and above are welcome, accompanied by a guardian. Riders aged 13–17 require signed parental consent. There is no upper age limit for adults who are physically fit. Weight limits (typically 110 kg / 240 lbs) may apply per stable — displayed on the booking page."
      },
      {
        question: "What should I wear?",
        answer: "Closed-toe shoes or boots are required. Long trousers are strongly recommended to prevent saddle chafing. Helmets are provided free of charge. For sunrise or early rides, bring a light jacket — the desert can be cool before 8 AM."
      },
    ]
  },
  {
    category: "Logistics",
    items: [
      {
        question: "Where are the stables located?",
        answer: "Our stables are concentrated in two areas: the Giza Plateau (a short walk from the Great Pyramid and the Sphinx) and the Saqqara Desert (near the Step Pyramid complex, approximately 30 km south of Cairo). Exact locations with maps are shown on each stable's page."
      },
      {
        question: "Is transport from Cairo or Giza hotels available?",
        answer: "Yes. Many of our packages include hotel pickup from central Cairo and Giza. Alternatively, our concierge team can arrange private transfers. Contact us at support@pyrarides.com with your hotel name and preferred pick-up time."
      },
      {
        question: "What time should I arrive?",
        answer: "Please arrive 15–20 minutes before your scheduled ride for check-in, helmet fitting, and safety briefing. Late arrivals may result in a shortened ride, as stables operate on strict schedules to manage horse welfare."
      },
    ]
  },
  {
    category: "Circle Loyalty",
    items: [
      {
        question: "How does the Circle Loyalty programme work?",
        answer: "Every EGP 100 spent earns you points. Progress through four tiers: Bronze (0–500 pts), Silver (500–1,500 pts), Gold (1,500–3,500 pts), and Platinum (3,500+ pts). Higher tiers unlock priority booking, exclusive packages, and complimentary upgrades."
      },
      {
        question: "Do points expire?",
        answer: "Points are valid for 24 months from the date they were earned. Your tier status is reviewed quarterly. If activity drops below a tier threshold for two consecutive quarters, your tier may be adjusted. You'll receive a notice before any change takes effect."
      },
    ]
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          (!query || item.question.toLowerCase().includes(query.toLowerCase()) || item.answer.toLowerCase().includes(query.toLowerCase())) &&
          (!activeCategory || cat.category === activeCategory)
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img src={heroImg} alt="Pyramids at dusk" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        <div className="relative h-full container flex flex-col justify-end pb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-luxury uppercase text-background/70 mb-4"
          >
            PyraRides · Help
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-background leading-[0.95]"
          >
            Frequently<br />asked
          </motion.h1>
        </div>
      </section>

      {/* Search + filters */}
      <section className="container py-12">
        <Reveal>
          <div className="relative mb-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-12 pr-4 py-4 bg-transparent border hairline text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 text-[11px] tracking-luxury uppercase border transition-colors ${!activeCategory ? "bg-foreground text-background border-foreground" : "border-hairline text-ink-muted hover:border-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {faqData.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory((p) => p === cat.category ? null : cat.category)}
                className={`px-4 py-1.5 text-[11px] tracking-luxury uppercase border transition-colors ${activeCategory === cat.category ? "bg-foreground text-background border-foreground" : "border-hairline text-ink-muted hover:border-foreground hover:text-foreground"}`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FAQ list */}
      <section className="container pb-32 max-w-4xl">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-ink-muted">
            <p className="font-display text-3xl mb-3">No results found.</p>
            <p className="text-sm">Try a different search or browse all categories above.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <Reveal>
                  <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6 border-t hairline pt-8">{cat.category}</p>
                </Reveal>
                <div className="space-y-0">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.category}-${idx}`;
                    const isOpen = open === key;
                    return (
                      <Reveal key={key} delay={idx * 0.04}>
                        <div className="border-b hairline">
                          <button
                            onClick={() => toggle(key)}
                            className="w-full flex items-start justify-between gap-6 py-6 text-left group"
                          >
                            <span className="font-display text-xl md:text-2xl leading-snug group-hover:opacity-70 transition-opacity">
                              {item.question}
                            </span>
                            <span className="flex-shrink-0 mt-1">
                              {isOpen ? <Minus className="size-4 text-ink-muted" /> : <Plus className="size-4 text-ink-muted" />}
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key="answer"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <p className="pb-6 text-ink-soft leading-relaxed text-pretty pr-10">{item.answer}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Still need help */}
      <section className="bg-foreground text-background">
        <div className="container py-16 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-3">Still need help?</p>
            <h3 className="font-display text-3xl md:text-4xl">Our concierge team is always available.</h3>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-background/30 text-background text-[11px] tracking-luxury uppercase hover:bg-background hover:text-foreground transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
