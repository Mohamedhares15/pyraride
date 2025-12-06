"use client";

import { Metadata } from "next";
import { Mail, Clock, Zap, Headphones, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-black/90 z-10" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Breadcrumbs items={[{ label: "Contact Us" }]} />
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mt-4">
            Get In Touch
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            We're here to help you plan your perfect pyramid adventure.
          </p>
        </div>
      </div>

      {/* Response Time Guarantee */}
      <div className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Average Response</p>
                <p className="text-sm text-white/60">Under 4 hours</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Available 7 Days</p>
                <p className="text-sm text-white/60">9 AM - 6 PM EET</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Multilingual</p>
                <p className="text-sm text-white/60">English & Arabic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <section>
            <h2 className="mb-2 font-display text-2xl font-bold text-white">Send us a message</h2>
            <p className="text-white/60 mb-6">We typically respond within 4 hours</p>
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <Input id="name" placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number (optional)</Label>
                  <Input id="phone" type="tel" placeholder="+20 123 456 7890" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiry-type" className="text-white">Inquiry Type *</Label>
                  <select
                    id="inquiry-type"
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:ring-primary"
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
                  <Label htmlFor="message" className="text-white">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Please provide as much detail as possible so we can assist you better..."
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" size="lg">
                  Send Message
                </Button>
                <p className="text-xs text-center text-white/40">
                  We respect your privacy. Your information is never shared with third parties.
                </p>
              </form>
            </Card>
          </section>

          {/* Contact Info */}
          <section className="space-y-8">
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold text-white">Contact Information</h2>
              <p className="text-white/60 mb-6">You can reach us anytime via email</p>

              <div className="space-y-4">
                <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">Email Support</h3>
                      <p className="text-sm text-white/60 mb-2">
                        Best for: General inquiries, booking support, detailed questions
                      </p>
                      <a href="mailto:support@pyraride.com" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        support@pyraride.com
                      </a>
                      <p className="text-xs text-white/40 mt-2">
                        ⚡ Response time: 2-4 hours
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Business Hours */}
            <Card className="bg-gradient-to-br from-primary/20 to-black border-primary/30">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/60">Monday - Sunday</span>
                    <span className="font-semibold text-white">9:00 AM - 6:00 PM EET</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/60">Emergency Support</span>
                    <span className="font-semibold text-primary">Available 24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Average Response</span>
                    <span className="font-semibold text-green-400">Under 4 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Inquiries */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-white mb-2">Stable Partnership Inquiries</h3>
                <p className="text-sm text-white/60 mb-3">
                  Interested in listing your stable on PyraRide?
                </p>
                <a
                  href="mailto:partnerships@pyraride.com"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  partnerships@pyraride.com
                </a>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* FAQ Quick Link */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Looking for Quick Answers?</h2>
              <p className="mb-6 text-white/80 max-w-2xl mx-auto">
                Check out our comprehensive FAQ for instant answers to common questions about bookings, cancellations, and more.
              </p>
              <a
                href="/faq"
                className="inline-block px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-white/90 transition-colors"
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
