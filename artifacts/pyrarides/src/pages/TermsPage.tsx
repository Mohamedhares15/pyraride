import { motion } from "framer-motion";
import { Reveal } from "@/components/shared/Motion";
import heroImg from "@/assets/hero-pyramids.jpg";

const sections = [
  {
    number: "01",
    title: "Acceptance of Terms",
    body: `By accessing or using PyraRides — whether through our website, mobile application, or any associated service — you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform. These terms constitute a legally binding agreement pursuant to Egyptian Electronic Signature Law No. 15 of 2004.`,
  },
  {
    number: "02",
    title: "The PyraRides Platform",
    body: `PyraRides operates as a curated marketplace connecting riders with verified equestrian stables across the Giza Plateau and greater Egypt. We facilitate discovery, booking, and payment — but we do not own or operate the stables, horses, or guides. Each stable is independently owned and vetted through our certification process.`,
  },
  {
    number: "03",
    title: "Booking & Reservations",
    body: `All bookings are subject to stable availability and explicit confirmation. A booking is only confirmed upon receipt of your confirmation email and payment receipt. PyraRides reserves the right to cancel bookings in exceptional circumstances (force majeure, safety concerns, etc.), in which case a full refund will be issued.`,
  },
  {
    number: "04",
    title: "Cancellation & Refund Policy",
    body: `Cancellations made 48 hours or more before your scheduled ride: full refund. Cancellations made 24–48 hours before: 50% refund. Cancellations made less than 24 hours before: no refund. All cancellations must be made through the PyraRides platform. Modification requests made 48+ hours in advance are free of charge; modifications closer to ride time are subject to stable availability.`,
  },
  {
    number: "05",
    title: "Safety & Liability",
    body: `All riders must follow the safety instructions provided by stable staff and PyraRides guides. Helmets and safety equipment are mandatory and provided at no extra charge. PyraRides and its partner stables are not liable for injuries resulting from a rider's failure to follow safety guidelines. Riders with medical conditions that may be affected by horse riding are advised to consult a physician before booking.`,
  },
  {
    number: "06",
    title: "Payments & Pricing",
    body: `All prices are displayed and charged in Egyptian Pounds (EGP) unless otherwise specified. Payments are processed securely through our certified payment partners. PyraRides does not store card details on its servers. Service fees, where applicable, are displayed clearly before checkout and are non-refundable.`,
  },
  {
    number: "07",
    title: "Circle Loyalty Programme",
    body: `The Circle Loyalty Programme is offered at PyraRides' sole discretion and may be modified or discontinued at any time with reasonable notice. Points have no cash value and cannot be transferred. Tier status is reviewed quarterly based on activity. Abuse of the programme (e.g., fraudulent bookings to earn points) will result in immediate disqualification and account suspension.`,
  },
  {
    number: "08",
    title: "Intellectual Property",
    body: `All content on PyraRides — including text, images, logos, videos, and software — is the property of PyraRides Egypt LLC or its licensors. You may not reproduce, distribute, or create derivative works without our express written consent. Riders may share review content on social media provided they credit PyraRides.`,
  },
  {
    number: "09",
    title: "Governing Law & Disputes",
    body: `These Terms are governed by the laws of the Arab Republic of Egypt. Any dispute arising from the use of PyraRides shall be subject to the exclusive jurisdiction of the competent courts of Cairo, Egypt. We encourage users to first contact our support team at legal@pyrarides.com before pursuing formal legal action.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <img src={heroImg} alt="Pyramids" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        <div className="relative h-full container flex flex-col justify-end pb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-luxury uppercase text-background/70 mb-4"
          >
            PyraRides · Legal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-background leading-[0.95]"
          >
            Terms &amp;<br />Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-background/60 text-sm"
          >
            Effective: 1 May 2025 · Egyptian law · Last reviewed: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </motion.p>
        </div>
      </section>

      {/* Notice banner — luxury style */}
      <section className="border-b hairline bg-surface">
        <div className="container py-5">
          <p className="text-ink-soft text-sm">
            <span className="font-semibold text-foreground">Legal notice:</span>{" "}
            This agreement is legally binding pursuant to Egyptian Electronic Signature Law No. 15 of 2004.
            For questions, contact{" "}
            <a href="mailto:legal@pyrarides.com" className="text-foreground underline underline-offset-4">legal@pyrarides.com</a>.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="container py-20 grid md:grid-cols-12 gap-10">
        <Reveal className="md:col-span-5">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">Our agreement</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.1]">Clear terms for a curated experience.</h2>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7 self-end" delay={0.15}>
          <p className="text-ink-soft leading-relaxed text-pretty">
            We've written these terms to be as clear and concise as possible. Below you'll find everything that governs the relationship between you and PyraRides — covering bookings, payments, safety, and your rights as a rider.
          </p>
        </Reveal>
      </section>

      {/* Sections */}
      <section className="container pb-32">
        <div className="border-t hairline">
          {sections.map((s, i) => (
            <Reveal key={s.number} delay={i * 0.04}>
              <div className="grid md:grid-cols-12 gap-8 py-10 border-b hairline">
                <div className="md:col-span-1">
                  <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{s.number}</p>
                </div>
                <div className="md:col-span-4">
                  <h3 className="font-display text-2xl md:text-3xl">{s.title}</h3>
                </div>
                <div className="md:col-span-6 md:col-start-7">
                  <p className="text-ink-soft leading-relaxed text-pretty">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact strip */}
      <section className="bg-foreground text-background">
        <div className="container py-16 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-3">Legal enquiries</p>
            <h3 className="font-display text-3xl md:text-4xl">Questions about these terms?</h3>
          </div>
          <div className="md:col-span-4 md:text-right">
            <a
              href="mailto:legal@pyrarides.com"
              className="inline-flex items-center gap-2 px-6 py-3 border border-background/30 text-background text-[11px] tracking-luxury uppercase hover:bg-background hover:text-foreground transition-colors"
            >
              legal@pyrarides.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
