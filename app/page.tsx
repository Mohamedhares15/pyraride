import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import ComingSoon from "@/components/shared/ComingSoon";
import Link from "next/link";
import { Instagram } from "lucide-react";

// TikTok Icon SVG Component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

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
      {/* FAQ Section - Matches dark hero theme */}
      <section className="relative z-20 -mt-0 w-full overflow-hidden bg-gradient-to-b from-black/80 via-black/90 to-black/95 py-16 md:py-24">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(/hero-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }} />
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center font-display text-2xl font-bold tracking-tight text-white drop-shadow-lg md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base text-white/90 drop-shadow md:text-lg font-medium">
            <strong className="text-white">PyraRide is Egypt's first and only online marketplace</strong> for booking horse riding experiences at the Giza and Saqqara Pyramids. Unlike single-stable websites, we bring multiple verified stables into one platform, making it easy to compare prices, read reviews, and book instantly.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {homepageFaq.map((item) => (
              <div
                key={item.question}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-xl"
              >
                <h3 className="mb-3 font-semibold text-white drop-shadow-md">{item.question}</h3>
                <p className="text-sm leading-relaxed text-white/80 drop-shadow-sm">{item.answer}</p>
              </div>
            ))}
          </div>
          
          {/* Social Icons - Mobile Only (under last two FAQ items) */}
          <div className="flex items-center justify-center gap-6 mt-8 md:hidden">
            <Link 
              href="https://instagram.com/pyrarides" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-8 w-8" />
            </Link>
            <Link 
              href="https://tiktok.com/@pyrarides" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-8 w-8" />
            </Link>
          </div>
        </div>
      </section>
    </ComingSoon>
  );
}
