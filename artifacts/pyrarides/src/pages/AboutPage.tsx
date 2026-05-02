import { MapPin, Shield, Users, Award, Heart, Target, Globe, CheckCircle, Star, Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function AboutPage() {
  const team = [
    { name: "Mohamed Hares", role: "Founder & CEO", bio: "Passionate about connecting travelers with authentic Egyptian experiences.", linkedin: "https://www.linkedin.com/in/mohamed-hares-015b92234" },
    { name: "Seif Askalany", role: "Co-Founder", bio: "Driven by a vision to create seamless digital experiences.", linkedin: "https://www.linkedin.com/in/seif-askalany-5811a3384" }
  ];
  const milestones = [
    { year: "2024", title: "PyraRides Founded", description: "Launched with a mission to digitize the pyramid horse riding experience." },
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
      <Navbar />
      <div className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <img src="/hero-bg.webp" alt="Pyramids" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="font-sans text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">Transforming Pyramid <br /><span className="text-[#2D4A6E]">Horse Riding</span></h1>
          <p className="mt-4 text-xl text-white/90 font-light max-w-2xl">The Pyramids, Unforgettable. The Ride, Uncomplicated.</p>
        </div>
      </div>

      <div className="border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="space-y-2 group">
                  <div className="p-3 rounded-full bg-[#2D4A6E]/10 w-fit mx-auto"><Icon className="h-6 w-6 text-[#2D4A6E]" /></div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 md:px-8 space-y-24">
        <section>
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Story</h2></div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg text-white/80 leading-relaxed">
              <p>PyraRides was founded with a simple yet powerful vision: to bring trust, transparency, and technology to one of the world's most iconic experiences—horse riding at the Pyramids of Giza.</p>
              <p>For too long, visitors faced uncertainty with haggling, unverified operators, and safety concerns. We saw an opportunity to change that. By partnering with only the most reputable, ethical stables, we've created a platform where safety and quality are guaranteed.</p>
            </div>
            <Card className="overflow-hidden border-white/10 bg-white/5">
              <div className="aspect-square flex items-center justify-center p-8 text-center bg-gradient-to-br from-[#2D4A6E]/20 to-black">
                <div><Globe className="h-20 w-20 mx-auto mb-6 text-[#2D4A6E]" /><p className="text-2xl font-bold text-white mb-2">Connecting Cultures</p><p className="text-white/60">Through the Magic of Horse Riding</p></div>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-[#2D4A6E]/30 bg-gradient-to-br from-[#2D4A6E]/10 to-black">
              <CardContent className="pt-8 pb-8"><Target className="h-12 w-12 text-[#2D4A6E] mb-6" /><h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3><p className="text-white/70 text-lg leading-relaxed">To provide travelers with <strong>safe, authentic, and unforgettable</strong> horse riding experiences at Egypt's most iconic landmarks, while supporting local communities and championing <strong>animal welfare</strong>.</p></CardContent>
            </Card>
            <Card className="border border-[#2D4A6E]/30 bg-gradient-to-br from-[#2D4A6E]/10 to-black">
              <CardContent className="pt-8 pb-8"><Globe className="h-12 w-12 text-[#2D4A6E] mb-6" /><h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3><p className="text-white/70 text-lg leading-relaxed">To become the <strong>global standard</strong> for adventure tourism booking platforms, expanding to iconic destinations worldwide while maintaining our commitment to <strong>trust, quality, and sustainability</strong>.</p></CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Core Values</h2></div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Trust & Safety", desc: "Every stable undergoes rigorous verification. We personally inspect facilities and validate safety protocols." },
              { icon: Heart, title: "Animal Welfare", desc: "Horse health comes first. We monitor welfare standards continuously." },
              { icon: Award, title: "Excellence", desc: "We only work with the top 10% of stables. If it's on PyraRides, it's guaranteed to be exceptional." },
              { icon: MapPin, title: "Transparency", desc: "Real reviews. Clear pricing. No hidden fees. Honest communication at every step." },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <Card key={idx} className="p-6 bg-white/5 border-white/10 hover:border-[#2D4A6E]/50 transition-all">
                <Icon className="mb-4 h-10 w-10 text-[#2D4A6E]" />
                <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-white/60">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Meet Our Founders</h2></div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <Card key={idx} className="overflow-hidden bg-white/5 border-white/10 hover:border-[#2D4A6E]/50 transition-all group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="relative w-full sm:w-40 h-48 sm:h-auto bg-gradient-to-br from-[#2D4A6E]/20 to-black flex-shrink-0 flex items-center justify-center"><Users className="h-16 w-16 text-[#2D4A6E]/40" /></div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <h3 className="text-xl font-bold mb-1 text-white">{member.name}</h3>
                      <p className="text-[#2D4A6E] font-semibold mb-3">{member.role}</p>
                      <p className="text-sm text-white/60 mb-4">{member.bio}</p>
                      <a href={member.linkedin} className="inline-flex items-center gap-2 text-sm text-white hover:text-[#2D4A6E] transition-colors" target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" />Connect on LinkedIn</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
