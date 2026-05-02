import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, Globe, MessageSquare, ArrowRight } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Reveal } from "@/components/shared/Motion";
import { toast } from "sonner";
import heroImg from "@/assets/hero-pyramids.jpg";

const INQUIRY_TYPES = [
  "Booking question",
  "Cancellation / refund",
  "Payment issue",
  "Stable information",
  "Partnership enquiry",
  "Feedback / complaint",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "", message: "" });
  const [sending, setSending] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setForm({ name: "", email: "", phone: "", type: "", message: "" });
    toast.success("Message received.", { description: "We'll respond within 4 hours." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img src={heroImg} alt="Pyramids" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        <div className="relative h-full container flex flex-col justify-end pb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-luxury uppercase text-background/70 mb-4"
          >
            PyraRides · Concierge
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-background leading-[0.95]"
          >
            Get in<br />touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-background/60 text-sm max-w-lg"
          >
            Our concierge team responds within 4 hours, every day of the year.
          </motion.p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-b hairline bg-surface/40">
        <div className="container py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Clock, label: "Response time", value: "Under 4 hours" },
            { icon: Globe, label: "Languages", value: "English & Arabic" },
            { icon: MessageSquare, label: "Available", value: "Every day, 8 AM – 8 PM EET" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="size-10 flex-shrink-0 border hairline flex items-center justify-center">
                <Icon className="size-4 text-ink-muted" />
              </div>
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</p>
                <p className="font-medium text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <section className="container py-24 grid lg:grid-cols-12 gap-16">
        {/* Form */}
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Send a message</p>
            <h2 className="font-display text-4xl md:text-5xl mb-8 leading-tight">We're here to help.</h2>
          </Reveal>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] tracking-luxury uppercase text-ink-muted block mb-2">Full Name *</label>
                <input
                  value={form.name} onChange={update("name")} required
                  placeholder="Ahmed Al-Rashid"
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-luxury uppercase text-ink-muted block mb-2">Email Address *</label>
                <input
                  type="email" value={form.email} onChange={update("email")} required
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] tracking-luxury uppercase text-ink-muted block mb-2">Phone (optional)</label>
                <input
                  type="tel" value={form.phone} onChange={update("phone")}
                  placeholder="+20 xxx xxx xxxx"
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-luxury uppercase text-ink-muted block mb-2">Enquiry type *</label>
                <select
                  value={form.type} onChange={update("type") as any} required
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors text-foreground"
                >
                  <option value="" className="bg-background">Select a topic</option>
                  {INQUIRY_TYPES.map((t) => <option key={t} value={t} className="bg-background">{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] tracking-luxury uppercase text-ink-muted block mb-2">Message *</label>
              <textarea
                value={form.message} onChange={update("message")} required rows={6}
                placeholder="Tell us how we can help..."
                className="w-full bg-transparent border hairline p-4 text-sm focus:outline-none focus:border-foreground transition-colors resize-none placeholder:text-ink-muted/50"
              />
            </div>

            <button
              type="submit" disabled={sending}
              className="inline-flex items-center gap-3 px-7 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? "Sending…" : (<>Send message <ArrowRight className="size-4" /></>)}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div className="lg:col-span-4 lg:col-start-9 space-y-10">
          <Reveal delay={0.2}>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">Contact details</p>

            <div className="space-y-8">
              <div className="border-t hairline pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="size-4 text-ink-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1">General support</p>
                    <a href="mailto:support@pyrarides.com" className="text-sm hover:opacity-70 transition-opacity">support@pyrarides.com</a>
                  </div>
                </div>
              </div>

              <div className="border-t hairline pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="size-4 text-ink-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1">Stable partnerships</p>
                    <a href="mailto:stables@pyrarides.com" className="text-sm hover:opacity-70 transition-opacity">stables@pyrarides.com</a>
                  </div>
                </div>
              </div>

              <div className="border-t hairline pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="size-4 text-ink-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1">Privacy & legal</p>
                    <a href="mailto:privacy@pyrarides.com" className="text-sm hover:opacity-70 transition-opacity">privacy@pyrarides.com</a>
                  </div>
                </div>
              </div>

              <div className="border-t hairline pt-6">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Business hours</p>
                <div className="space-y-2 text-sm text-ink-soft">
                  <div className="flex justify-between">
                    <span>Monday – Sunday</span>
                    <span>8:00 AM – 8:00 PM EET</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency line</span>
                    <span className="text-foreground">24 / 7</span>
                  </div>
                </div>
              </div>

              <div className="border-t hairline pt-6">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Address</p>
                <p className="text-sm text-ink-soft leading-relaxed">
                  PyraRides Egypt LLC<br />
                  Giza Plateau Road, Nazlet Al-Semman<br />
                  Giza Governorate, Egypt
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
