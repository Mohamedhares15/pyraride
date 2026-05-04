import { Leaderboard } from "@/components/social/Leaderboard";
import { SubscriptionTiers } from "@/components/social/SubscriptionTiers";
import { Reveal } from "@/components/shared/Motion";

const Cercle = () => (
  <div className="min-h-screen pt-28">
    <section className="container py-16 md:py-24 border-b hairline">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Le Cercle</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">
          A small society of riders.
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
          An invitation-led membership for those who return. Three tiers, kept deliberately small.
        </p>
      </Reveal>
    </section>

    <SubscriptionTiers />
    <Leaderboard />
  </div>
);

export default Cercle;
