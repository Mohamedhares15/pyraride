import { Reveal } from "@/components/shared/Motion";

type Section = { heading: string; body: string };

export const LegalPage = ({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Section[] }) => (
  <div className="min-h-screen pt-28">
    <section className="container py-16 md:py-24 border-b hairline">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">{eyebrow}</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">{title}</h1>
        <p className="mt-6 max-w-2xl text-base text-ink-soft text-pretty">{intro}</p>
      </Reveal>
    </section>
    <section className="container py-20 md:py-28 grid md:grid-cols-12 gap-12">
      <aside className="md:col-span-3">
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Contents</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          {(sections || []).map((s, i) => (
            <li key={s.heading}>
              <a href={`#s-${i}`} className="hover:text-foreground transition-colors">
                {String(i + 1).padStart(2, "0")} · {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      <div className="md:col-span-9 space-y-14">
        {(sections || []).map((s, i) => (
          <Reveal key={s.heading}>
            <article id={`s-${i}`} className="border-t hairline pt-8">
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">{s.heading}</h2>
              <p className="mt-5 text-ink-soft text-pretty leading-relaxed whitespace-pre-line">{s.body}</p>
            </article>
          </Reveal>
        ))}
        <p className="text-xs tracking-[0.14em] uppercase text-ink-muted pt-10 border-t hairline">
          Last revised — Spring 2026
        </p>
      </div>
    </section>
  </div>
);

export const Privacy = () => (
  <LegalPage
    eyebrow="House policy"
    title="On the privacy of our riders."
    intro="We hold the names, dates, and notes of our guests in confidence. This page describes what we keep, why we keep it, and how it may be removed."
    sections={[
      { heading: "What we collect", body: "Name, contact, booking dates, riding history, and any notes you share with the concierge. Payment details are held by our processor and never reach our records." },
      { heading: "Why we keep it", body: "To prepare your horse, your hour, and your hospitality. To remember your preferences when you return. To respond to questions about a journey already past." },
      { heading: "Who may see it", body: "The stable hosting your ride, the captain leading the journey, and the concierge desk. No third party for marketing, ever." },
      { heading: "Cookies and analytics", body: "A small, anonymous measure of pages visited. No advertising trackers. No selling of behaviour." },
      { heading: "Removal", body: "Write to concierge@pyrarides.com and your record will be erased within seven days, save what is required by Egyptian tourism law." },
    ]}
  />
);

export const Terms = () => (
  <LegalPage
    eyebrow="House terms"
    title="The conditions of riding with us."
    intro="A short agreement, written plainly. By reserving a journey you accept the following."
    sections={[
      { heading: "The reservation", body: "A booking is confirmed once payment clears and the stable acknowledges the date. The named rider may not be substituted without notice." },
      { heading: "Conduct in the saddle", body: "Helmets are provided and required for guests under 18. Captains may decline to ride if a guest is intoxicated or behaves in a manner that endangers the horse." },
      { heading: "Photography", body: "You may photograph your own ride freely. Commercial filming requires written permission from the house." },
      { heading: "Liability", body: "Riding carries inherent risk. Each guest signs an acknowledgement at the stable. Our partner insurance covers medical incidents on the plateau." },
      { heading: "Force of nature", body: "If sandstorm, heat, or government decree closes the plateau, the ride is rescheduled or refunded in full at your election." },
      { heading: "Jurisdiction", body: "These terms are governed by the laws of the Arab Republic of Egypt. Disputes resolved in the courts of Cairo." },
    ]}
  />
);

export const RefundPolicy = () => (
  <LegalPage
    eyebrow="On refunds"
    title="When the journey cannot be kept."
    intro="Plans change. Weather changes. Our refund policy is written to be fair to both the rider and the stable that has held a horse and an hour for you."
    sections={[
      { heading: "More than 48 hours before", body: "Full refund. The stable releases the slot and the horse returns to the rotation." },
      { heading: "Within 48 to 24 hours", body: "75% refund. The stable retains a quarter for time already given to your preparation." },
      { heading: "Within 24 hours", body: "50% refund. Captains and grooms have already been scheduled for your hour." },
      { heading: "No-show", body: "No refund. The horse waited, the captain waited. We invite you to rebook at a 25% credit." },
      { heading: "House cancellation", body: "If we cancel — for weather, closure, or any reason of our own — you receive a full refund and a complimentary half-day on your next visit." },
      { heading: "How to request", body: "Reply to your booking confirmation, or write to concierge@pyrarides.com. Refunds clear within five business days to the original payment method." },
    ]}
  />
);

export default RefundPolicy;
