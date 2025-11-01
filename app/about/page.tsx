import { Metadata } from "next";
import { MapPin, Shield, Users, Award, Heart, Target, Globe, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us - Our Story & Team | PyraRide",
  description: "Learn how PyraRide is revolutionizing horse riding experiences at the Pyramids. Meet our team of passionate travelers and horse enthusiasts.",
  openGraph: {
    title: "About PyraRide - Our Story & Mission",
    description: "Connecting travelers with trusted, certified horse riding experiences at Egypt's Pyramids",
    images: [{ url: "/about-og.jpg", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  // PLACEHOLDER: Update these with your actual team members
  const team = [
    {
      name: "[Your Name]",
      role: "Founder & CEO",
      bio: "[Add your bio here - background in tourism, horses, or technology]",
      linkedin: "#"
    },
    {
      name: "[Team Member]",
      role: "Head of Operations",
      bio: "[Add team member bio - their role and expertise]",
      linkedin: "#"
    },
    {
      name: "[Team Member]",
      role: "Customer Success Manager",
      bio: "[Add team member bio - their commitment to customer experience]",
      linkedin: "#"
    },
    {
      name: "[Team Member]",
      role: "Safety & Compliance",
      bio: "[Add team member bio - their safety and animal welfare expertise]",
      linkedin: "#"
    }
  ];

  // PLACEHOLDER: Update milestones with real company history
  const milestones = [
    { year: "[Year]", title: "PyraRide Founded", description: "[Your founding story]" },
    { year: "[Year]", title: "First Partnership", description: "[Your first stable partnership]" },
    { year: "[Year]", title: "Platform Launch", description: "[When you officially launched]" },
    { year: "[Current Year]", title: "Growing Platform", description: "[Current status and growth]" },
  ];

  // PLACEHOLDER: Update stats with real numbers (will be calculated from database)
  const stats = [
    { value: "[#]", label: "Total Bookings", icon: Users },
    { value: "[#]", label: "Partner Stables", icon: Shield },
    { value: "[#]/5", label: "Average Rating", icon: Star },
    { value: "[#]%", label: "Customer Satisfaction", icon: Heart },
  ];

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center max-w-4xl">
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg mb-6">
              Transforming Pyramid Horse Riding <br />
              <span className="text-primary">One Authentic Experience at a Time</span>
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-white/95 drop-shadow-md font-light">
              The Pyramids, Unforgettable. The Ride, Uncomplicated.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="space-y-2">
                  <Icon className="h-8 w-8 text-primary mx-auto" />
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 md:px-8 space-y-16">
        {/* Our Story */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Born from a passion for Egypt's heritage and a love for horses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-lg">
              <p>
                <strong>[PLACEHOLDER: Your Founding Story]</strong> — Share how and why you started PyraRide. 
                What problem did you see? What inspired you to create this platform?
              </p>
              <p>
                <strong>The Challenge:</strong> Describe the specific challenges travelers face when trying 
                to book horse riding experiences at the pyramids (safety concerns, price confusion, lack of trust, etc.)
              </p>
              <p className="text-primary font-semibold">
                [Your solution and unique approach]
              </p>
              <p>
                <strong>[Your Current Status]:</strong> Share your current impact — how many stables you work with, 
                riders served, countries reached, or other metrics that demonstrate your platform's value and growth.
              </p>
              <p className="text-sm text-muted-foreground italic mt-4">
                💡 Replace this text with your authentic story to build trust and connection with visitors
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {/* Placeholder for story image */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center p-8">
                    <Globe className="h-20 w-20 mx-auto mb-4 text-primary" />
                    <p className="text-2xl font-bold">Connecting Cultures</p>
                    <p>Through the Magic of Horse Riding</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Mission & Vision */}
        <section>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary">
              <CardContent className="pt-8 pb-8">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To provide travelers with <strong>safe, authentic, and unforgettable</strong> horse riding
                  experiences at Egypt's most iconic landmarks, while supporting local communities and
                  championing <strong>animal welfare</strong>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="pt-8 pb-8">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To become the <strong>global standard</strong> for adventure tourism booking platforms,
                  expanding to iconic destinations worldwide while maintaining our commitment to
                  <strong> trust, quality, and sustainability</strong>.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold">Trust & Safety</h3>
              <p className="text-sm text-muted-foreground">
                Every stable undergoes rigorous verification. We personally inspect facilities,
                check certifications, and validate safety protocols before listing.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Heart className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold">Animal Welfare</h3>
              <p className="text-sm text-muted-foreground">
                Horse health and happiness come first. We monitor welfare standards continuously
                and immediately delist any stable that fails to meet our criteria.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Award className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                We only work with the top 10% of stables. If it's on PyraRide, it's guaranteed
                to be exceptional in quality, service, and experience.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MapPin className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold">Transparency</h3>
              <p className="text-sm text-muted-foreground">
                Real reviews from verified riders. Clear pricing with no hidden fees.
                Honest communication at every step of your journey.
              </p>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Passionate professionals dedicated to delivering world-class experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-40 h-48 sm:h-auto bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                      {/* Placeholder for team photos */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="h-16 w-16 text-primary/40" />
                      </div>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-primary font-semibold mb-3">{member.role}</p>
                      <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                      <a 
                        href={member.linkedin} 
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        Connect on LinkedIn
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Journey/Milestones */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground text-lg">
              From idea to Egypt's most trusted riding platform
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20 hidden md:block" />
            
            <div className="space-y-8">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-6 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="flex-1">
                    <Card className={idx % 2 === 0 ? "" : "md:text-right"}>
                      <CardContent className="pt-6">
                        <div className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold mb-3">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-primary items-center justify-center text-white font-bold relative z-10">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose PyraRide */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PyraRide?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-3">100% Verified</h3>
              <p className="text-sm text-muted-foreground">
                Every stable is personally inspected by our team. We verify licenses, inspect facilities,
                and validate animal welfare standards before listing.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-3">Safety Guaranteed</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive insurance, trained guides, safety equipment, and emergency protocols
                are mandatory for all partner stables.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-3">Best Price Promise</h3>
              <p className="text-sm text-muted-foreground">
                Find a lower price elsewhere? We'll match it and give you an extra 5% off.
                No hidden fees, ever.
              </p>
            </Card>
          </div>
        </section>

        {/* Certifications & Partnerships - PLACEHOLDER */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications & Partnerships</h2>
            <p className="text-muted-foreground mb-6">
              Display your business certifications, travel industry memberships, and partnerships here
            </p>
          </div>
          
          <Card className="p-8 bg-muted/30">
            <div className="text-center space-y-4">
              <Shield className="h-16 w-16 mx-auto text-primary/40" />
              <h3 className="font-semibold text-lg">Add Your Certifications</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Upload logos of your business licenses, tourism board memberships, safety certifications, 
                and industry partnerships. This builds trust and credibility with potential customers.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Examples: Egyptian Tourism Authority, International Equestrian Federation, 
                TripAdvisor Certificate of Excellence, Better Business Bureau, etc.
              </p>
            </div>
          </Card>
        </section>

        {/* Animal Welfare Commitment */}
        <section>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-3xl mx-auto">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Animal Welfare Commitment</h2>
                <p className="text-lg mb-6">
                  We believe happy, healthy horses provide the best experiences. Every partner stable must:
                </p>
                <ul className="text-left grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Provide regular veterinary care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Ensure proper nutrition & hydration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Limit working hours (max 4 hours/day)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Provide spacious, clean facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>No overloading or mistreatment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Regular rest days for all horses</span>
                  </li>
                </ul>
                <p className="text-sm text-green-800 mt-6 font-semibold">
                  Report any concerns to welfare@pyraride.com - we investigate every report within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold mb-4">Want to Partner With Us?</h2>
              <p className="text-lg mb-8 text-primary-foreground/90">
                If you run a high-quality stable and share our values, we'd love to hear from you
              </p>
              <a
                href="mailto:partnerships@pyraride.com"
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Become a Partner Stable
              </a>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
