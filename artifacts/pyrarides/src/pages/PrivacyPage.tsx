import { motion } from "framer-motion";
import { Reveal } from "@/components/shared/Motion";
import heroImg from "@/assets/hero-pyramids.jpg";

const sections = [
  {
    number: "01",
    title: "Information We Collect",
    body: `We collect information you provide directly when you create an account, make a booking, or contact us — including your full name, email address, phone number, and payment details. We also collect usage data such as pages visited, ride preferences, and search history to personalise your experience on PyraRides.`,
  },
  {
    number: "02",
    title: "How We Use Your Information",
    body: `Your information is used to process and confirm bookings, send ride confirmations and reminders, operate our Circle Loyalty programme, provide multilingual concierge support, and improve the platform. We will never sell your data to third parties. You will only receive marketing communications if you have opted in.`,
  },
  {
    number: "03",
    title: "Data Storage & Security",
    body: `All personal data is stored securely in encrypted databases hosted within the European Union. We implement industry-standard measures including TLS in transit, AES-256 at rest, and regular penetration testing. Our team members access your data on a strict need-to-know basis.`,
  },
  {
    number: "04",
    title: "Cookies & Analytics",
    body: `PyraRides uses essential cookies for authentication and session management, and optional analytics cookies to understand how riders use our platform. You may decline non-essential cookies at any time via our cookie preference centre. We do not use third-party advertising trackers.`,
  },
  {
    number: "05",
    title: "Sharing With Stables",
    body: `When you complete a booking, we share your name and contact details with the relevant stable for operational purposes — so they can prepare your horse, confirm your arrival time, and reach you if needed. We contractually require all partner stables to handle your data in compliance with this policy.`,
  },
  {
    number: "06",
    title: "Your Rights",
    body: `You have the right to access, correct, or delete your personal data at any time. You may also request data portability or object to certain processing. To exercise any of these rights, contact us at privacy@pyrarides.com. We respond to all verified requests within 48 hours.`,
  },
  {
    number: "07",
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will notify you by email and update the effective date below. Continued use of PyraRides after changes constitutes your acceptance of the revised policy.`,
  },
];

export default function PrivacyPage() {
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
            Privacy<br />Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-background/60 text-sm"
          >
            Effective: 1 May 2025 · Governing law: Egyptian law
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="container py-20 grid md:grid-cols-12 gap-10">
        <Reveal className="md:col-span-5">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">Our commitment</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.1]">Your privacy is our responsibility.</h2>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7 self-end" delay={0.15}>
          <p className="text-ink-soft leading-relaxed text-pretty">
            At PyraRides, privacy is not a legal formality — it is a promise we make to every rider who trusts us with their details. This policy explains, in plain language, exactly what data we collect, why we need it, and how you stay in control.
          </p>
          <p className="mt-4 text-ink-muted text-sm">Questions? Write to us at{" "}
            <a href="mailto:privacy@pyrarides.com" className="text-foreground underline underline-offset-4">privacy@pyrarides.com</a>
          </p>
        </Reveal>
      </section>

      {/* Sections */}
      <section className="container pb-32">
        <div className="border-t hairline">
          {sections.map((s, i) => (
            <Reveal key={s.number} delay={i * 0.05}>
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
            <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-3">Data requests</p>
            <h3 className="font-display text-3xl md:text-4xl">Exercise your rights at any time.</h3>
          </div>
          <div className="md:col-span-4 md:text-right">
            <a
              href="mailto:privacy@pyrarides.com"
              className="inline-flex items-center gap-2 px-6 py-3 border border-background/30 text-background text-[11px] tracking-luxury uppercase hover:bg-background hover:text-foreground transition-colors"
            >
              privacy@pyrarides.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
