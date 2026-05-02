import { useState, useEffect } from "react";
import { Link } from "wouter";
import { MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import ComingSoon from "@/components/shared/ComingSoon";
import Footer from "@/components/shared/Footer";

interface Academy {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  captain?: { fullName: string; profileImageUrl?: string; bio?: string };
  programs?: Array<{ id: string; name: string; level: string; price: number }>;
  _count?: { enrollments: number };
}

export default function TrainingPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academies?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAcademies(data);
        else if (data.academies) setAcademies(data.academies);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ComingSoon>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
          <img src="/hero-bg.webp" alt="Training" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black" />
          <div className="relative z-10 text-center px-4">
            <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4">PyraRides Academy</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Horse Riding Training</h1>
            <p className="text-white/60 max-w-xl mx-auto">Master the art of horse riding at the Pyramids. Professional training with certified captains.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" /></div>
          ) : academies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4">Coming Soon</p>
              <h2 className="text-3xl font-light text-white">Training academies are being onboarded.</h2>
              <p className="text-white/60 mt-4">Check back soon for professional training programs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {academies.map((academy) => (
                <div key={academy.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-colors group">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={academy.imageUrl || "/hero-bg.webp"} alt={academy.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{academy.name}</h3>
                    {academy.location && (
                      <div className="flex items-center gap-1 text-white/60 text-sm mb-3"><MapPin className="h-4 w-4" /><span>{academy.location}</span></div>
                    )}
                    <p className="text-white/60 text-sm mb-4 line-clamp-3">{academy.description}</p>
                    {academy.programs && academy.programs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {academy.programs.slice(0, 3).map((prog) => (
                          <span key={prog.id} className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-1 rounded-full">{prog.name}</span>
                        ))}
                      </div>
                    )}
                    <Link href={`/training/${academy.id}`} className="inline-block bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#D4AF37]/90 transition-colors">Learn More</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ComingSoon>
  );
}
