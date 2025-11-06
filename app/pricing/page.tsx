import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Check, Info, Clock, MapPin, Users as UsersIcon, Star } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Pricing & Packages - Transparent Horse Riding Rates",
  description: "Clear, transparent pricing for horse riding experiences at Giza and Saqqara pyramids. No hidden fees, guaranteed best prices.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            What you see is what you pay. No hidden fees, ever.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold">
            <Check className="w-5 h-5" />
            <span>Best Price Guarantee</span>
            <span>•</span>
            <Check className="w-5 h-5" />
            <span>No Hidden Fees</span>
            <span>•</span>
            <Check className="w-5 h-5" />
            <span>Flexible Cancellation</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <Breadcrumbs items={[{ label: "Pricing" }]} />
        {/* Pricing Ranges */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Typical Price Ranges</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Standard Package */}
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">Standard Experience</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">$30-50</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Well-trained horse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Professional guide escort</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Safety helmet & equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Pyramid views</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Photo opportunities</span>
                  </li>
                </ul>
                
                <p className="text-xs text-muted-foreground mb-4">Perfect for first-time riders</p>
                
                <Link 
                  href="/stables"
                  className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  View Stables
                </Link>
              </div>
            </Card>

            {/* Premium Package */}
            <Card className="relative overflow-hidden border-2 border-primary shadow-lg">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold">
                MOST POPULAR
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">Premium Arabian</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">$50-80</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm"><strong>Purebred Arabian horse</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Expert bilingual guide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Premium safety gear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Extended scenic routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Complimentary water & snacks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Photo package included</span>
                  </li>
                </ul>
                
                <p className="text-xs text-muted-foreground mb-4">Ideal for memorable experiences</p>
                
                <Link 
                  href="/stables"
                  className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  View Premium Stables
                </Link>
              </div>
            </Card>

            {/* VIP Package */}
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">VIP Private Tour</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">$80-150</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm"><strong>Private guided tour</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Champion Arabian horses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated expert guide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Sunrise/sunset specialty rides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Professional photography</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Hotel pickup/drop-off</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Refreshments & traditional meal</span>
                  </li>
                </ul>
                
                <p className="text-xs text-muted-foreground mb-4">Ultimate luxury experience</p>
                
                <Link 
                  href="/stables"
                  className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  View VIP Options
                </Link>
              </div>
            </Card>
          </div>

          {/* Price Factors */}
          <Card className="bg-muted/30 p-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Pricing Factors</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Final prices vary based on: horse breed & training level, ride duration, time of day (sunrise/sunset premium), 
                  group size, season (peak tourist season may have higher rates), additional services (photography, meals, transportation).
                </p>
                <p className="text-sm font-semibold text-primary">
                  All prices are clearly displayed before booking. No surprises at checkout.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* What's Included */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">What's Always Included</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Safety Equipment</h3>
              <p className="text-sm text-muted-foreground">
                Helmets, safety vests, and all protective gear
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Professional Guide</h3>
              <p className="text-sm text-muted-foreground">
                Experienced escort on every ride
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Scenic Routes</h3>
              <p className="text-sm text-muted-foreground">
                Best views of pyramids and monuments
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Pre-Ride Briefing</h3>
              <p className="text-sm text-muted-foreground">
                Safety instructions and horse introduction
              </p>
            </Card>
          </div>
        </section>

        {/* Duration Options */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Choose Your Duration</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">1 Hour</h3>
              <p className="text-muted-foreground mb-4">Perfect introduction for first-time riders</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Pyramid panorama route</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Multiple photo stops</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Ideal for families</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-2 border-primary">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">2 Hours</h3>
              <p className="text-muted-foreground mb-4">Most popular choice for full experience</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Extended desert trails</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Multiple pyramid viewpoints</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Rest break included</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Better value per hour</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Half/Full Day</h3>
              <p className="text-muted-foreground mb-4">Comprehensive exploration adventure</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>3-6 hour guided tour</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Visit multiple sites</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Meal & refreshments</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Best value for enthusiasts</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Price Comparison Table */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Compare Options</h2>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left font-semibold">Feature</th>
                    <th className="p-4 text-center font-semibold">Standard</th>
                    <th className="p-4 text-center font-semibold">Premium</th>
                    <th className="p-4 text-center font-semibold">VIP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-4">Hourly Rate</td>
                    <td className="p-4 text-center">$30-50</td>
                    <td className="p-4 text-center">$50-80</td>
                    <td className="p-4 text-center">$80-150</td>
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td className="p-4">Horse Type</td>
                    <td className="p-4 text-center">Well-trained</td>
                    <td className="p-4 text-center">Purebred Arabian</td>
                    <td className="p-4 text-center">Champion Arabian</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">Guide</td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td className="p-4">Safety Equipment</td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">Photography</td>
                    <td className="p-4 text-center text-muted-foreground">Optional (+$10)</td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td className="p-4">Transportation</td>
                    <td className="p-4 text-center text-muted-foreground">Optional (+$15)</td>
                    <td className="p-4 text-center text-muted-foreground">Optional (+$15)</td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">Refreshments</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td className="p-4">Meal Included</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Additional Services */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Optional Add-Ons</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-1">Professional Photos</h3>
              <p className="text-2xl font-bold text-primary mb-1">$10-25</p>
              <p className="text-xs text-muted-foreground">Edited digital delivery within 24h</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-1">Hotel Pickup</h3>
              <p className="text-2xl font-bold text-primary mb-1">$15-30</p>
              <p className="text-xs text-muted-foreground">Round trip from Cairo hotels</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-1">Traditional Meal</h3>
              <p className="text-2xl font-bold text-primary mb-1">$12-20</p>
              <p className="text-xs text-muted-foreground">Authentic Egyptian cuisine</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-1">Extended Time</h3>
              <p className="text-2xl font-bold text-primary mb-1">$25-60</p>
              <p className="text-xs text-muted-foreground">Per additional hour</p>
            </Card>
          </div>
        </section>

        {/* Group Discounts */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="p-8 text-center">
              <UsersIcon className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Group Booking Discounts</h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                <div>
                  <p className="font-bold text-lg mb-1">3-5 Riders</p>
                  <p className="text-primary text-2xl font-bold">5% OFF</p>
                  <p className="text-sm text-muted-foreground mt-1">Per person discount</p>
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">6-10 Riders</p>
                  <p className="text-primary text-2xl font-bold">10% OFF</p>
                  <p className="text-sm text-muted-foreground mt-1">Perfect for families</p>
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">11+ Riders</p>
                  <p className="text-primary text-2xl font-bold">15% OFF</p>
                  <p className="text-sm text-muted-foreground mt-1">Contact for custom package</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Best Price Guarantee */}
        <section className="mb-12">
          <Card className="border-2 border-green-600 bg-green-50">
            <div className="p-8 text-center">
              <Star className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Best Price Guarantee</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Find a lower price for the same experience within 24 hours of booking? 
                We'll match it <strong>and give you an extra 5% off</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Terms: Price match applies to identical horse, stable, date, and duration. 
                Contact us within 24 hours with proof of lower price.
              </p>
            </div>
          </Card>
        </section>

        {/* Payment & Cancellation */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Payment & Cancellation Terms</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Payment Options</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Credit/Debit Cards</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex accepted</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Online Payment</p>
                    <p className="text-sm text-muted-foreground">Secure checkout, instant confirmation</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pay On-Site</p>
                    <p className="text-sm text-muted-foreground">Available at select stables</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Cancellation Policy</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">48+ hours: 100% refund</p>
                    <p className="text-sm text-muted-foreground">Full money back guarantee</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">24-48 hours: 50% refund</p>
                    <p className="text-sm text-muted-foreground">Partial refund available</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Less than 24 hours: No refund</p>
                    <p className="text-sm text-muted-foreground">Weather exceptions apply</p>
                  </div>
                </li>
              </ul>
              <Link 
                href="/refund-policy"
                className="inline-block mt-4 text-sm text-primary hover:underline font-semibold"
              >
                View Full Refund Policy →
              </Link>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Adventure?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our verified stables and find the perfect experience for you
          </p>
          <Link
            href="/stables"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            View All Stables
          </Link>
        </section>
      </div>
    </div>
  );
}
