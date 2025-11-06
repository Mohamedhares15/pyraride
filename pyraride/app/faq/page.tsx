"use client";

import { Card } from "@/components/ui/card";
import { Search, HelpCircle, Book, CreditCard, Shield, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQPageSchema } from "@/components/seo/StructuredData";

// Simple FAQ Accordion Component  
function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:text-primary"
      >
        {question}
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[500px] pb-4" : "max-h-0"}`}>
        <div className="text-sm text-muted-foreground">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <FAQPageSchema />
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
            <div className="space-y-1">
              <FAQItem 
                question="How do I book a horse riding experience?"
                answer={
                  <>
                    <p className="mb-2">Booking is simple:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Browse available stables on our platform</li>
                      <li>Select your preferred stable and horse</li>
                      <li>Choose your date, time, and duration</li>
                      <li>Complete the booking form</li>
                      <li>Confirm and receive your booking confirmation via email</li>
                    </ol>
                  </>
                }
              />

              <FAQItem 
                question="How far in advance should I book?"
                answer="We recommend booking at least 48 hours in advance, especially during peak tourist seasons (October-April). For sunrise rides or specific horses, booking 3-7 days ahead is ideal. Same-day bookings may be available but are subject to availability."
              />

              <FAQItem 
                question="Can I modify or cancel my booking?"
                answer={
                  <>
                    <p className="mb-2">Yes! Cancellation policy:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>48+ hours before: 100% refund</li>
                      <li>24-48 hours before: 50% refund</li>
                      <li>Less than 24 hours: No refund</li>
                    </ul>
                    <p className="mt-2">
                      Modifications (date/time changes) are free if made 48+ hours in advance, subject to availability.
                    </p>
                  </>
                }
              />

              <FAQItem 
                question="What's included in the booking?"
                answer="Typically includes: horse rental, safety equipment (helmet), guide escort, and access to the riding areas. Some stables may offer additional services like photography, refreshments, or extended tours. Check the specific stable's offerings when booking."
              />
            </div>
          </section>

          {/* Payment Questions */}
          <section id="payment" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Payment & Pricing
            </h2>
            <div className="space-y-1">
              <FAQItem 
                question="What payment methods do you accept?"
                answer="We accept major credit cards (Visa, Mastercard), debit cards, and some local payment methods. Some stables may also accept cash payment on-site. Payment options are displayed during checkout."
              />

              <FAQItem 
                question="How much does a horse riding experience cost?"
                answer={
                  <>
                    Prices vary by stable, horse, duration, and experience type. Typical range:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Standard 1-hour ride: $30-50 USD</li>
                      <li>Premium Arabian horse: $50-80 USD per hour</li>
                      <li>Sunrise/sunset tours: $60-100 USD</li>
                      <li>Private guided tours: $80-150 USD</li>
                    </ul>
                    <p className="mt-2">Check individual stable listings for exact pricing.</p>
                  </>
                }
              />

              <FAQItem 
                question="When do I pay?"
                answer={
                  <>
                    Payment timing depends on the stable's policy:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Advance payment:</strong> Some stables require full payment during booking</li>
                      <li><strong>On-site payment:</strong> Others allow payment when you arrive</li>
                      <li><strong>Deposit + balance:</strong> Pay a deposit online, remainder on arrival</li>
                    </ul>
                    <p className="mt-2">The payment terms are clearly stated during the booking process.</p>
                  </>
                }
              />

              <FAQItem 
                question="Are there any hidden fees?"
                answer="No hidden fees. The price shown is the final price you pay. Optional extras (photography, refreshments, extended tours) are clearly marked as additional services you can choose to add."
              />
            </div>
          </section>

          {/* Safety Questions */}
          <section id="safety" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Safety & Requirements
            </h2>
            <div className="space-y-1">
              <FAQItem 
                question="Is horse riding safe for beginners?"
                answer={
                  <>
                    Yes! All our verified stables offer beginner-friendly horses and provide:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Safety helmets and protective gear</li>
                      <li>Professional guides who accompany all rides</li>
                      <li>Gentle, well-trained horses suitable for first-time riders</li>
                      <li>Safety briefing before each ride</li>
                      <li>Adherence to safety standards and protocols</li>
                    </ul>
                  </>
                }
              />

              <FAQItem 
                question="Are there age restrictions?"
                answer={
                  <>
                    Age requirements vary by stable:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Children:</strong> Usually 6+ years old (must be accompanied by an adult)</li>
                      <li><strong>Teenagers:</strong> 13-17 years (parental consent required)</li>
                      <li><strong>Adults:</strong> No upper age limit if physically fit</li>
                    </ul>
                    <p className="mt-2">Check specific stable requirements during booking.</p>
                  </>
                }
              />

              <FAQItem 
                question="Are there weight or health restrictions?"
                answer={
                  <>
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
                  </>
                }
              />

              <FAQItem 
                question="What should I wear?"
                answer={
                  <>
                    Recommended attire:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Pants:</strong> Long pants (jeans or riding pants)</li>
                      <li><strong>Shoes:</strong> Closed-toe shoes with heel (boots ideal)</li>
                      <li><strong>Top:</strong> Comfortable, breathable shirt</li>
                      <li><strong>Sun protection:</strong> Sunglasses, sunscreen, hat</li>
                      <li><strong>Avoid:</strong> Shorts, sandals, flip-flops, loose jewelry</li>
                    </ul>
                  </>
                }
              />
            </div>
          </section>

          {/* Location Questions */}
          <section id="location" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Location & Logistics
            </h2>
            <div className="space-y-1">
              <FAQItem 
                question="Where are the stables located?"
                answer={
                  <>
                    Our verified stables are located in two main areas:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Giza:</strong> Near the Great Pyramids and Sphinx</li>
                      <li><strong>Saqqara:</strong> Near the Step Pyramid complex</li>
                    </ul>
                    <p className="mt-2">Exact addresses and directions are provided in your booking confirmation.</p>
                  </>
                }
              />

              <FAQItem 
                question="How do I get to the stable?"
                answer={
                  <>
                    <p className="mb-2">Transportation options:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Taxi/Uber:</strong> Most convenient from Cairo hotels (30-45 min)</li>
                      <li><strong>Hotel pickup:</strong> Some stables offer this service for an additional fee</li>
                      <li><strong>Tour package:</strong> May include transportation</li>
                    </ul>
                    <p className="mt-2">We provide Google Maps directions in your confirmation email.</p>
                  </>
                }
              />

              <FAQItem 
                question="What time should I arrive?"
                answer={
                  <>
                    Please arrive 15-20 minutes before your scheduled ride time for:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Check-in and paperwork</li>
                      <li>Safety briefing</li>
                      <li>Horse introduction</li>
                      <li>Fitting safety equipment</li>
                    </ul>
                    <p className="mt-2">Late arrivals may result in shortened ride time or cancellation.</p>
                  </>
                }
              />
            </div>
          </section>

          {/* Experience Questions */}
          <section id="experience" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              The Experience
            </h2>
            <div className="space-y-1">
              <FAQItem 
                question="How long does a typical ride last?"
                answer={
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Short ride:</strong> 1 hour (most popular for beginners)</li>
                    <li><strong>Standard ride:</strong> 2 hours</li>
                    <li><strong>Extended tour:</strong> 3-4 hours (includes breaks)</li>
                    <li><strong>Sunrise/sunset special:</strong> 1.5-2 hours</li>
                  </ul>
                }
              />

              <FAQItem 
                question="Can I take photos during the ride?"
                answer="Yes! Most stables welcome photography. Your guide can help take photos of you with the pyramids. Some stables offer professional photography services for an additional fee. Bring a secure bag or strap for your phone/camera."
              />

              <FAQItem 
                question="What will I see during the ride?"
                answer={
                  <>
                    <p className="mb-2">Depending on location:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Giza rides:</strong> Views of the Great Pyramids, Sphinx, desert landscape</li>
                      <li><strong>Saqqara rides:</strong> Step Pyramid, ancient tombs, archaeological sites</li>
                      <li><strong>Desert routes:</strong> Panoramic views, sunset/sunrise experiences</li>
                    </ul>
                    <p className="mt-2">Routes vary by stable and ride duration.</p>
                  </>
                }
              />

              <FAQItem 
                question="Are the horses well-treated?"
                answer={
                  <>
                    Animal welfare is our priority. All verified stables must meet our standards:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Regular veterinary care and health checks</li>
                      <li>Proper nutrition and hydration</li>
                      <li>Adequate rest periods between rides</li>
                      <li>Clean, comfortable stabling</li>
                      <li>No overworking or mistreatment</li>
                    </ul>
                    <p className="mt-2">We regularly inspect our partner stables to ensure compliance.</p>
                  </>
                }
              />
            </div>
          </section>

          {/* General Questions */}
          <section id="general">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              General Information
            </h2>
            <div className="space-y-1">
              <FAQItem 
                question="Do I need riding experience?"
                answer={
                  <>
                    No prior experience needed! Most riders are beginners. Each stable offers horses suitable for all levels:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Beginners:</strong> Gentle, calm horses with full guidance</li>
                      <li><strong>Intermediate:</strong> More responsive horses for comfortable riders</li>
                      <li><strong>Advanced:</strong> Spirited horses for experienced equestrians</li>
                    </ul>
                  </>
                }
              />

              <FAQItem 
                question="What if the weather is bad?"
                answer={
                  <>
                    For severe weather (heavy rain, sandstorms, extreme heat), stables may cancel for safety. You'll be offered:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Full refund (100%), or</li>
                      <li>Free rescheduling to another date</li>
                    </ul>
                    <p className="mt-2">You'll be notified as soon as possible if weather cancellation is necessary.</p>
                  </>
                }
              />

              <FAQItem 
                question="Can I bring my own camera/GoPro?"
                answer="Yes, personal cameras and GoPros are welcome. Make sure they're securely attached. Some riders use chest mounts or helmet mounts for hands-free recording. Drones require special permission from authorities."
              />

              <FAQItem 
                question="How do I contact support?"
                answer={
                  <>
                    We're here to help!
                    <ul className="list-none mt-2 space-y-2">
                      <li><strong>Email:</strong> support@pyraride.com</li>
                      <li><strong>Response time:</strong> Within 24 hours</li>
                      <li><strong>Dashboard:</strong> Use the AI chat assistant for instant help</li>
                      <li><strong>Phone:</strong> [Contact number to be provided]</li>
                    </ul>
                  </>
                }
              />
            </div>
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
    </>
  );
}
