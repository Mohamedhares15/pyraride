"use client";
import { useState } from "react";
import { RatingsSection } from "@/components/reviews/RatingsSection";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { Reveal } from "@/components/shared/Motion";

const Reviews = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen pt-28">
      <section className="container py-16 md:py-24 border-b hairline">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Letters from the Plateau</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">
            What guests have written, in their own hand.
          </h1>
          <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
            We do not collect testimonials. We receive letters. Each one a private record of an hour at Giza.
          </p>
        </Reveal>
      </section>

      <RatingsSection onWrite={() => setOpen(true)} />
      <ReviewModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Reviews;
