import { Metadata } from "next";
import { Mail, MessageCircle, Clock, Zap, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Contact Us - PyraRide | 24/7 Support Available",
  description: "Get in touch with PyraRide for support, bookings, or partnerships. Average response time: under 4 hours. Available 7 days a week.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div 
        className="relative h-[300px] overflow-hidden"
        style={{
          backgroundImage: "url(/gallery5.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl drop-shadow-lg">
              Get In Touch
            </h1>
            <p className="mt-4 text-xl text-white/90 drop-shadow-md">
              We&apos;re here to help you plan your perfect pyramid adventure.
            </p>
          </div>
        </div>
      </div>

      {/* Response Time Guarantee */}
      <div className="bg-primary/5 border-y">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold">Average Response Time</p>
                <p className="text-sm text-muted-foreground">Under 4 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold">Available 7 Days a Week</p>
                <p className="text-sm text-muted-foreground">9 AM - 6 PM EET</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold">Multilingual Support</p>
                <p className="text-sm text-muted-foreground">English & Arabic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <section>
            <h2 className="mb-2 font-display text-2xl font-bold">Send us a message</h2>
            <p className="text-muted-foreground mb-6">We typically respond within 4 hours</p>
            <Card className="p-6">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input id="phone" type="tel" placeholder="+20 123 456 7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiry-type">Inquiry Type *</Label>
                  <select 
                    id="inquiry-type" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
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
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Please provide as much detail as possible so we can assist you better..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Send Message
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy. Your information is never shared with third parties.
                </p>
              </form>
            </Card>
          </section>

          {/* Contact Info */}
          <section>
            <h2 className="mb-2 font-display text-2xl font-bold">Contact Information</h2>
            <p className="text-muted-foreground mb-6">You can reach us anytime via email or WhatsApp chat</p>
            
            <div className="space-y-4 mb-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Best for: General inquiries, booking support, detailed questions
                    </p>
                    <a href="mailto:support@pyraride.com" className="text-primary hover:underline font-medium">
                      support@pyraride.com
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚡ Response time: 2-4 hours
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <MessageCircle className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">WhatsApp Chat</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Best for: Quick questions, instant messaging, real-time updates
                    </p>
                    <a 
                      href="https://wa.me/201234567890" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚡ Usually online during business hours
                    </p>
                  </div>
                </div>
              </Card>

            </div>

            {/* Business Hours */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Sunday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM EET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emergency Support</span>
                    <span className="font-semibold text-primary">Available 24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Response</span>
                    <span className="font-semibold text-green-600">Under 4 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Inquiries */}
            <Card className="mt-8 bg-muted/30">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold mb-2">Stable Partnership Inquiries</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Interested in listing your stable on PyraRide?
                </p>
                <a 
                  href="mailto:partnerships@pyraride.com"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  partnerships@pyraride.com
                </a>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* FAQ Quick Link */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Looking for Quick Answers?</h2>
              <p className="mb-6 text-white/90">
                Check out our comprehensive FAQ for instant answers to common questions
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

