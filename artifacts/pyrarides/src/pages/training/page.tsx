import { useState, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import ComingSoon from "@/components/shared/ComingSoon";
import { Link } from "wouter";
import NextImage from "@/shims/next-image";
import { MapPin, Loader2 } from "lucide-react";

const skillIcons: Record<string, string> = {
  BEGINNER: "🐴",
  INTERMEDIATE: "🏇",
  ADVANCED: "👑",
};

export default function TrainingPage() {
  const [academies, setAcademies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academies")
      .then((r) => r.json())
      .then((data) => {
        setAcademies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ComingSoon>
      <Navbar />

      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-black">
        <div className="absolute inset-0">
          <NextImage
            src="/hero-bg.webp"
            alt="Horse riding training at the Pyramids"
            fill
            priority
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#D4AF37]/50" />
            <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] font-semibold">Professional Training</span>
            <div className="h-px w-12 bg-[#D4AF37]/50" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-wide mb-6">
            PyraRides<br />
            <span className="font-semibold">Academy</span>
          </h1>
          <p className="text-white/60 max-w-xl text-base md:text-lg font-light">
            Master the art of riding under the guidance of certified captains. Multiple academies across Egypt.
          </p>
          <div className="flex items-center gap-8 mt-10 text-[10px] uppercase tracking-[0.2em] text-white/50">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />Certified Instructors</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />Arabian Horses</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />All Levels</div>
          </div>
        </div>
      </section>

      {academies.length > 0 ? (
        <>
          <section className="relative z-20 w-full bg-[#0a0a0a] py-24 md:py-32">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="text-center mb-20">
                <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-4">Our Locations</p>
                <h2 className="font-display text-3xl md:text-5xl font-light text-white tracking-wide">Training Academies</h2>
                <div className="w-12 h-px bg-[#D4AF37]/50 mx-auto mt-6" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {academies.map((academy) => (
                  <div key={academy.id} className="group border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <NextImage
                        src={academy.imageUrl || "/hero-bg.webp"}
                        alt={academy.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-[#D4AF37]/20 backdrop-blur-sm border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">{academy.location}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">{academy.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{academy.description}</p>
                      {academy.googleMapsUrl && (
                        <a href={academy.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[11px] text-[#D4AF37] hover:text-[#C49A2F] mb-6 transition-colors border border-[#D4AF37]/30 px-3 py-1.5 rounded-full uppercase tracking-widest bg-[#D4AF37]/5">
                          <MapPin className="w-3.5 h-3.5" /> Open Google Maps
                        </a>
                      )}
                      {academy.captain && (
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                            {academy.captain.profileImageUrl ? (
                              <NextImage src={academy.captain.profileImageUrl} alt={academy.captain.fullName || "Captain"} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                                {(academy.captain.fullName || "C")[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{academy.captain.fullName || "Captain"}</p>
                            <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest">Lead Instructor</p>
                          </div>
                        </div>
                      )}
                      <div className="space-y-3">
                        {(academy.programs || []).map((program: any) => (
                          <div key={program.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#D4AF37]/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{skillIcons[program.skillLevel] || "🐴"}</span>
                              <div>
                                <p className="text-white text-sm font-medium">{program.name}</p>
                                <p className="text-gray-500 text-xs">{program.totalSessions} sessions · {program.sessionDuration}hr each</p>
                              </div>
                            </div>
                            <p className="text-white text-sm font-semibold">EGP {Number(program.price).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      {academy._count?.enrollments > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400/70 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          {academy._count.enrollments} active trainee{academy._count.enrollments !== 1 ? "s" : ""}
                        </div>
                      )}
                      <Link href={`/training/${academy.id}`} className="block w-full mt-6 text-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold rounded-full">
                        View Programs & Enroll
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative z-20 w-full bg-black py-24 md:py-32">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-16">
                <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-4">Curriculum</p>
                <h2 className="font-display text-3xl md:text-4xl font-light text-white tracking-wide">What You'll Learn</h2>
                <div className="w-12 h-px bg-[#D4AF37]/50 mx-auto mt-4" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { icon: "🐴", title: "Proper Mounting", desc: "Safe mount & dismount technique" },
                  { icon: "🧘", title: "Balance & Posture", desc: "Core stability in the saddle" },
                  { icon: "🏜️", title: "Desert Navigation", desc: "Trail riding near the Pyramids" },
                  { icon: "🛁", title: "Horse Grooming", desc: "Care, feeding, and bonding" },
                  { icon: "🏇", title: "Gait Control", desc: "Walk, trot, canter, and gallop" },
                  { icon: "🛡️", title: "Safety Protocols", desc: "Emergency handling & awareness" },
                ].map((item) => (
                  <div key={item.title} className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#D4AF37]/20 transition-colors duration-300">
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="relative z-20 w-full bg-[#0a0a0a] py-32">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="text-5xl mb-6">🏇</div>
            <h2 className="font-display text-2xl text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400 mb-8">Our training academies are being set up. Check back soon.</p>
            <Link href="/contact" className="inline-block border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-white hover:text-black hover:border-white transition-colors duration-500 px-10 py-4 text-xs uppercase tracking-[0.2em] rounded-full">Register Interest</Link>
          </div>
        </section>
      )}

      <section className="relative z-20 w-full bg-gradient-to-b from-black via-[#050505] to-black py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-light text-white mb-6">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5E6B8]">Journey</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-10">From first-time riders to advanced equestrians, our certified captains will guide you every step of the way.</p>
          <Link href="/contact" className="inline-block bg-white text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:scale-105 transition-transform duration-300">
            Contact Us
          </Link>
        </div>
      </section>
    </ComingSoon>
  );
}
