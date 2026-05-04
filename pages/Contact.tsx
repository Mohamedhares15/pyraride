"use client";
import { useState } from "react";
import { Reveal } from "@/components/shared/Motion";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Your note has reached the concierge. We will reply within the day.");
  };

  return (
    <div className="min-h-screen pt-28">
      <section className="container py-16 md:py-24 border-b hairline">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Concierge</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">
            Write to us. We answer by hand.
          </h1>
          <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
            For private journeys, custom itineraries, or a quiet question — leave a note. A member of the house will reply.
          </p>
        </Reveal>
      </section>

      <section className="container py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-5 space-y-10">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">By post</p>
            <p className="font-display text-2xl leading-tight">PyraRides Concierge<br />Nazlet El-Semman, Giza Plateau<br />Egypt</p>
          </div>
          <div className="space-y-4 text-sm">
            <p className="inline-flex items-center gap-3 text-ink-soft"><Mail className="size-4" /> concierge@pyrarides.com</p>
            <p className="inline-flex items-center gap-3 text-ink-soft"><Phone className="size-4" /> +20 2 3377 0000</p>
            <p className="inline-flex items-center gap-3 text-ink-soft"><MapPin className="size-4" /> By appointment, daily 06:00 — 19:00</p>
          </div>
        </Reveal>

        <Reveal className="md:col-span-7" delay={0.1}>
          <form onSubmit={onSubmit} className="space-y-6 border hairline p-8 md:p-10 bg-surface">
            <div className="grid md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Name</span>
                <input required name="name" className="mt-2 w-full bg-transparent border-b hairline focus:border-foreground outline-none py-2" />
              </label>
              <label className="block">
                <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Email</span>
                <input required type="email" name="email" className="mt-2 w-full bg-transparent border-b hairline focus:border-foreground outline-none py-2" />
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Subject</span>
              <input name="subject" className="mt-2 w-full bg-transparent border-b hairline focus:border-foreground outline-none py-2" />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Your note</span>
              <textarea required name="message" rows={6} className="mt-2 w-full bg-transparent border hairline focus:border-foreground outline-none p-3" />
            </label>
            <button disabled={submitting} className="px-7 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase disabled:opacity-60">
              {submitting ? "Sending…" : "Send to concierge"}
            </button>
          </form>
        </Reveal>
      </section>
    </div>
  );
};

export default Contact;
