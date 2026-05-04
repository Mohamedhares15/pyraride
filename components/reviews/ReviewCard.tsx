"use client";
import { motion } from "framer-motion";
import { Stars } from "./Stars";
import { easeLuxury } from "@/components/shared/Motion";

export type Review = {
  id: string;
  author: string;
  location: string;
  date: string;
  rating: number;
  title: string;
  body: string;
  packageName?: string;
  verified?: boolean;
};

export const ReviewCard = ({ review }: { review: Review }) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.7, ease: easeLuxury }}
    className="border hairline bg-surface-elevated/40 p-8 flex flex-col gap-5"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{review.date}</p>
        <h3 className="font-display text-2xl mt-1 leading-tight">{review.title}</h3>
      </div>
      <Stars value={review.rating} size="sm" />
    </div>
    <p className="text-sm text-ink-soft leading-relaxed text-pretty">"{review.body}"</p>
    <div className="mt-auto pt-4 border-t hairline flex items-end justify-between gap-3">
      <div>
        <p className="font-display text-lg leading-none">{review.author}</p>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mt-1">{review.location}</p>
      </div>
      {review.verified && (
        <span className="text-[10px] tracking-luxury uppercase text-foreground inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground" /> Verified guest
        </span>
      )}
    </div>
  </motion.article>
);
