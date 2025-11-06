import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HowItWorks from "@/components/sections/HowItWorks";
import { Card } from "@/components/ui/card";
import { Shield, Star, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Trust Stats Bar - PLACEHOLDER: Update with real metrics from your database */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-y">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">[#]</div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-xs text-muted-foreground/60 mt-1">(Live from database)</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">[#]</div>
              <p className="text-sm text-muted-foreground">Partner Stables</p>
              <p className="text-xs text-muted-foreground/60 mt-1">(Auto-updated)</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">[#]/5</div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-xs text-muted-foreground/60 mt-1">(From real reviews)</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">[#]%</div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              <p className="text-xs text-muted-foreground/60 mt-1">(Customer surveys)</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose PyraRide - Real Value Props */}
      <div className="bg-background py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose PyraRide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">100% Verified</h3>
              <p className="text-sm text-muted-foreground">
                Every stable personally inspected for safety and quality
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Professional Guides</h3>
              <p className="text-sm text-muted-foreground">
                Experienced escorts on every ride for your safety
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Real Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Authentic reviews from verified riders only
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Best Price</h3>
              <p className="text-sm text-muted-foreground">
                Price match guarantee + no hidden fees
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials - PLACEHOLDER: Add real customer testimonials */}
      <div className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Riders Say</h2>
            <p className="text-muted-foreground">Real experiences from real customers</p>
          </div>
          
          <Card className="p-8 bg-white">
            <div className="text-center space-y-4">
              <Star className="w-16 h-16 mx-auto text-primary/40" />
              <h3 className="text-xl font-semibold">Customer Testimonials</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your customer reviews and testimonials will appear here. Collect feedback after rides 
                to build trust and help future riders make informed decisions.
              </p>
              <p className="text-sm text-muted-foreground italic">
                💡 Reviews are automatically requested 24 hours after each ride
              </p>
            </div>
          </Card>
        </div>
      </div>

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
