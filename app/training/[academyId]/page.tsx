"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Program {
  id: string;
  name: string;
  description: string;
  skillLevel: string;
  price: number;
  totalSessions: number;
  sessionDuration: number;
  validityDays: number;
  availableDays: string[];
  startTime: string | null;
}

interface AcademyDetail {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  imageUrl: string | null;
  captain: { fullName: string | null; profileImageUrl: string | null; bio: string | null };
  programs: Program[];
  _count: { enrollments: number };
}

export default function AcademyDetailPage({ params }: { params: { academyId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [academy, setAcademy] = useState<AcademyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/academies/${params.academyId}`)
      .then((res) => res.json())
      .then(setAcademy)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.academyId]);

  const handleEnroll = async (programId: string) => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    setEnrolling(programId);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);

      const res = await fetch("/api/training/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          startDate: startDate.toISOString().split("T")[0],
        }),
      });

      if (res.ok) {
        router.push("/dashboard/rider?tab=training");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to enroll");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setEnrolling(null);
    }
  };

  const skillIcons: Record<string, string> = {
    BEGINNER: "🐴",
    INTERMEDIATE: "🏇",
    ADVANCED: "👑",
  };

  const skillColors: Record<string, string> = {
    BEGINNER: "border-green-500/20 bg-green-500/5",
    INTERMEDIATE: "border-blue-500/20 bg-blue-500/5",
    ADVANCED: "border-purple-500/20 bg-purple-500/5",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!academy || "error" in academy) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">Academy Not Found</h1>
        <Link href="/training" className="text-[#D4AF37] hover:underline">
          ← Back to Training
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={academy.imageUrl || "/hero-bg.webp"}
          alt={academy.name}
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-12 px-4 text-center">
          <span className="bg-[#D4AF37]/20 backdrop-blur-sm border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4">
            {academy.location}
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-3">
            {academy.name}
          </h1>
          <p className="text-white/60 max-w-lg">{academy.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        {/* Captain */}
        <div className="flex items-center gap-4 mb-12 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 shrink-0">
            {academy.captain.profileImageUrl ? (
              <Image src={academy.captain.profileImageUrl} alt="Captain" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xl font-bold">
                {(academy.captain.fullName || "C")[0]}
              </div>
            )}
          </div>
          <div>
            <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mb-1">Lead Captain</p>
            <p className="text-white text-lg font-medium">{academy.captain.fullName}</p>
            {academy.captain.bio && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{academy.captain.bio}</p>
            )}
          </div>
        </div>

        {/* Programs */}
        <h2 className="font-display text-2xl text-white mb-8">Training Programs</h2>

        <div className="grid gap-6">
          {academy.programs.map((program) => (
            <div
              key={program.id}
              className={`rounded-2xl border ${skillColors[program.skillLevel] || "border-white/10 bg-white/[0.02]"} p-6 md:p-8`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{skillIcons[program.skillLevel]}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{program.name}</h3>
                      <p className="text-gray-400 text-xs uppercase tracking-widest">
                        {program.skillLevel} Level
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{program.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Sessions</p>
                      <p className="text-white font-medium">{program.totalSessions} sessions</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-white font-medium">{program.sessionDuration}hr each</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Valid For</p>
                      <p className="text-white font-medium">{program.validityDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Schedule</p>
                      <p className="text-white font-medium text-xs">
                        {program.availableDays.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:text-right shrink-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Price</p>
                  <p className="text-3xl font-light text-white mb-4">
                    EGP {Number(program.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleEnroll(program.id)}
                    disabled={enrolling === program.id}
                    className="w-full md:w-auto bg-[#D4AF37] hover:bg-[#C49A2F] text-black px-8 py-3 text-xs uppercase tracking-[0.2em] font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling === program.id ? "Enrolling..." : "Enroll Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/training" className="text-[#D4AF37] text-xs uppercase tracking-widest hover:underline">
            ← Back to All Academies
          </Link>
        </div>
      </div>
    </div>
  );
}
