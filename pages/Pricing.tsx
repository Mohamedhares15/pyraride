import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/Motion";
import { Link } from "@/components/shared/shims";
import { ArrowUpRight } from "lucide-react";

const tiers = [
  { eyebrow: "Hour in the saddle", name: "From $85", note: "Per rider, single hour at the plateau. Includes horse, master rider, and water." },
  { eyebrow: "Half-day journey", name: "From $240", note: "Three to four hours. Tea service at the dunes, photographer on request." },
  { eyebrow: "Signature day", name: "From $640", note: "Full-day curated package. Lunch under linen, transport, all gratuities." },
];

const lines = [
  ["Booking fee", "Included. We never charge a service surcharge."],
  ["Cancellation", "Full refund up to 48 hours before. 50% within 24 hours."],
  ["Tipping", "Always optional. Already accounted for in signature packages."],
  ["Insurance", "Each ride is covered by our partner equestrian policy."],
  ["Children", "From age 8, accompanied. Pony introductions for younger guests by request."],
];

const Pricing = () => (
  <div className="min-h-screen pt-28">
    <section className="container py-16 md:py-24 border-b hairline">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">How fees are kept</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">
          Plain prices. Nothing hidden in the linen.
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
          Three tiers. One promise: the figure you see is the figure you pay. Stable and rider keep the larger share — the house takes a small commission to maintain the standard.
        </p>
      </Reveal>
    </section>

    <section className="container py-20 md:py-28">
      <StaggerGroup className="grid md:grid-cols-3 gap-px bg-hairline border hairline">
        {(tiers || []).map((t) => (
          <StaggerItem key={t.eyebrow}>
            <div className="bg-background p-10 md:p-12 h-full">
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{t.eyebrow}</p>
              <h3 className="mt-6 font-display text-4xl md:text-5xl">{t.name}</h3>
              <p className="mt-6 text-sm text-ink-soft text-pretty">{t.note}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>

    <section className="container pb-28">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-8">House terms</p>
      </Reveal>
      <div className="border-t hairline">
        {(lines || []).map(([label, copy]) => (
          <Reveal key={label}>
            <div className="grid md:grid-cols-12 gap-6 py-7 border-b hairline">
              <p className="md:col-span-4 font-display text-2xl">{label}</p>
              <p className="md:col-span-8 text-ink-soft text-pretty">{copy}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16">
        <Link to="/booking" className="inline-flex items-center gap-3 px-7 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase group">
          Begin a reservation <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>
    </section>
  </div>
);

export default Pricing;
