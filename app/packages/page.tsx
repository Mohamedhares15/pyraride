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
    <div className="min-h-screen bg-[#050505] pb-32 font-sans text-foreground selection:bg-[#D4AF37]/30">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.webp"
            alt="Horse riding at the Pyramids"
            fill
            className="object-cover opacity-[0.35] grayscale-[40%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/60 to-[#050505]" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12">
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-bold mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">The Royal Collection</p>
          <h1 className="text-4xl md:text-6xl font-display font-medium mb-6 tracking-wide text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            Curated Experiences
          </h1>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-6 shadow-lg"></div>
          <p className="text-sm md:text-base text-gray-200 max-w-xl mx-auto font-medium tracking-wide leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Exclusive private rides and group events at the Great Pyramids of Giza, curated for the most discerning travelers.
          </p>
        </div>
      </section>

      {/* Packages List */}
      <section className="container mx-auto px-4 relative z-20 -mt-10">
        <div className="max-w-5xl mx-auto space-y-32">
          {packages.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4">Coming Soon</p>
              <h3 className="text-2xl font-display font-light text-white">Our experts are crafting new journeys.</h3>
            </div>
          ) : (
            packages.map((pkg, index) => {
              // Create a seamless text string for amenities
              const amenitiesList = [];
              if (pkg.hasHorseRide) amenitiesList.push("Equine Journey");
              if (pkg.hasFood) amenitiesList.push("Culinary Experience");
              if (pkg.hasDancingShow) amenitiesList.push("Cultural Show");
              if (pkg.hasParty) amenitiesList.push("Private Event");
              if (pkg.hasTransportation) amenitiesList.push(pkg.transportationType === "HOME_PICKUP" ? "Chauffeur Service" : "VIP Transport");

              return (
                <div key={pkg.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20 group`}>
                  
                  {/* Image Side */}
                  <div className="w-full md:w-1/2 relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={pkg.imageUrl || "/hero-bg.webp"}
                      alt={pkg.title}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-105 opacity-90 group-hover:opacity-100 grayscale-[10%] group-hover:grayscale-0"
                    />
                    
                    {/* Top Labels */}
                    <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1 text-[9px] uppercase tracking-[0.2em] w-fit">
                        {pkg.packageType === "GROUP_EVENT" ? "Group Event" : "Private VIP"}
                      </div>
                      {pkg.isFeatured && (
                        <div className="bg-[#D4AF37] text-black px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-semibold w-fit">
                          Featured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="w-full md:w-1/2 flex flex-col justify-center py-8">
                    <div className="mb-8">
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-4">
                        <span>{pkg.duration} Hours</span>
                        <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                        <span>{pkg.packageType === "GROUP_EVENT" ? `Up to ${pkg.maxPeople} Guests` : `Exactly ${pkg.maxPeople} Guests`}</span>
                        {pkg.startTime && (
                          <>
                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                            <span>Begins {pkg.startTime}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-light text-white mb-6 leading-tight">
                        {pkg.title}
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light mb-8">
                        {pkg.description}
                      </p>

                      {/* Minimalist Amenities */}
                      <div className="mb-8">
                        <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] mb-3">The Experience</p>
                        <p className="text-gray-300 text-sm font-light leading-relaxed">
                          {amenitiesList.join(" • ")}
                        </p>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between pt-8 border-t border-white/10 mt-auto">
                        <div className="mb-6 md:mb-0">
                          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">
                            {pkg.packageType === "GROUP_EVENT" ? "Per Guest" : "Total Investment"}
                          </p>
                          <div className="flex items-end gap-3">
                            <span className="text-2xl md:text-3xl font-light text-white tracking-wide">EGP {pkg.price}</span>
                            {pkg.originalPrice && (
                              <del className="text-sm text-gray-600 mb-1">EGP {pkg.originalPrice}</del>
                            )}
                          </div>
                        </div>

                        <Button asChild className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-6 rounded-none text-xs uppercase tracking-[0.2em]">
                          <Link href={`/checkout/package/${pkg.id}`}>
                            Reserve Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
