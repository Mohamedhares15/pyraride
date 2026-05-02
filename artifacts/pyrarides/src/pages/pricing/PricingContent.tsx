import { Link } from "wouter";
import { Reveal } from "@/components/shared/Motion";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center py-24">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Transparent Pricing</p>
          <h1 className="font-display text-5xl md:text-6xl mb-6 leading-[0.95]">
            Pricing —<br />Coming Soon
          </h1>
          <div className="w-10 h-px bg-foreground/30 mx-auto mb-8" />
          <p className="text-ink-soft text-base leading-relaxed mb-12 max-w-md mx-auto">
            We're building a transparent pricing system that gives you complete clarity before you book. No surprises — just the perfect ride.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/stables"
              className="inline-block border hairline text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 px-10 py-4 text-xs uppercase tracking-[0.2em]"
            >
              Browse Stables
            </Link>
            <Link
              href="/"
              className="inline-block border border-foreground/15 text-ink-muted hover:text-foreground hover:border-foreground/30 transition-colors duration-300 px-10 py-4 text-xs uppercase tracking-[0.2em]"
            >
              Back to Home
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
