import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Search, HelpCircle, Book, CreditCard, Shield, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description: "Common questions about booking horse riding experiences at the Giza and Saqqara pyramids.",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="mb-4 font-display text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about booking and riding at the pyramids
          </p>
          </div>

      {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <a href="#booking" className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors">
            <Book className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Booking</span>
          </a>
          <a href="#payment" className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Payment</span>
          </a>
          <a href="#safety" className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Safety</span>
          </a>
          <a href="#location" className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Location</span>
          </a>
          <a href="#experience" className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors">
            <Search className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Experience</span>
          </a>
          <a href="#general" className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">General</span>
          </a>
        </div>

        <Card className="p-6 md:p-8">
          {/* Booking Questions */}
          <section id="booking" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-primary" />
              Booking Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="booking-1">
                <AccordionTrigger>How do I book a horse riding experience?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Booking is simple:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Browse available stables on our platform</li>
                    <li>Select your preferred stable and horse</li>
                    <li>Choose your date, time, and duration</li>
                    <li>Complete the booking form</li>
                    <li>Confirm and receive your booking confirmation via email</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-2">
                <AccordionTrigger>How far in advance should I book?</AccordionTrigger>
                <AccordionContent>
                  We recommend booking at least 48 hours in advance, especially during peak tourist seasons 
                  (October-April). For sunrise rides or specific horses, booking 3-7 days ahead is ideal. 
                  Same-day bookings may be available but are subject to availability.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-3">
                <AccordionTrigger>Can I modify or cancel my booking?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Yes! Cancellation policy:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>48+ hours before: 100% refund</li>
                    <li>24-48 hours before: 50% refund</li>
                    <li>Less than 24 hours: No refund</li>
                  </ul>
                  <p className="mt-2">
                    Modifications (date/time changes) are free if made 48+ hours in advance, subject to availability.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-4">
                <AccordionTrigger>What's included in the booking?</AccordionTrigger>
                <AccordionContent>
                  Typically includes: horse rental, safety equipment (helmet), guide escort, and access to the riding areas. 
                  Some stables may offer additional services like photography, refreshments, or extended tours. 
                  Check the specific stable's offerings when booking.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Payment Questions */}
          <section id="payment" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Payment & Pricing
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-1">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept major credit cards (Visa, Mastercard), debit cards, and some local payment methods. 
                  Some stables may also accept cash payment on-site. Payment options are displayed during checkout.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-2">
                <AccordionTrigger>How much does a horse riding experience cost?</AccordionTrigger>
                <AccordionContent>
                  Prices vary by stable, horse, duration, and experience type. Typical range:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Standard 1-hour ride: $30-50 USD</li>
                    <li>Premium Arabian horse: $50-80 USD per hour</li>
                    <li>Sunrise/sunset tours: $60-100 USD</li>
                    <li>Private guided tours: $80-150 USD</li>
                  </ul>
                  <p className="mt-2">Check individual stable listings for exact pricing.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-3">
                <AccordionTrigger>When do I pay?</AccordionTrigger>
                <AccordionContent>
                  Payment timing depends on the stable's policy:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Advance payment:</strong> Some stables require full payment during booking</li>
                    <li><strong>On-site payment:</strong> Others allow payment when you arrive</li>
                    <li><strong>Deposit + balance:</strong> Pay a deposit online, remainder on arrival</li>
                  </ul>
                  <p className="mt-2">The payment terms are clearly stated during the booking process.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-4">
                <AccordionTrigger>Are there any hidden fees?</AccordionTrigger>
                <AccordionContent>
                  No hidden fees. The price shown is the final price you pay. Optional extras (photography, 
                  refreshments, extended tours) are clearly marked as additional services you can choose to add.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Safety Questions */}
          <section id="safety" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Safety & Requirements
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="safety-1">
                <AccordionTrigger>Is horse riding safe for beginners?</AccordionTrigger>
                <AccordionContent>
                  Yes! All our verified stables offer beginner-friendly horses and provide:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Safety helmets and protective gear</li>
                    <li>Professional guides who accompany all rides</li>
                    <li>Gentle, well-trained horses suitable for first-time riders</li>
                    <li>Safety briefing before each ride</li>
                    <li>Adherence to safety standards and protocols</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="safety-2">
                <AccordionTrigger>Are there age restrictions?</AccordionTrigger>
                <AccordionContent>
                  Age requirements vary by stable:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Children:</strong> Usually 6+ years old (must be accompanied by an adult)</li>
                    <li><strong>Teenagers:</strong> 13-17 years (parental consent required)</li>
                    <li><strong>Adults:</strong> No upper age limit if physically fit</li>
                  </ul>
                  <p className="mt-2">Check specific stable requirements during booking.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="safety-3">
                <AccordionTrigger>Are there weight or health restrictions?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2"><strong>Weight:</strong> Maximum typically 220 lbs (100 kg) for rider safety and horse welfare</p>
                  <p className="mb-2"><strong>Health conditions:</strong> Please inform us if you have:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Back, neck, or joint problems</li>
                    <li>Heart conditions</li>
                    <li>Pregnancy</li>
                    <li>Recent surgeries</li>
                    <li>Severe allergies</li>
                  </ul>
                  <p className="mt-2">The stable may refuse service if safety cannot be guaranteed.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="safety-4">
                <AccordionTrigger>What should I wear?</AccordionTrigger>
                <AccordionContent>
                  Recommended attire:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Pants:</strong> Long pants (jeans or riding pants)</li>
                    <li><strong>Shoes:</strong> Closed-toe shoes with heel (boots ideal)</li>
                    <li><strong>Top:</strong> Comfortable, breathable shirt</li>
                    <li><strong>Sun protection:</strong> Sunglasses, sunscreen, hat</li>
                    <li><strong>Avoid:</strong> Shorts, sandals, flip-flops, loose jewelry</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Location Questions */}
          <section id="location" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Location & Logistics
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="location-1">
                <AccordionTrigger>Where are the stables located?</AccordionTrigger>
                <AccordionContent>
                  Our verified stables are located in two main areas:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Giza:</strong> Near the Great Pyramids and Sphinx</li>
                    <li><strong>Saqqara:</strong> Near the Step Pyramid complex</li>
                  </ul>
                  <p className="mt-2">Exact addresses and directions are provided in your booking confirmation.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="location-2">
                <AccordionTrigger>How do I get to the stable?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Transportation options:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Taxi/Uber:</strong> Most convenient from Cairo hotels (30-45 min)</li>
                    <li><strong>Hotel pickup:</strong> Some stables offer this service for an additional fee</li>
                    <li><strong>Tour package:</strong> May include transportation</li>
                  </ul>
                  <p className="mt-2">We provide Google Maps directions in your confirmation email.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="location-3">
                <AccordionTrigger>What time should I arrive?</AccordionTrigger>
                <AccordionContent>
                  Please arrive 15-20 minutes before your scheduled ride time for:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Check-in and paperwork</li>
                    <li>Safety briefing</li>
                    <li>Horse introduction</li>
                    <li>Fitting safety equipment</li>
                  </ul>
                  <p className="mt-2">Late arrivals may result in shortened ride time or cancellation.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Experience Questions */}
          <section id="experience" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              The Experience
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="experience-1">
                <AccordionTrigger>How long does a typical ride last?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Short ride:</strong> 1 hour (most popular for beginners)</li>
                    <li><strong>Standard ride:</strong> 2 hours</li>
                    <li><strong>Extended tour:</strong> 3-4 hours (includes breaks)</li>
                    <li><strong>Sunrise/sunset special:</strong> 1.5-2 hours</li>
                  </ul>
                  <p className="mt-2">Actual riding time, safety briefings add 15-20 minutes.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="experience-2">
                <AccordionTrigger>Can I take photos during the ride?</AccordionTrigger>
                <AccordionContent>
                  Yes! Most stables welcome photography. Your guide can help take photos of you with the pyramids. 
                  Some stables offer professional photography services for an additional fee. Bring a secure bag or strap 
                  for your phone/camera.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="experience-3">
                <AccordionTrigger>What will I see during the ride?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Depending on location:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Giza rides:</strong> Views of the Great Pyramids, Sphinx, desert landscape</li>
                    <li><strong>Saqqara rides:</strong> Step Pyramid, ancient tombs, archaeological sites</li>
                    <li><strong>Desert routes:</strong> Panoramic views, sunset/sunrise experiences</li>
                  </ul>
                  <p className="mt-2">Routes vary by stable and ride duration.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="experience-4">
                <AccordionTrigger>Are the horses well-treated?</AccordionTrigger>
                <AccordionContent>
                  Animal welfare is our priority. All verified stables must meet our standards:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Regular veterinary care and health checks</li>
                    <li>Proper nutrition and hydration</li>
                    <li>Adequate rest periods between rides</li>
                    <li>Clean, comfortable stabling</li>
                    <li>No overworking or mistreatment</li>
                  </ul>
                  <p className="mt-2">We regularly inspect our partner stables to ensure compliance.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* General Questions */}
          <section id="general">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              General Information
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="general-1">
                <AccordionTrigger>Do I need riding experience?</AccordionTrigger>
                <AccordionContent>
                  No prior experience needed! Most riders are beginners. Each stable offers horses suitable for all levels:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Beginners:</strong> Gentle, calm horses with full guidance</li>
                    <li><strong>Intermediate:</strong> More responsive horses for comfortable riders</li>
                    <li><strong>Advanced:</strong> Spirited horses for experienced equestrians</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-2">
                <AccordionTrigger>What if the weather is bad?</AccordionTrigger>
                <AccordionContent>
                  For severe weather (heavy rain, sandstorms, extreme heat), stables may cancel for safety. You'll be offered:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Full refund (100%), or</li>
                    <li>Free rescheduling to another date</li>
                  </ul>
                  <p className="mt-2">You'll be notified as soon as possible if weather cancellation is necessary.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-3">
                <AccordionTrigger>Can I bring my own camera/GoPro?</AccordionTrigger>
                <AccordionContent>
                  Yes, personal cameras and GoPros are welcome. Make sure they're securely attached. Some riders use chest mounts 
                  or helmet mounts for hands-free recording. Drones require special permission from authorities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-4">
                <AccordionTrigger>How do I contact support?</AccordionTrigger>
                <AccordionContent>
                  We're here to help!
                  <ul className="list-none mt-2 space-y-2">
                    <li><strong>Email:</strong> support@pyraride.com</li>
                    <li><strong>Response time:</strong> Within 24 hours</li>
                    <li><strong>Dashboard:</strong> Use the AI chat assistant for instant help</li>
                    <li><strong>Phone:</strong> [Contact number to be provided]</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </section>
        </Card>

        {/* Still have questions? */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is ready to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
