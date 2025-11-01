import { Metadata } from "next";
import { HelpCircle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - PyraRide",
  description: "Find answers to common questions about booking horse rides at the Giza and Saqqara Pyramids.",
};

export default function FAQPage() {
  const faqCategories = [
    {
      category: "Booking & Payments",
      questions: [
        {
          q: "How do I book a horse ride?",
          a: "Booking is simple! Browse available stables, select your preferred horse and time slot, fill in your details, and complete payment. You'll receive instant confirmation via email."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as secure online payment through our payment processor. Payment is processed at the time of booking."
        },
        {
          q: "Is my payment information secure?",
          a: "Absolutely! We use industry-standard SSL encryption and PCI DSS compliant payment processors. We never store your full card details on our servers."
        },
        {
          q: "Can I book for multiple people?",
          a: "Yes! When booking, simply select the number of riders. Each rider will need their own horse. Group discounts may be available for bookings of 5+ riders."
        },
        {
          q: "How far in advance should I book?",
          a: "We recommend booking at least 24-48 hours in advance, especially during peak tourist season (October-April). However, last-minute bookings (24+ hours ahead) are often available."
        },
      ],
    },
    {
      category: "Cancellations & Refunds",
      questions: [
        {
          q: "What is your cancellation policy?",
          a: "• 24+ hours before: 100% refund\n• 12-24 hours before: 50% refund\n• Less than 12 hours: No refund\n• Weather cancellations: Full refund or free rescheduling"
        },
        {
          q: "How do I cancel or reschedule my booking?",
          a: "Log in to your account, go to 'My Bookings', select the booking, and click 'Cancel' or 'Reschedule'. Refunds are processed within 5-7 business days to your original payment method."
        },
        {
          q: "What happens if the stable cancels my ride?",
          a: "If the stable cancels due to weather, horse health, or safety concerns, you'll receive a full 100% refund immediately or can reschedule free of charge to any available date."
        },
        {
          q: "Can I get a refund if I arrive late?",
          a: "Arrivals within 15 minutes of the scheduled time are usually accommodated with reduced ride time. After 15 minutes without notification, bookings may be marked as no-show with no refund."
        },
      ],
    },
    {
      category: "Safety & Requirements",
      questions: [
        {
          q: "Is horse riding safe?",
          a: "All our stables maintain strict safety standards. Horses are well-trained, guides are experienced, and safety equipment (helmets) is provided. However, horse riding does carry inherent risks - riders must follow all safety instructions."
        },
        {
          q: "Do I need riding experience?",
          a: "No! Most stables offer horses suitable for beginners. When booking, you can indicate your experience level, and the stable will match you with an appropriate horse and provide guidance."
        },
        {
          q: "What should I wear?",
          a: "Wear comfortable clothes you can move in (long pants recommended), closed-toe shoes with a small heel (no sandals or flip-flops), and bring sunscreen and sunglasses. Helmets are typically provided."
        },
        {
          q: "Are there age or weight restrictions?",
          a: "Age and weight limits vary by stable and horse. Generally:\n• Minimum age: 8-12 years\n• Maximum weight: 90-100 kg (200-220 lbs)\n• Children under 16 must be accompanied by an adult"
        },
        {
          q: "What if I have a medical condition?",
          a: "Please disclose any medical conditions (pregnancy, back/neck injuries, heart conditions, etc.) when booking. Some conditions may prevent you from riding for safety reasons. Consult your doctor before booking if uncertain."
        },
      ],
    },
    {
      category: "Ride Details",
      questions: [
        {
          q: "How long is a typical ride?",
          a: "Ride durations vary by package:\n• Short ride: 30-60 minutes\n• Standard ride: 1-2 hours\n• Extended tour: 2-4 hours\nCheck the stable's offerings for specific durations and routes."
        },
        {
          q: "Where do the rides take place?",
          a: "Rides take place at the Giza Pyramids (near the Great Pyramid, Sphinx area) and Saqqara (near the Step Pyramid). Exact routes vary by stable and package."
        },
        {
          q: "Can I take photos during the ride?",
          a: "Yes! You're welcome to bring a camera or smartphone. Many stables also offer professional photography services for an additional fee. Selfies with the pyramids are encouraged!"
        },
        {
          q: "What's included in the price?",
          a: "Typically included:\n• Horse and tack rental\n• Safety helmet\n• Guided experience\n• Access to riding areas\n\nMay be extra:\n• Professional photos/videos\n• Extended routes\n• Private guides\n• Transportation to/from stable"
        },
        {
          q: "What time of day is best for riding?",
          a: "Early morning (7-9 AM) and late afternoon (3-5 PM) are ideal - cooler temperatures and beautiful lighting for photos. Avoid midday (11 AM-2 PM) in summer due to heat."
        },
      ],
    },
    {
      category: "About Stables & Horses",
      questions: [
        {
          q: "How do you verify stables?",
          a: "All stables undergo a rigorous verification process:\n• Safety certifications checked\n• Horse welfare standards reviewed\n• Customer reviews analyzed\n• Regular inspections conducted\n• Only trusted, professional stables are listed"
        },
        {
          q: "How are the horses cared for?",
          a: "All our partner stables must meet strict animal welfare standards:\n• Horses are fed, watered, and rested regularly\n• Maximum riding hours enforced\n• Regular veterinary check-ups\n• Proper shelter and stable conditions\n• We take animal welfare seriously and investigate all concerns"
        },
        {
          q: "Can I choose my own horse?",
          a: "While you can indicate preferences (calm vs. energetic, color, etc.), the stable assigns horses based on your experience level, weight, and the horse's daily workload to ensure safety and animal welfare."
        },
        {
          q: "Are the horses pure Arabian?",
          a: "Many stables feature purebred Arabian horses, but not all. Horse breeds vary by stable. Arabian horses are well-suited to Egypt's climate and are popular for their endurance and gentle temperament."
        },
      ],
    },
    {
      category: "Logistics & Access",
      questions: [
        {
          q: "How do I get to the stable?",
          a: "After booking, you'll receive the stable's exact location with GPS coordinates. Most stables are accessible by taxi (Uber works in Cairo/Giza), private car, or hotel shuttle. Some stables offer pickup for an additional fee."
        },
        {
          q: "Is there parking available?",
          a: "Most stables have designated parking areas for private vehicles. Check the stable's details page or contact them directly to confirm parking availability."
        },
        {
          q: "What if I can't find the stable?",
          a: "Your booking confirmation includes:\n• Stable's phone number\n• GPS coordinates\n• Map location\n• Meeting point instructions\n\nCall the stable directly if you're having trouble finding them - they're happy to guide you!"
        },
        {
          q: "Can I extend my ride after I arrive?",
          a: "Extensions may be possible if the horse and time slot are available, subject to additional fees. However, this isn't guaranteed - we recommend booking your preferred duration initially."
        },
      ],
    },
    {
      category: "Account & Technical",
      questions: [
        {
          q: "Do I need to create an account to book?",
          a: "Yes, a free account is required to make bookings. This allows you to manage your reservations, track bookings, save favorite stables, and leave reviews."
        },
        {
          q: "I didn't receive my confirmation email. What should I do?",
          a: "Check your spam/junk folder first. If not there, log in to your account to view your booking details. Still no confirmation? Contact support@pyraride.com immediately with your booking reference."
        },
        {
          q: "Can I modify my booking details after confirmation?",
          a: "Some details can be modified (date, time, number of riders) by canceling and rebooking based on the cancellation policy. Contact the stable directly for minor changes (phone number, special requests)."
        },
        {
          q: "Is there a mobile app?",
          a: "Currently, PyraRide is web-based and mobile-optimized. You can access the full platform from any smartphone browser. A native app is planned for the future!"
        },
      ],
    },
    {
      category: "Reviews & Trust",
      questions: [
        {
          q: "Are the reviews real?",
          a: "Yes! Only verified riders who completed bookings can leave reviews. We have a zero-tolerance policy for fake reviews and use verification systems to ensure authenticity."
        },
        {
          q: "Can I leave a review?",
          a: "Absolutely! After your ride, you'll receive an email invitation to review your experience. Reviews help other riders make informed decisions and help us maintain quality standards."
        },
        {
          q: "What if I have a complaint?",
          a: "We take complaints seriously. Contact support@pyraride.com with your booking details and concerns. We'll investigate promptly and work to resolve issues fairly. Response time: within 24 hours."
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="h-10 w-10" />
            <h1 className="font-display text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
            </div>
          <p className="text-lg text-white/90">
            Find answers to common questions about booking your Pyramid horse riding experience
          </p>
        </div>
          </div>

      {/* Quick Links */}
      <div className="bg-muted border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <p className="text-sm font-semibold mb-2">Quick Jump:</p>
          <div className="flex flex-wrap gap-2">
            {faqCategories.map((cat, idx) => (
              <a
                key={idx}
                href={`#category-${idx}`}
                className="text-xs px-3 py-1 bg-background rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat.category}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {faqCategories.map((category, catIdx) => (
          <section key={catIdx} id={`category-${catIdx}`} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-primary">
              {category.category}
            </h2>
            
            <Accordion type="single" collapsible className="w-full space-y-2">
              {category.questions.map((item, qIdx) => (
                <AccordionItem
                  key={qIdx}
                  value={`item-${catIdx}-${qIdx}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold pr-4">{item.q}</span>
                        </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
            </section>
          ))}

        {/* Still have questions */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-l-4 border-primary">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="mb-4">
            Can't find the answer you're looking for? Our friendly support team is here to help!
          </p>
          <div className="space-y-2">
            <p>📧 <strong>Email:</strong> <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></p>
            <p>📱 <strong>Phone:</strong> +20 123 456 7890</p>
            <p>⏰ <strong>Hours:</strong> 9 AM - 6 PM EET, 7 days a week</p>
            <p>⚡ <strong>Response Time:</strong> Within 4 hours</p>
          </div>
          <div className="mt-6">
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
