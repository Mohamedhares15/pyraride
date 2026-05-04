import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

type Tier = {
  name: string;
  french: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Initié",
    french: "The Initiate",
    price: "$0",
    cadence: "complimentary",
    description: "An open invitation to the Plateau. Reserve any signature journey at standard rates.",
    features: [
      "Standard reservation access",
      "Concierge by message",
      "Letters & gallery access",
      "Newsletter from the stables",
    ],
  },
  {
    name: "Compagnon",
    french: "The Companion",
    price: "$240",
    cadence: "per year",
    description: "For those who return. Priority calendars, member rates, and a personal concierge by name.",
    features: [
      "10% on all journeys",
      "48h priority calendar",
      "Named concierge contact",
      "Complimentary tea ceremony",
      "Annual master rider session",
    ],
    featured: true,
  },
  {
    name: "Maître",
    french: "The Master",
    price: "$1,800",
    cadence: "per year",
    description: "By application. The Plateau, on your terms — single-party guarantees and bespoke itineraries.",
    features: [
      "20% on all journeys",
      "Single-party guarantee",
      "Private master rider",
      "Bespoke itinerary curation",
      "Astronomer & sommelier service",
      "Annual desert dinner, by invitation",
    ],
  },
];

export const SubscriptionTiers = () => (
  <section className="py-24 md:py-32 border-t hairline">
    <div className="container">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Membership</p>
        <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl text-balance">
          Three ways to belong to the Plateau.
        </h2>
        <p className="mt-6 text-base text-ink-soft max-w-xl">
          We keep our register small on purpose. Choose your cadence; we will keep your saddle waiting.
        </p>
      </Reveal>

      <StaggerGroup className="mt-16 grid lg:grid-cols-3 gap-px bg-hairline border hairline" gap={0.1}>
        {TIERS.map((t) => (
          <StaggerItem key={t.name}>
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ duration: 0.5, ease: easeLuxury }}
              className={cn(
                "relative p-10 h-full flex flex-col",
                t.featured ? "bg-foreground text-background" : "bg-background",
              )}
            >
              {t.featured && (
                <span className="absolute top-6 right-6 text-[10px] tracking-luxury uppercase">
                  Most chosen
                </span>
              )}

              <p className={cn("text-[10px] tracking-luxury uppercase", t.featured ? "text-background/70" : "text-ink-muted")}>
                {t.french}
              </p>
              <h3 className="font-display text-4xl mt-2 leading-none">{t.name}</h3>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-6xl leading-none">{t.price}</span>
                <span className={cn("text-[11px] tracking-luxury uppercase", t.featured ? "text-background/70" : "text-ink-muted")}>
                  {t.cadence}
                </span>
              </div>

              <p className={cn("mt-5 text-sm leading-relaxed text-pretty", t.featured ? "text-background/80" : "text-ink-soft")}>
                {t.description}
              </p>

              <ul className="mt-8 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={cn("size-3.5 mt-1 shrink-0", t.featured ? "text-background" : "text-foreground")} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className={cn(
                  "group mt-10 inline-flex items-center justify-center px-6 py-3.5 text-[11px] tracking-[0.18em] uppercase transition-colors",
                  t.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "border hairline hover:bg-foreground hover:text-background hover:border-foreground",
                )}
              >
                {t.name === "Maître" ? "Apply" : "Choose"} {t.name}
              </Link>
            </motion.article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  </section>
);
