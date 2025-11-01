import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import TrustBadges from "@/components/shared/TrustBadges";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import HowItWorks from "@/components/sections/HowItWorks";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Trust Stats Bar */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-y">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-sm text-muted-foreground">Happy Riders</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <p className="text-sm text-muted-foreground">Verified Stables</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-sm text-muted-foreground">Rebooking Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Trust Badges */}
      <div className="bg-background py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Thousands Trust PyraRide
          </h2>
          <TrustBadges />
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Pyramid Adventure?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Book with confidence. Ride with joy. Create memories that last forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/stables"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-bold text-lg hover:bg-white/90 transition-colors"
            >
              Browse Stables
            </a>
            <a
              href="/faq"
              className="inline-block px-8 py-4 bg-white/10 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
