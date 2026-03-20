import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import ComingSoon from "@/components/shared/ComingSoon";
import Link from "next/link";
import { Instagram, Clock, Users } from "lucide-react";
import { FAQPageSchema } from "@/components/seo/StructuredData";
import { prisma } from "@/lib/prisma";
import Image from "next/image";


// TikTok Icon SVG Component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const homepageFaq = [
  {
    question: "What is PyraRides?",
    answer:
      "PyraRides is Egypt's first online marketplace for booking horse riding at the Giza and Saqqara Pyramids. Compare multiple verified stables, read reviews, and book instantly at www.pyrarides.com."
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
      "Yes. Every PyraRides partner provides beginner-friendly horses, helmets, professional guides, and safety briefings. Most riders on PyraRides are first-timers."
  },
  {
    question: "Why use PyraRides instead of booking directly?",
    answer:
      "PyraRides lets you compare multiple stables, see verified reviews, pay securely, and get 24/7 support. All partners are pre-vetted for safety, horse welfare, and quality."
  }
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredPackages = await prisma.package.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  });

  return (
    <ComingSoon>
      <FAQPageSchema items={homepageFaq} />
      <Navbar />
      <Hero />
      
      {/* Featured Packages Section */}
      {featuredPackages.length > 0 && (
        <section className="relative z-20 w-full bg-[#0a0a0a] py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]">Experiences</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Curated luxury packages designed for unforgettable memories at the Great Pyramids.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-[#121212] rounded-2xl overflow-hidden border border-white/10 group hover:border-[#D4AF37]/50 transition-colors flex flex-col shadow-2xl relative">
                  {pkg.packageType === "GROUP_EVENT" && (
                    <div className="absolute top-4 left-4 z-20 bg-blue-600 border border-blue-400/30 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
                      Group Event
                    </div>
                  )}
                  {pkg.packageType === "PRIVATE" && (
                    <div className="absolute top-4 left-4 z-20 bg-purple-600 border border-purple-400/30 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
                      Private VIP
                    </div>
                  )}

                  <div className="relative h-64 w-full overflow-hidden">
                    <Image src={pkg.imageUrl || "/hero-bg.webp"} alt={pkg.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                  </div>
                  <div className="p-8 flex flex-col flex-1 relative -mt-6">
                    <h3 className="text-2xl font-bold text-white mb-3 font-display leading-tight">{pkg.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4 font-medium">
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-[#D4AF37]"/> {pkg.startTime ? `${pkg.startTime} • ` : ''}{pkg.duration} Hours</span>
                      <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-[#D4AF37]"/> 
                        {pkg.packageType === "GROUP_EVENT" ? `Max ${pkg.maxPeople}` : `Exactly ${pkg.maxPeople}`}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">{pkg.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                      <div className="flex flex-col">
                        {pkg.originalPrice && <del className="text-xs text-red-400/80 font-medium">EGP {pkg.originalPrice}</del>}
                        <span className="text-[#D4AF37] font-bold text-2xl tracking-tight">EGP {pkg.price}</span>
                      </div>
                      <Link href={`/packages`} className="text-white text-sm font-semibold hover:text-[#D4AF37] transition-colors flex items-center">
                        View Details <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-16 pb-4">
              <Link href="/packages" className="inline-block border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors duration-300 px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#D4AF37]/10 tracking-wide uppercase text-sm">
                Explore All Packages
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Luxury CTA Section instead of FAQ */}
      <section className="relative z-20 w-full overflow-hidden bg-gradient-to-b from-black/80 via-black/95 to-black py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-10 bg-white/40" />
            <span className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
              Begin Your Journey
            </span>
            <div className="h-px w-10 bg-white/40" />
          </div>

          <h2 className="mb-6 font-display text-4xl font-bold tracking-tight text-white drop-shadow-xl sm:text-5xl md:text-6xl">
            Where Legends Are <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
              Ridden, Not Told.
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-base text-white/70 drop-shadow md:text-xl">
            Egypt’s highest-rated Arabian horses await. Compare trusted stables, browse premium experiences, and witness the Giza Plateau like pharaohs once did.
          </p>

          <Link
            href="/stables"
            className="group relative flex items-center justify-center overflow-hidden rounded-full bg-white px-10 py-5 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <span className="relative border-b border-transparent transition-colors group-hover:border-black/50">
              Explore Our Stables
            </span>
            <svg
              className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Social Icons */}
          <div className="mt-16 flex items-center justify-center gap-8">
            <Link
              href="https://instagram.com/pyrarides"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors hover:scale-110 duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-7 w-7" />
            </Link>
            <Link
              href="https://tiktok.com/@pyrarides"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors hover:scale-110 duration-300"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-7 w-7" />
            </Link>
          </div>
        </div>
      </section>
    </ComingSoon>
  );
}
