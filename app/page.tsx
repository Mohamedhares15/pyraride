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
        <section className="relative z-20 w-full bg-[#050505] py-32 selection:bg-[#D4AF37]/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-24">
              <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-6">The Royal Collection</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">
                Exclusive Experiences
              </h2>
              <div className="w-12 h-px bg-[#D4AF37]/50 mx-auto mb-6"></div>
              <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-light tracking-wide">
                A curated selection of our finest private rides and group events at the Great Pyramids.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {featuredPackages.map((pkg) => (
                <Link href="/packages" key={pkg.id} className="group flex flex-col cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden mb-8">
                    <Image 
                      src={pkg.imageUrl || "/hero-bg.webp"} 
                      alt={pkg.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-105 opacity-90 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0" 
                    />
                    
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1 text-[9px] uppercase tracking-[0.2em]">
                        {pkg.packageType === "GROUP_EVENT" ? "Group Event" : "Private VIP"}
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-4">
                      <span>{pkg.duration} Hours</span>
                      <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                      <span>{pkg.packageType === "GROUP_EVENT" ? `Up to ${pkg.maxPeople} Guests` : `Exactly ${pkg.maxPeople} Guests`}</span>
                    </div>
                    
                    <h3 className="text-2xl font-display font-light text-white mb-4 leading-tight group-hover:text-[#D4AF37] transition-colors duration-500">
                      {pkg.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm font-light line-clamp-2 mb-8 flex-1 leading-relaxed">
                      {pkg.description}
                    </p>
                    
                    <div className="flex items-end justify-between mt-auto pt-6 border-t border-white/10">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1">
                          {pkg.packageType === "GROUP_EVENT" ? "Per Guest" : "Total Investment"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-light text-white tracking-wide">EGP {pkg.price}</span>
                          {pkg.originalPrice && (
                            <del className="text-xs text-gray-400">EGP {pkg.originalPrice}</del>
                          )}
                        </div>
                      </div>
                      <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Discover
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-24">
              <Link href="/packages" className="inline-block border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-white hover:text-black hover:border-white transition-colors duration-500 px-10 py-4 text-xs uppercase tracking-[0.2em]">
                Explore All Packages
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Luxury CTA Section instead of FAQ */}
      <section className="relative z-20 w-full overflow-hidden bg-gradient-to-b from-black/80 via-black/95 to-black py-24 md:py-32">
        <div className="absolute inset-0 bg-black opacity-10" />
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
