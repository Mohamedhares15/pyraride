import { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Contact Us - PyraRide",
  description: "Get in touch with PyraRide for support, questions, or partnerships.",
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

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <section>
            <h2 className="mb-6 font-display text-2xl font-bold">Send us a message</h2>
            <Card className="p-6">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us about your needs..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </Card>
          </section>

          {/* Contact Info */}
          <section>
            <h2 className="mb-6 font-display text-2xl font-bold">Contact Information</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <CardContent className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      support@pyraride.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">
                      +20 123 456 7890
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-sm text-muted-foreground">
                      Giza, Egypt
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="flex items-start gap-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat with us instantly
                    </p>
                    <Button variant="link" className="h-auto p-0">
                      Start Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

