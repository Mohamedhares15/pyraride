import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Users, Check, Star } from "lucide-react";

export const metadata = {
  title: "Luxury Riding Packages | PyraRides",
  description: "Browse our exclusive horse riding packages at the Great Pyramids of Giza.",
};

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.webp"
            alt="Horse riding at the Pyramids"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-md">
            Exclusive <span className="text-[#D4AF37]">Experiences</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow">
            Curated luxury horse riding packages designed for unforgettable memories at the Great Pyramids.
          </p>
        </div>
      </section>

      {/* Packages List */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {packages.length === 0 ? (
            <div className="bg-card p-12 text-center rounded-xl shadow-lg border">
              <h3 className="text-2xl font-display mb-2">Check back soon</h3>
              <p className="text-muted-foreground">We are currently crafting our luxury packages.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border/50 transition-all hover:shadow-2xl group flex flex-col md:flex-row relative">
                
                {pkg.isFeatured && (
                  <div className="absolute top-4 left-4 z-20 bg-[#D4AF37] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Featured
                  </div>
                )}

                {/* Image Side */}
                <div className="relative h-64 md:h-auto md:w-2/5 shrink-0 overflow-hidden">
                  <Image
                    src={pkg.imageUrl || "/hero-bg.webp"}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                </div>

                {/* Content Side */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {pkg.title}
                      </h2>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
                          {pkg.duration} Hours
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
                          Up to {pkg.maxPeople} People
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right">
                      <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Price</div>
                      <div className="text-3xl font-bold text-[#D4AF37]">EGP {pkg.price}</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {pkg.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8 flex-1">
                    {pkg.highlights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-card-foreground">Highlights</h4>
                        <ul className="space-y-2">
                          {pkg.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start text-sm text-muted-foreground">
                              <Star className="w-4 h-4 mr-2 text-[#D4AF37] shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {pkg.included.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-card-foreground">What's Included</h4>
                        <ul className="space-y-2">
                          {pkg.included.map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-muted-foreground">
                              <Check className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      * All bookings verified by PyraRides standard of excellence.
                    </p>
                    <Button asChild size="lg" className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B4952F] text-white">
                      <Link href="/stables">
                        Book This Package
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
