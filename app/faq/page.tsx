"use client";

import { Card } from "@/components/ui/card";
import { Search, HelpCircle, Book, CreditCard, Shield, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQPageSchema } from "@/components/seo/StructuredData";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

// Full FAQ Data for Schema and Rendering
const faqData = [
  // Booking Questions
  {
    category: "Booking Questions",
    items: [
      {
        question: "How do I book a horse riding experience?",
        answer: "Booking is simple on PyraRide: 1. Visit www.pyrarides.com and browse available stables. 2. Compare stables, read reviews, and select your preferred stable and horse. 3. Choose your date, time, and duration. 4. Complete the booking form with your details. 5. Confirm and receive your booking confirmation via email instantly. Instant booking available 24/7 - no need to wait for responses or call multiple stables."
      },
      {
        question: "How far in advance should I book?",
        answer: "We recommend booking at least 48 hours in advance through PyraRide.com, especially during peak tourist seasons (October-April). For sunrise rides or specific horses, booking 3-7 days ahead is ideal. Same-day bookings may be available but are subject to availability. Check real-time availability at www.pyrarides.com."
      },
      {
        question: "Can I modify or cancel my booking?",
        answer: "Yes! Cancellation policy: 48+ hours before: 100% refund. 24-48 hours before: 50% refund. Less than 24 hours: No refund. Modifications (date/time changes) are free if made 48+ hours in advance, subject to availability."
      },
      {
        question: "What's included in the booking?",
        answer: "Typically includes: horse rental, safety equipment (helmet), guide escort, and access to the riding areas. Some stables may offer additional services like photography, refreshments, or extended tours. Check the specific stable's offerings when booking."
      }
    ]
  },
  // Payment Questions
  {
    category: "Payment & Pricing",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards (Visa, Mastercard), debit cards, and some local payment methods. Some stables may also accept cash payment on-site. Payment options are displayed during checkout."
      },
      {
        question: "How much does a horse riding experience cost?",
        answer: "Prices vary by stable, horse, duration, and experience type. Typical range: Standard 1-hour ride: $30-50 USD. Premium Arabian horse: $50-80 USD per hour. Sunrise/sunset tours: $60-100 USD. Private guided tours: $80-150 USD. Check individual stable listings for exact pricing."
      },
      {
        question: "When do I pay?",
        answer: "Payment timing depends on the stable's policy: Advance payment: Some stables require full payment during booking. On-site payment: Others allow payment when you arrive. Deposit + balance: Pay a deposit online, remainder on arrival. The payment terms are clearly stated during the booking process."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees. The price shown is the final price you pay. Optional extras (photography, refreshments, extended tours) are clearly marked as additional services you can choose to add."
      }
    ]
  },
  // Safety Questions
  {
    category: "Safety & Requirements",
    items: [
      {
        question: "Is horse riding safe for beginners?",
        answer: "Yes! All our verified stables offer beginner-friendly horses and provide: Safety helmets and protective gear, Professional guides who accompany all rides, Gentle, well-trained horses suitable for first-time riders, Safety briefing before each ride, Adherence to safety standards and protocols."
      },
      {
        question: "Are there age restrictions?",
        answer: "Age requirements vary by stable: Children: Usually 6+ years old (must be accompanied by an adult). Teenagers: 13-17 years (parental consent required). Adults: No upper age limit if physically fit. Check specific stable requirements during booking."
      },
      {
        question: "Are there weight or health restrictions?",
        answer: "Weight: Maximum typically 220 lbs (100 kg) for rider safety and horse welfare. Health conditions: Please inform us if you have back, neck, or joint problems, heart conditions, pregnancy, recent surgeries, or severe allergies. The stable may refuse service if safety cannot be guaranteed."
      },
      {
        question: "What should I wear?",
        answer: "Recommended attire: Pants: Long pants (jeans or riding pants). Shoes: Closed-toe shoes with heel (boots ideal). Top: Comfortable, breathable shirt. Sun protection: Sunglasses, sunscreen, hat. Avoid: Shorts, sandals, flip-flops, loose jewelry."
      }
    ]
  },
  // Location Questions
  {
    category: "Location & Logistics",
    items: [
      {
        question: "Where are the stables located?",
        answer: "PyraRide's verified stables are located in two main areas: Giza Plateau (Near the Great Pyramids and Sphinx) and Saqqara Desert (Near the Step Pyramid complex). Browse all locations and compare stables at www.pyrarides.com/stables. Exact addresses and directions are provided in your booking confirmation email."
      },
      {
        question: "How do I get to the stable?",
        answer: "Transportation options: Taxi/Uber: Most convenient from Cairo hotels (30-45 min). Hotel pickup: Some stables offer this service for an additional fee. Tour package: May include transportation. We provide Google Maps directions in your confirmation email."
      },
      {
        question: "What time should I arrive?",
        answer: "Please arrive 15-20 minutes before your scheduled ride time for check-in and paperwork, safety briefing, horse introduction, and fitting safety equipment. Late arrivals may result in shortened ride time or cancellation."
      }
    ]
  },
  // Experience Questions
  {
    category: "The Experience",
    items: [
      {
        question: "How long does a typical ride last?",
        answer: "Short ride: 1 hour (most popular for beginners). Standard ride: 2 hours. Extended tour: 3-4 hours (includes breaks). Sunrise/sunset special: 1.5-2 hours."
      },
      {
        question: "Can I take photos during the ride?",
        answer: "Yes! Most stables welcome photography. Your guide can help take photos of you with the pyramids. Some stables offer professional photography services for an additional fee. Bring a secure bag or strap for your phone/camera."
      },
      {
        question: "What will I see during the ride?",
        answer: "Depending on location: Giza rides: Views of the Great Pyramids, Sphinx, desert landscape. Saqqara rides: Step Pyramid, ancient tombs, archaeological sites. Desert routes: Panoramic views, sunset/sunrise experiences. Routes vary by stable and ride duration."
      },
      {
        question: "Are the horses well-treated?",
        answer: "Animal welfare is our priority. All verified stables must meet our standards: Regular veterinary care and health checks, Proper nutrition and hydration, Adequate rest periods between rides, Clean, comfortable stabling, No overworking or mistreatment. We regularly inspect our partner stables to ensure compliance."
      }
    ]
  },
  // Marketplace Questions
  {
    category: "About PyraRide Platform",
    items: [
      {
        question: "What is PyraRide?",
        answer: "PyraRide is Egypt's first and only online booking marketplace for horse riding experiences at the Giza and Saqqara Pyramids. Unlike single-stable websites, PyraRide offers multiple verified stables on one platform, allowing you to compare prices, read reviews, and book instantly at www.pyrarides.com."
      },
      {
        question: "Is PyraRide a single stable or multiple stables?",
        answer: "PyraRide is a marketplace platform that works with multiple verified stables. You can compare and book from different stables in both Giza and Saqqara locations. This is different from single-stable websites that only offer one location or stable. Visit www.pyrarides.com/stables to browse all available options."
      },
      {
        question: "How is PyraRide different from other horse riding websites?",
        answer: "PyraRide is Egypt's first online marketplace for horse riding, meaning we offer multiple verified stables on one platform. Other websites typically represent only one stable. With PyraRide, you get to compare multiple stables side-by-side, read verified reviews from real customers, compare prices across different options, and book all in one convenient platform at www.pyrarides.com."
      },
      {
        question: "Can I compare different stables on PyraRide?",
        answer: "Yes! That's the main advantage of PyraRide. As Egypt's only marketplace platform, you can compare multiple stables side-by-side at www.pyrarides.com/stables. Compare prices, locations, ratings, reviews, and availability all in one place before making your booking decision."
      },
      {
        question: "Why book through PyraRide instead of directly with a stable?",
        answer: "PyraRide offers several advantages: Compare multiple stables and prices in one place, Read verified reviews from real customers, Instant online booking available 24/7, Secure payment processing with multiple options, Best price guarantee - we'll match or beat any price, 24/7 customer support to help with any issues, All stables pre-verified for safety and quality standards."
      },
      {
        question: "How many stables does PyraRide have?",
        answer: "PyraRide works with multiple verified stables across Giza and Saqqara. The exact number varies as we regularly add new verified partners. Visit www.pyrarides.com/stables to see all available options and compare them in one place. Unlike single-stable websites, PyraRide offers the largest selection of verified stables in Egypt."
      },
      {
        question: "Where can I book horse riding at the pyramids?",
        answer: "You can book horse riding at both Giza Plateau and Saqqara Desert Pyramids through PyraRide.com. We work with multiple verified stables in both locations, offering instant online booking and guaranteed best prices. Visit www.pyrarides.com to compare and book from all available stables."
      },
      {
        question: "Which location is better: Giza or Saqqara for horse riding?",
        answer: "Both locations offer unique experiences. Giza Plateau offers spectacular views of the Great Pyramids and Sphinx. Saqqara Desert features the Step Pyramid and ancient tombs. You can compare stables in both locations on www.pyrarides.com to find the best option for your preferences, budget, and schedule."
      }
    ]
  },
  // General Questions
  {
    category: "General Information",
    items: [
      {
        question: "Do I need riding experience?",
        answer: "No prior experience needed! Most riders are beginners. Each stable offers horses suitable for all levels: Beginners: Gentle, calm horses with full guidance. Intermediate: More responsive horses for comfortable riders. Advanced: Spirited horses for experienced equestrians."
      },
      {
        question: "What if the weather is bad?",
        answer: "For severe weather (heavy rain, sandstorms, extreme heat), stables may cancel for safety. You'll be offered: Full refund (100%), or Free rescheduling to another date. You'll be notified as soon as possible if weather cancellation is necessary."
      },
      {
        question: "Can I bring my own camera/GoPro?",
        answer: "Yes, personal cameras and GoPros are welcome. Make sure they're securely attached. Some riders use chest mounts or helmet mounts for hands-free recording. Drones require special permission from authorities."
      },
      {
        question: "How do I contact support?",
        answer: "We're here to help! Email: support@pyraride.com. Response time: Within 24 hours. Dashboard: Use the AI chat assistant for instant help."
      }
    ]
  }
];

// Flatten all items for Schema
const allFaqItems = faqData.flatMap(section => section.items);

// Simple FAQ Accordion Component  
function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-medium transition-all text-white hover:text-primary"
      >
        {question}
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 text-white/60 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[500px] pb-4" : "max-h-0"}`}>
        <div className="text-sm text-white/60">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <FAQPageSchema items={allFaqItems} />
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative h-[300px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-black/90 z-10" />
          <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
            <Breadcrumbs items={[{ label: "FAQ" }]} />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mt-4">
              Frequently Asked Questions
            </h1>
            <p className="text-white/60 mt-2 max-w-2xl">
              Find answers to common questions about booking and riding at the pyramids.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16">
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <a href="#booking" className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
              <Book className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white">Booking</span>
            </a>
            <a href="#payment" className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
              <CreditCard className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white">Payment</span>
            </a>
            <a href="#safety" className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
              <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white">Safety</span>
            </a>
            <a href="#location" className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
              <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white">Location</span>
            </a>
            <a href="#experience" className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
              <Search className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white">Experience</span>
            </a>
            <a href="#platform" className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
              <HelpCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white">About PyraRide</span>
            </a>
          </div>

          <Card className="p-6 md:p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            {/* Booking Questions */}
            <section id="booking" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                Booking Questions
              </h2>
              <div className="space-y-1">
                {faqData[0].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {/* Payment Questions */}
            <section id="payment" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                Payment & Pricing
              </h2>
              <div className="space-y-1">
                {faqData[1].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {/* Safety Questions */}
            <section id="safety" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                Safety & Requirements
              </h2>
              <div className="space-y-1">
                {faqData[2].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {/* Location Questions */}
            <section id="location" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                Location & Logistics
              </h2>
              <div className="space-y-1">
                {faqData[3].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {/* Experience Questions */}
            <section id="experience" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                The Experience
              </h2>
              <div className="space-y-1">
                {faqData[4].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {/* Marketplace & Platform Questions */}
            <section id="platform" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                About PyraRide Platform
              </h2>
              <div className="space-y-1">
                {faqData[5].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {/* General Questions */}
            <section id="general">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-primary/20">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                General Information
              </h2>
              <div className="space-y-1">
                {faqData[6].items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>
          </Card>

          {/* Still have questions? */}
          <Card className="mt-8 p-6 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-white">Still have questions?</h3>
              <p className="text-white/60 mb-6">
                Can't find what you're looking for? Our support team is ready to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
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
