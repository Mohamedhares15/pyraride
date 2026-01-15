"use client";

import { Metadata } from "next";
import { MapPin, Shield, Users, Award, Heart, Target, Globe, CheckCircle, Star, Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function AboutPage() {
  const team = [
    {
      name: "Mohamed Hares",
      role: "Founder & CEO",
      bio: "Passionate about connecting travelers with authentic Egyptian experiences. Dedicated to modernizing the horse riding industry while preserving its heritage.",
      linkedin: "https://www.linkedin.com/in/mohamed-hares-015b92234?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
    },
    {
      name: "Seif Askalany",
      role: "Co-Founder",
      bio: "Driven by a vision to create seamless digital experiences. Focused on operational excellence and building lasting partnerships with local stables.",
      linkedin: "https://www.linkedin.com/in/seif-askalany-5811a3384?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
    }
  ];

  const milestones = [
    { year: "2024", title: "PyraRide Founded", description: "Launched with a mission to digitize the pyramid horse riding experience." },
    { year: "2024", title: "First Partnerships", description: "Partnered with top-rated stables in Giza and Saqqara." },
    { year: "2025", title: "Platform Growth", description: "Expanded to serve thousands of riders with verified, safe bookings." },
  ];

  const stats = [
    { value: "1000+", label: "Happy Riders", icon: Users },
    { value: "50+", label: "Verified Horses", icon: Shield },
    { value: "4.9/5", label: "Average Rating", icon: Star },
    { value: "100%", label: "Safety Record", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-black safe-area-black text-white">
      {/* Hero with Background */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-50" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl mb-6">
            Transforming Pyramid <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Horse Riding</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/90 drop-shadow-lg font-light max-w-2xl">
            The Pyramids, Unforgettable. The Ride, Uncomplicated.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="space-y-2 group">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 md:px-8 space-y-24">
        {/* Our Story */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Story</h2>
            <p className="text-white/60 text-lg max-w-3xl mx-auto">
              Born from a passion for Egypt's heritage and a love for horses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg text-white/80 leading-relaxed">
              <p>
                PyraRide was founded with a simple yet powerful vision: to bring trust, transparency, and technology to one of the world's most iconic experiences—horse riding at the Pyramids of Giza.
              </p>
              <p>
                For too long, visitors faced uncertainty with haggling, unverified operators, and safety concerns. We saw an opportunity to change that. By partnering with only the most reputable, ethical stables, we've created a platform where safety and quality are guaranteed.
              </p>
              <p>
                Today, PyraRide is the bridge between modern travelers and ancient tradition, ensuring that every ride is safe, fair, and truly magical.
              </p>
            </div>

            <Card className="overflow-hidden border-white/10 bg-white/5">
              <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-black flex items-center justify-center p-8 text-center">
                <div>
                  <Globe className="h-20 w-20 mx-auto mb-6 text-primary" />
                  <p className="text-2xl font-bold text-white mb-2">Connecting Cultures</p>
                  <p className="text-white/60">Through the Magic of Horse Riding</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Mission & Vision */}
        <section>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 to-black hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8">
                <Target className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  To provide travelers with <strong>safe, authentic, and unforgettable</strong> horse riding
                  experiences at Egypt's most iconic landmarks, while supporting local communities and
                  championing <strong>animal welfare</strong>.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 to-black hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8">
                <Globe className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
                <p className="text-white/70 text-lg leading-relaxed">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Core Values</h2>
            <p className="text-white/60 text-lg">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <Shield className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold text-white">Trust & Safety</h3>
              <p className="text-sm text-white/60">
                Every stable undergoes rigorous verification. We personally inspect facilities and validate safety protocols.
              </p>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <Heart className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold text-white">Animal Welfare</h3>
              <p className="text-sm text-white/60">
                Horse health comes first. We monitor welfare standards continuously and delist any stable that fails to comply.
              </p>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <Award className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold text-white">Excellence</h3>
              <p className="text-sm text-white/60">
                We only work with the top 10% of stables. If it's on PyraRide, it's guaranteed to be exceptional.
              </p>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <MapPin className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-bold text-white">Transparency</h3>
              <p className="text-sm text-white/60">
                Real reviews. Clear pricing. No hidden fees. Honest communication at every step.
              </p>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Meet Our Founders</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              The visionaries behind PyraRide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <Card key={idx} className="overflow-hidden bg-white/5 border-white/10 hover:border-primary/50 transition-all group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="relative w-full sm:w-40 h-48 sm:h-auto bg-gradient-to-br from-primary/20 to-black flex-shrink-0 flex items-center justify-center">
                      <Users className="h-16 w-16 text-primary/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <h3 className="text-xl font-bold mb-1 text-white">{member.name}</h3>
                      <p className="text-primary font-semibold mb-3">{member.role}</p>
                      <p className="text-sm text-white/60 mb-4 leading-relaxed">{member.bio}</p>
                      <a
                        href={member.linkedin}
                        className="inline-flex items-center gap-2 text-sm text-white hover:text-primary transition-colors w-fit"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Journey</h2>
            <p className="text-white/60 text-lg">
              From idea to Egypt's most trusted riding platform
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-primary/50 to-transparent hidden md:block" />

            <div className="space-y-12">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="flex-1 w-full">
                    <Card className={`bg-white/5 border-white/10 p-6 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <div className={`inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-bold mb-3 border border-primary/30`}>
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{milestone.title}</h3>
                      <p className="text-white/60">{milestone.description}</p>
                    </Card>
                  </div>

                  <div className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-black relative z-10 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />

                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-none">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">Want to Partner With Us?</h2>
              <p className="text-lg mb-8 text-white/90">
                If you run a high-quality stable and share our values, we'd love to hear from you
              </p>
              <a
                href="mailto:partnerships@pyraride.com"
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-white/90 transition-colors shadow-lg"
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
