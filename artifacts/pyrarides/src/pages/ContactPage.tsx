import { Mail, Clock, Zap, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="relative h-[300px] w-full overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D4A6E]/20 to-black/90 z-10" />
        <img src="/hero-bg.webp" alt="Contact" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Breadcrumbs items={[{ label: "Contact Us" }]} />
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Get In Touch</h1>
          <p className="text-white/60 mt-2 max-w-2xl">We're here to help you plan your perfect pyramid adventure.</p>
        </div>
      </div>

      <div className="border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {[
              { icon: Zap, title: "Average Response", sub: "Under 4 hours" },
              { icon: Clock, title: "Available 7 Days", sub: "9 AM - 6 PM EET" },
              { icon: Headphones, title: "Multilingual", sub: "English & Arabic" },
            ].map(({ icon: Icon, title, sub }, idx) => (
              <div key={idx} className="flex items-center justify-center md:justify-start gap-4">
                <div className="p-3 rounded-full bg-[#2D4A6E]/20"><Icon className="h-6 w-6 text-[#2D4A6E]" /></div>
                <div><p className="font-bold text-white">{title}</p><p className="text-sm text-white/60">{sub}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <section>
            <h2 className="mb-2 text-2xl font-bold text-white">Send us a message</h2>
            <p className="text-white/60 mb-6">We typically respond within 4 hours</p>
            <Card className="p-6 bg-white/5 border-white/10">
              <form className="space-y-6">
                <div className="space-y-2"><Label htmlFor="name" className="text-white">Full Name *</Label><Input id="name" placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" /></div>
                <div className="space-y-2"><Label htmlFor="email" className="text-white">Email Address *</Label><Input id="email" type="email" placeholder="your@email.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" /></div>
                <div className="space-y-2"><Label htmlFor="phone" className="text-white">Phone Number (optional)</Label><Input id="phone" type="tel" placeholder="+20 123 456 7890" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" /></div>
                <div className="space-y-2">
                  <Label htmlFor="inquiry-type" className="text-white">Inquiry Type *</Label>
                  <select id="inquiry-type" className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" required>
                    <option value="">Select a topic</option>
                    <option value="booking">Booking Question</option>
                    <option value="cancellation">Cancellation / Refund</option>
                    <option value="payment">Payment Issue</option>
                    <option value="stable">Stable Information</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="feedback">Feedback / Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2"><Label htmlFor="message" className="text-white">Message *</Label><Textarea id="message" rows={6} placeholder="Please provide as much detail as possible..." required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" /></div>
                <Button type="submit" className="w-full bg-[#2D4A6E] hover:bg-[#2D4A6E]/90 text-white" size="lg">Send Message</Button>
              </form>
            </Card>
          </section>

          <section className="space-y-8">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-white">Contact Information</h2>
              <p className="text-white/60 mb-6">You can reach us anytime via email</p>
              <Card className="p-6 bg-white/5 border-white/10 hover:border-[#2D4A6E]/50 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[#2D4A6E]/10"><Mail className="h-6 w-6 text-[#2D4A6E]" /></div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email Support</h3>
                    <p className="text-sm text-white/60 mb-2">Best for: General inquiries, booking support</p>
                    <a href="mailto:support@pyrarides.com" className="text-[#2D4A6E] hover:text-[#2D4A6E]/80 font-medium">support@pyrarides.com</a>
                    <p className="text-xs text-white/40 mt-2">⚡ Response time: 2-4 hours</p>
                  </div>
                </div>
              </Card>
            </div>
            <Card className="bg-gradient-to-br from-[#2D4A6E]/20 to-black border-[#2D4A6E]/30">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-[#2D4A6E]" />Business Hours</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/60">Monday - Sunday</span><span className="font-semibold text-white">9:00 AM - 6:00 PM EET</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/60">Emergency Support</span><span className="font-semibold text-[#2D4A6E]">Available 24/7</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Average Response</span><span className="font-semibold text-green-400">Under 4 hours</span></div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
