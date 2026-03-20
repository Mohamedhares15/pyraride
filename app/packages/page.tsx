import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Users, Check, Star, CalendarDays, MapPin, Car } from "lucide-react";

export const metadata = {
  title: "Luxury Riding Packages | PyraRides",
  description: "Browse our exclusive horse riding packages at the Great Pyramids of Giza.",
};

// Bypass Next.js static caching so new packages show instantly
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-sans text-foreground">
      {/* Hero Section */}
      <section className="relative h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.webp"
            alt="Horse riding at the Pyramids"
            fill
            className="object-cover brightness-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-[80px]">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight drop-shadow-2xl">
            <span className="text-white">Curated</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]">Journeys</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto drop-shadow-lg font-medium">
            VIP private rides and exclusive group events at the Great Pyramids.
          </p>
        </div>
      </section>

      {/* Packages List */}
      <section className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {packages.length === 0 ? (
            <div className="bg-[#121212] p-16 text-center rounded-2xl shadow-2xl border border-white/10">
              <h3 className="text-3xl font-display mb-4 text-[#D4AF37]">Check back soon</h3>
              <p className="text-gray-400 text-lg">We are currently crafting our luxury packages.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all hover:border-[#D4AF37]/50 group flex flex-col md:flex-row relative">
                
                {/* Labels */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  {pkg.packageType === "GROUP_EVENT" && (
                    <div className="bg-blue-600 border border-blue-400/30 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
                      Group Event
                    </div>
                  )}
                  {pkg.packageType === "PRIVATE" && (
                    <div className="bg-purple-600 border border-purple-400/30 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
                      Private VIP
                    </div>
                  )}
                  {pkg.isFeatured && (
                    <div className="bg-gradient-to-r from-[#BF953F] to-[#B38728] text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      Featured
                    </div>
                  )}
                </div>

                {/* Image Side */}
                <div className="relative h-72 md:h-auto md:w-5/12 shrink-0 overflow-hidden">
                  <Image
                    src={pkg.imageUrl || "/hero-bg.webp"}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent md:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#121212]/90 hidden md:block" />
                </div>

                {/* Content Side */}
                <div className="p-6 md:p-10 flex flex-col flex-1 relative z-10 md:-ml-8 bg-gradient-to-l from-[#121212] via-[#121212] to-transparent md:bg-[#121212]">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                    <div className="md:w-2/3">
                      <h2 className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-4">
                        {pkg.title}
                      </h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-3 text-sm text-gray-300 font-medium">
                        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Clock className="w-4 h-4 mr-2 text-[#D4AF37]" />
                          {pkg.startTime ? `${pkg.startTime} • ` : ''}{pkg.duration} Hours
                        </div>
                        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Users className="w-4 h-4 mr-2 text-[#D4AF37]" />
                          {pkg.packageType === "GROUP_EVENT" 
                            ? `Min ${pkg.minPeople} - Max ${pkg.maxPeople} Tickets`
                            : `Exactly ${pkg.maxPeople} People`}
                        </div>
                        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <CalendarDays className="w-4 h-4 mr-2 text-[#D4AF37]" />
                          {pkg.availableDays.join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 text-left md:text-right bg-white/5 md:bg-transparent p-4 md:p-0 rounded-2xl border border-white/5 md:border-none">
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                        {pkg.packageType === "GROUP_EVENT" ? "Per Ticket" : "Total Price"}
                      </div>
                      <div className="flex items-center md:justify-end gap-3">
                        {pkg.originalPrice && (
                          <del className="text-xl font-bold text-red-500/80 decoration-red-500/80">EGP {pkg.originalPrice}</del>
                        )}
                        <div className="text-3xl md:text-4xl font-bold text-[#D4AF37]">EGP {pkg.price}</div>
                      </div>
                      {pkg.originalPrice && (
                        <div className="text-xs text-green-400 font-bold uppercase tracking-wider mt-1">Special Discount Applied</div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                    {pkg.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 mb-8 flex-1">
                    {/* Amenities Core */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 text-[#D4AF37]">Core Amenities</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {pkg.hasHorseRide && (
                          <div className="flex items-center text-sm text-gray-200 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-xl mr-2">🐎</span> Horse Ride
                          </div>
                        )}
                        {pkg.hasFood && (
                          <div className="flex items-center text-sm text-gray-200 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-xl mr-2">🍽️</span> Food Included
                          </div>
                        )}
                        {pkg.hasDancingShow && (
                          <div className="flex items-center text-sm text-gray-200 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-xl mr-2">💃</span> Dancing Show
                          </div>
                        )}
                        {pkg.hasParty && (
                          <div className="flex items-center text-sm text-gray-200 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-xl mr-2">🎉</span> Party / Event
                          </div>
                        )}
                      </div>
                      
                      {pkg.hasTransportation && (
                        <div className="mt-3 flex items-start text-sm text-gray-200 bg-white/5 p-3 rounded-lg border border-white/5">
                          {pkg.transportationType === "HOME_PICKUP" ? (
                            <>
                              <Car className="w-5 h-5 mr-3 text-[#D4AF37] shrink-0" />
                              <span className="font-medium">Direct Home Pickup & Return</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-5 h-5 mr-3 text-[#D4AF37] shrink-0" />
                              <span className="font-medium">Specific Meeting Point Transport</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Custom Highlights */}
                    {pkg.highlights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 text-[#D4AF37]">Highlights</h4>
                        <ul className="space-y-3">
                          {pkg.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-300">
                              <Star className="w-4 h-4 mr-3 text-[#D4AF37] shrink-0 mt-0.5" />
                              <span className="leading-snug">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <p className="text-sm text-gray-400 flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Verified PyraRides Excellence
                    </p>
                    <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black font-bold hover:opacity-90 transition-opacity border-none shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                      <Link href="/stables">
                        Book This Experience
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
