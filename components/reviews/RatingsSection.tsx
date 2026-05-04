"use client";
import { motion } from "framer-motion";
import { Stars } from "./Stars";
import { ReviewCard, type Review } from "./ReviewCard";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";

export const SAMPLE_REVIEWS: Review[] = [
  { id: "r1", author: "Élodie Devereux", location: "Paris, France", date: "March 2026", rating: 5, title: "An hour outside of time", body: "Sirocco moved like silk under me as the sun broke over Khufu. The tea ceremony afterward — quiet, perfect. We have ridden in Marrakech, Mongolia, Patagonia. Nothing approaches this.", packageName: "Sunrise Procession", verified: true },
  { id: "r2", author: "Kenji Hayashi", location: "Kyoto, Japan", date: "February 2026", rating: 5, title: "The desert listens", body: "We were the only party that evening. The astronomer pointed out Sirius rising. The horses, the silence, the stars — it felt curated yet entirely unhurried.", packageName: "Pharaoh's Banquet", verified: true },
  { id: "r3", author: "Amara Okonkwo", location: "Lagos, Nigeria", date: "January 2026", rating: 4, title: "Worth the early call", body: "Master rider Hassan was exceptional — patient, generous, never performative. The ride itself was transcendent. Only note: I'd have welcomed a longer pause at the plateau.", verified: true },
];

export const RatingsSection = ({
  reviews = SAMPLE_REVIEWS,
  onWrite,
}: {
  reviews?: Review[];
  onWrite?: () => void;
}) => {
  const avg = reviews.reduce((a, b) => a + b.rating, 0) / Math.max(reviews.length, 1);
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const max = Math.max(...(dist || []).map((d) => d.count), 1);

  return (
    <section className="py-24 md:py-32 border-t hairline">
      <div className="container">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Guest letters</p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-2xl text-balance">
            What our riders write home.
          </h2>
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-12 gap-12">
          {/* Summary */}
          <Reveal delay={0.1} className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <div className="border hairline bg-surface-elevated/40 p-8">
              <p className="font-display text-7xl leading-none">{avg.toFixed(1)}</p>
              <div className="mt-3"><Stars value={avg} size="md" /></div>
              <p className="mt-2 text-xs text-ink-muted">{reviews.length} verified letters</p>

              <ul className="mt-8 space-y-3">
                {(dist || []).map((d) => (
                  <li key={d.star} className="flex items-center gap-3 text-xs">
                    <span className="w-3 tabular-nums text-ink-muted">{d.star}</span>
                    <div className="flex-1 h-px bg-hairline relative overflow-hidden">
                      <motion.span
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: d.count / max }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: easeLuxury }}
                        style={{ transformOrigin: "left" }}
                        className="absolute inset-0 bg-foreground"
                      />
                    </div>
                    <span className="w-6 text-right tabular-nums text-ink-muted">{d.count}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onWrite}
                className="mt-8 w-full inline-flex justify-center items-center px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase"
              >
                Write a letter
              </button>
            </div>
          </Reveal>

          {/* Letters */}
          <StaggerGroup className="lg:col-span-8 grid sm:grid-cols-2 gap-6" gap={0.08}>
            {(reviews || []).map((r) => (
              <StaggerItem key={r.id}>
                <ReviewCard review={r} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
};
