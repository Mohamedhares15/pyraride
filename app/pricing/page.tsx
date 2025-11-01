import { Metadata } from "next";
import { Check, AlertCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing & Packages - PyraRide",
  description: "Transparent pricing for horse riding at the Pyramids. No hidden fees. Best price guarantee.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Transparent Pricing
          </h1>
          <p className="text-xl text-white/90">
            No hidden fees. No surprises. Just honest pricing.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16">
        
        {/* Pricing Guarantee */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-green-100 rounded-full p-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Best Price Guarantee</h2>
              <p className="text-muted-foreground">
                Found a lower price elsewhere for the same experience? We'll match it and give you an extra 5% off. 
                That's our promise to you.
              </p>
            </div>
          </div>
        </div>

        {/* Typical Price Ranges */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Typical Price Ranges</h2>
          <p className="text-center text-muted-foreground mb-8">
            Prices vary by stable, season, and experience type. Here's what to expect:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Standard Ride */}
            <Card className="hover:shadow-xl transition-shadow border-2">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-primary font-semibold mb-2">MOST POPULAR</div>
                  <h3 className="text-2xl font-bold mb-2">Standard Ride</h3>
                  <div className="text-4xl font-bold mb-2">$30-$50</div>
                  <p className="text-sm text-muted-foreground">per person / hour</p>
                </div>
                
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>1-2 hour guided ride</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Well-trained Arabian horse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Experienced guide included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Safety helmet provided</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Pyramid views guaranteed</span>
                  </li>
                </ul>

                <div className="mt-6 text-center">
                  <a
                    href="/stables"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors w-full"
                  >
                    View Stables
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Short Ride */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-muted-foreground font-semibold mb-2">BUDGET FRIENDLY</div>
                  <h3 className="text-2xl font-bold mb-2">Short Ride</h3>
                  <div className="text-4xl font-bold mb-2">$20-$35</div>
                  <p className="text-sm text-muted-foreground">per person / 30-60 min</p>
                </div>
                
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>30-60 minute ride</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Perfect for first-timers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Guide included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Safety equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Pyramid photo stops</span>
                  </li>
                </ul>

                <div className="mt-6 text-center">
                  <a
                    href="/stables"
                    className="inline-block px-6 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors w-full"
                  >
                    View Stables
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Premium Experience */}
            <Card className="hover:shadow-xl transition-shadow border-2 border-primary">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-primary font-semibold mb-2">PREMIUM</div>
                  <h3 className="text-2xl font-bold mb-2">Extended Tour</h3>
                  <div className="text-4xl font-bold mb-2">$70-$120</div>
                  <p className="text-sm text-muted-foreground">per person / 3-4 hours</p>
                </div>
                
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>3-4 hour premium tour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Private guide (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Extended desert routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Professional photos included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Refreshments provided</span>
                  </li>
                </ul>

                <div className="mt-6 text-center">
                  <a
                    href="/stables"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors w-full"
                  >
                    View Stables
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's Included */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What's Always Included</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🐴</div>
              <h3 className="font-bold mb-2">Premium Horses</h3>
              <p className="text-sm text-muted-foreground">
                Well-trained, healthy Arabian horses matched to your skill level
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">👨‍🏫</div>
              <h3 className="font-bold mb-2">Expert Guides</h3>
              <p className="text-sm text-muted-foreground">
                Professional, certified guides with local knowledge and safety training
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🪖</div>
              <h3 className="font-bold mb-2">Safety Equipment</h3>
              <p className="text-sm text-muted-foreground">
                Helmets, safety briefing, and emergency protocols for all riders
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="font-bold mb-2">Pyramid Access</h3>
              <p className="text-sm text-muted-foreground">
                Riding routes near iconic pyramids with perfect photo opportunities
              </p>
            </Card>
          </div>
        </section>

        {/* Additional Costs */}
        <section className="mb-16">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-3">Optional Add-Ons (Vary by Stable)</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Professional Photography:</p>
                    <p className="text-muted-foreground">$15-$30 - High-quality photos of your ride</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Video Package:</p>
                    <p className="text-muted-foreground">$20-$40 - Edited video of your experience</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Transportation:</p>
                    <p className="text-muted-foreground">$10-$25 - Pickup/drop-off from hotel</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Private Guide:</p>
                    <p className="text-muted-foreground">$30-$50 - One-on-one personalized experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Group Discounts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Group Discounts</h2>
          
          <Card>
            <CardContent className="pt-8 pb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Group Size</th>
                    <th className="text-left py-3 px-4">Discount</th>
                    <th className="text-left py-3 px-4">Example Savings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">5-9 riders</td>
                    <td className="py-3 px-4 font-semibold text-green-600">10% off</td>
                    <td className="py-3 px-4 text-muted-foreground">Save $15-$25 total</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">10-19 riders</td>
                    <td className="py-3 px-4 font-semibold text-green-600">15% off</td>
                    <td className="py-3 px-4 text-muted-foreground">Save $45-$75 total</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">20+ riders</td>
                    <td className="py-3 px-4 font-semibold text-green-600">20% off</td>
                    <td className="py-3 px-4 text-muted-foreground">Save $120+ total</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Contact <a href="mailto:groups@pyraride.com" className="text-primary hover:underline">groups@pyraride.com</a> for custom group packages
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Payment & Fees */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Payment Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold mb-4">Accepted Payment Methods</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Visa & Mastercard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    American Express
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Secure online payment
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Instant booking confirmation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold mb-4">Fees & Charges</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee:</span>
                    <span className="font-semibold text-green-600">$0 - FREE</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Booking Fee:</span>
                    <span className="font-semibold text-green-600">$0 - FREE</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Cancellation Fee:</span>
                    <span className="font-semibold text-green-600">$0 - FREE</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">What You See:</span>
                    <span className="font-bold">What You Pay</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Refund Policy Summary */}
        <section className="mb-16">
          <Card className="bg-muted/30">
            <CardContent className="pt-8 pb-8">
              <h3 className="font-bold text-xl mb-6 text-center">Fair Cancellation Policy</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-green-600 font-bold text-lg mb-2">100% Refund</div>
                  <p className="text-sm text-muted-foreground">Cancel 24+ hours before</p>
                </div>
                <div>
                  <div className="text-orange-600 font-bold text-lg mb-2">50% Refund</div>
                  <p className="text-sm text-muted-foreground">Cancel 12-24 hours before</p>
                </div>
                <div>
                  <div className="text-blue-600 font-bold text-lg mb-2">Free Rescheduling</div>
                  <p className="text-sm text-muted-foreground">For weather cancellations</p>
                </div>
              </div>
              <p className="text-center mt-6">
                <a href="/refund-policy" className="text-primary hover:underline font-medium">
                  View Full Refund Policy →
                </a>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ CTA */}
        <div className="text-center">
          <Card className="bg-primary text-primary-foreground inline-block">
            <CardContent className="pt-8 pb-8 px-12">
              <h3 className="text-2xl font-bold mb-4">Questions About Pricing?</h3>
              <p className="mb-6 text-primary-foreground/90">
                Check our FAQ for detailed information about costs, payments, and what's included
              </p>
              <a
                href="/faq"
                className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                View FAQ
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

