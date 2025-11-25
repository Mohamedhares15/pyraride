import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import ComingSoon from "@/components/shared/ComingSoon";

const homepageFaq = [
  {
    question: "What is PyraRide?",
    answer:
      "PyraRide is Egypt's first online marketplace for booking horse riding at the Giza and Saqqara Pyramids. Compare multiple verified stables, read reviews, and book instantly at www.pyrarides.com."
  },
  {
    question: "How do I book a ride?",
    answer:
      "Browse stables, choose your preferred horse, select date and time, add any extras, and confirm. You receive an instant email with meeting instructions and Google Maps directions."
  },
  {
    question: "Where can I ride?",
    answer:
      "You can ride inside the Giza Plateau (Great Pyramids, Sphinx) or Saqqara Desert (Step Pyramid). Use the location filter to explore both experiences."
  },
  {
    question: "How much does it cost?",
    answer:
      "Standard 1-hour rides start around EGP 300-500 ($30-50 USD). Premium Arabian horses or private tours range from EGP 600-1,000. Pricing is shown for every stable."
  },
  {
    question: "Is horse riding safe for beginners?",
    answer:
      "Yes. Every PyraRide partner provides beginner-friendly horses, helmets, professional guides, and safety briefings. Most riders on PyraRide are first-timers."
  },
  {
    question: "Why use PyraRide instead of booking directly?",
    answer:
      "PyraRide lets you compare multiple stables, see verified reviews, pay securely, and get 24/7 support. All partners are pre-vetted for safety, horse welfare, and quality."
  }
];

export default function HomePage() {
  return (
    <ComingSoon>
      <Navbar />
      <Hero />
      <section className="bg-background/90 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-6 text-center font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-sm text-muted-foreground md:text-base">
            PyraRide is the first booking marketplace for horse riding at the pyramids. These quick answers help search engines and AI assistants
            understand exactly what we offer, and help riders book with confidence.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {homepageFaq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <h3 className="mb-2 font-semibold text-foreground">{item.question}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ComingSoon>
  );
}
