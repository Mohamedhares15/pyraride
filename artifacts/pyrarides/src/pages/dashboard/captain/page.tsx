"use client";

import { useState, useEffect } from "react";
import NextImage from "@/shims/next-image";
import { format } from "date-fns";

export default function CaptainDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [priceChanging, setPriceChanging] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = () => {
    fetch("/api/captain/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!confirm("Mark this session as completed?")) return;
    
    const res = await fetch(`/api/captain/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });

    if (res.ok) fetchDashboard();
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (data?.error) {
    return <div className="p-8 text-center text-red-400">{data.error}</div>;
  }

  return (
    <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-white">Captain Dashboard</h1>
            <p className="text-gray-400">{data.academy.name}</p>
          </div>
          <button 
            onClick={() => setPriceChanging(true)}
            className="border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-colors self-start md:self-auto"
          >
            Request Price Change
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Trainees", value: data.stats.activeTrainees, icon: "👥" },
            { label: "Completed Sessions", value: data.stats.completedSessions, icon: "✅" },
            { label: "Revenue (Month)", value: `EGP ${data.stats.revenueThisMonth}`, icon: "💰" },
            { label: "Total Enrollments", value: data.stats.totalEnrollments, icon: "🎓" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl text-white font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Today's Sessions */}
          <div className="space-y-4">
            <h2 className="text-xl font-display text-[#D4AF37]">Today's Sessions</h2>
            {data.todaySessions.length === 0 ? (
              <p className="text-gray-500 p-6 border border-white/5 bg-white/[0.02] rounded-2xl text-center">
                No sessions scheduled for today.
              </p>
            ) : (
              data.todaySessions.map((session: any) => (
                <div key={session.id} className="p-5 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 relative">
                      {session.enrollment.rider.profileImageUrl ? (
<NextImage src={session.enrollment.rider.profileImageUrl} alt="Rider" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">{session.enrollment.rider.fullName[0]}</div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.enrollment.rider.fullName}</p>
                      <p className="text-xs text-[#D4AF37]">
                        {session.startTime} - {session.endTime} • Session {session.sessionNumber}
                      </p>
                    </div>
                  </div>
                  {session.status === "scheduled" && (
                    <button 
                      onClick={() => handleCompleteSession(session.id)}
                      className="bg-[#D4AF37] text-black px-4 py-2 rounded-full text-xs font-semibold"
                    >
                      Complete
                    </button>
                  )}
                  {session.status === "completed" && !session.review && (
                    <button 
                      onClick={() => setReviewing(session.id)}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-full text-xs"
                    >
                      Write Review
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <h2 className="text-xl font-display text-white">Upcoming (Next 7 Days)</h2>
            {data.upcomingSessions.length === 0 ? (
              <p className="text-gray-500 p-6 border border-white/5 bg-white/[0.02] rounded-2xl text-center">
                No upcoming sessions.
              </p>
            ) : (
              data.upcomingSessions.map((session: any) => (
                <div key={session.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{format(new Date(session.date), "MMM")}</span>
                    <span className="text-xl text-white">{format(new Date(session.date), "d")}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{session.enrollment.rider.fullName}</p>
                    <p className="text-xs text-gray-400 mb-2">{session.enrollment.program.name} (Session {session.sessionNumber})</p>
                    <div className="flex gap-2">
                       <button onClick={() => setRescheduling(session.id)} className="text-[10px] uppercase tracking-widest text-[#D4AF37] hover:underline">Reschedule</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-300">{session.startTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
