import { Metadata } from "next";
import { MapPin, Shield, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us - PyraRide",
  description: "Learn about PyraRide's mission to bring trust, safety, and transparency to horse riding at the pyramids.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero with Background */}
      <div 
        className="relative h-[500px] overflow-hidden"
        style={{
          backgroundImage: "url(/gallery2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-display text-2xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              About PyraRide
            </h1>
            <p className="mt-4 text-sm md:text-xl text-white/90 drop-shadow-md">
              The Pyramids, Unforgettable. The Ride, Uncomplicated.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-16 md:px-8">
        {/* Mission */}
        <section className="mb-8 md:mb-16">
          <h2 className="mb-4 md:mb-6 font-display text-2xl md:text-3xl font-bold">Our Mission</h2>
          <Card className="p-4 md:p-8">
            <CardContent className="space-y-3 md:space-y-4 text-sm md:text-lg">
              <p>
                PyraRide was born from a simple mission: to connect tourists with trusted,
                professional horse stables in Giza and Saqqara. We believe that experiencing
                the pyramids on horseback should be magical, safe, and accessible.
              </p>
              <p>
                Every stable on our platform is vetted for quality, safety, and animal welfare.
                We verify certifications, check reviews, and maintain high standards so you
                can book with confidence.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section className="mb-8 md:mb-16">
          <h2 className="mb-4 md:mb-8 font-display text-2xl md:text-3xl font-bold">Our Values</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 md:p-6">
              <Shield className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h3 className="mb-2 text-sm md:text-base font-semibold">Trust & Safety</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                All stables are verified for certifications and safety standards.
              </p>
            </Card>
            <Card className="p-4 md:p-6">
              <Users className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h3 className="mb-2 text-sm md:text-base font-semibold">Animal Welfare</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                We ensure all horses are treated with care and respect.
              </p>
            </Card>
            <Card className="p-4 md:p-6">
              <Award className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h3 className="mb-2 text-sm md:text-base font-semibold">Quality</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Only the best stables make it onto our platform.
              </p>
            </Card>
            <Card className="p-4 md:p-6">
              <MapPin className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h3 className="mb-2 text-sm md:text-base font-semibold">Transparency</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Real reviews from real riders help you make informed decisions.
              </p>
            </Card>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="mb-4 md:mb-8 font-display text-2xl md:text-3xl font-bold">The Team</h2>
          <Card className="p-4 md:p-8">
            <CardContent>
              <p className="text-sm md:text-lg">
                We&apos;re a team of travelers, horse lovers, and technology enthusiasts
                passionate about making the pyramids accessible to everyone.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
