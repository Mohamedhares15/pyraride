import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Search, ChevronDown } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const faqData = [
  {
    category: "Booking Questions",
    items: [
      { question: "How do I book a horse riding experience?", answer: "Booking is simple: Browse available stables, compare reviews, select your preferred stable and horse, choose your date and time, and confirm. You receive instant email confirmation." },
      { question: "How far in advance should I book?", answer: "We recommend booking at least 48 hours in advance, especially during peak seasons (October-April). For sunrise rides or specific horses, booking 3-7 days ahead is ideal." },
      { question: "Can I modify or cancel my booking?", answer: "Cancellation policy: 48+ hours before: 100% refund. 24-48 hours before: 50% refund. Less than 24 hours: No refund. Modifications are free if made 48+ hours in advance." },
    ]
  },
  {
    category: "Payment & Pricing",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept major credit cards (Visa, Mastercard), debit cards, and some local payment methods." },
      { question: "Are there any hidden fees?", answer: "No hidden fees. The price shown is the final price you pay. Optional extras are clearly marked as additional services." },
    ]
  },
  {
    category: "Safety & Requirements",
    items: [
      { question: "Is horse riding safe for beginners?", answer: "Yes! All our verified stables provide safety helmets, professional guides, gentle well-trained horses, and a safety briefing before each ride." },
      { question: "Are there age restrictions?", answer: "Children: Usually 6+ years old (must be accompanied by an adult). Teenagers: 13-17 (parental consent required). Adults: No upper age limit if physically fit." },
    ]
  },
  {
    category: "Location & Logistics",
    items: [
      { question: "Where are the stables located?", answer: "PyraRides stables are in two main areas: Giza Plateau (near the Great Pyramids and Sphinx) and Saqqara Desert (near the Step Pyramid complex)." },
      { question: "What time should I arrive?", answer: "Please arrive 15-20 minutes before your scheduled ride time for check-in, safety briefing, and equipment fitting." },
    ]
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const filteredData = faqData.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !searchQuery ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="relative h-[300px] w-full overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D4A6E]/20 to-black/90 z-10" />
        <img src="/hero-bg.webp" alt="FAQ" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Breadcrumbs items={[{ label: "FAQ" }]} />
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Frequently Asked Questions</h1>
          <p className="text-white/60 mt-2">Everything you need to know about PyraRides</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#2D4A6E]/50"
          />
        </div>

        <div className="space-y-10">
          {filteredData.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{category.category}</h2>
              <div className="space-y-3">
                {category.items.map((item, idx) => {
                  const key = `${category.category}-${idx}`;
                  const isOpen = openItems.includes(key);
                  return (
                    <Card key={idx} className="bg-white/5 border-white/10 overflow-hidden">
                      <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => toggleItem(key)}>
                        <span className="font-medium text-white pr-4">{item.question}</span>
                        <ChevronDown className={`h-5 w-5 text-white/60 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-white/70 text-sm leading-relaxed border-t border-white/10 pt-4">
                          {item.answer}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="text-center py-16 text-white/40">No questions found matching "{searchQuery}"</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
