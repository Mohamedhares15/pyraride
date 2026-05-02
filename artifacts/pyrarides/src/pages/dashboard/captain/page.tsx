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
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading…</span>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-8 text-center border hairline bg-red-50">
        <p className="text-red-700 text-sm">{data.error}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20 bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-1">Captain Portal</p>
            <h1 className="font-display text-3xl font-light">Captain Dashboard</h1>
            <p className="text-ink-soft text-sm mt-1">{data.academy.name}</p>
          </div>
          <button
            onClick={() => setPriceChanging(true)}
            className="border hairline text-foreground hover:bg-foreground hover:text-background px-6 py-2.5 text-[11px] tracking-luxury uppercase transition-colors self-start md:self-auto"
          >
            Request Price Change
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Trainees", value: data.stats.activeTrainees },
            { label: "Completed Sessions", value: data.stats.completedSessions },
            { label: "Revenue (Month)", value: `EGP ${data.stats.revenueThisMonth}` },
            { label: "Total Enrollments", value: data.stats.totalEnrollments },
          ].map((stat, i) => (
            <div key={i} className="border hairline bg-surface p-6">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-2">{stat.label}</p>
              <p className="font-display text-2xl font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Today's Sessions */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-luxury text-ink-muted">Today's Sessions</p>
            {data.todaySessions.length === 0 ? (
              <div className="border hairline bg-surface p-8 text-center">
                <p className="text-ink-muted text-sm">No sessions scheduled for today.</p>
              </div>
            ) : (
              data.todaySessions.map((session: any) => (
                <div key={session.id} className="border hairline bg-surface p-5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 overflow-hidden border hairline relative flex-shrink-0">
                      {session.enrollment.rider.profileImageUrl ? (
                        <NextImage src={session.enrollment.rider.profileImageUrl} alt="Rider" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-elevated font-display text-lg text-foreground">
                          {session.enrollment.rider.fullName?.[0] ?? "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{session.enrollment.rider.fullName}</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {session.startTime} – {session.endTime} · Session {session.sessionNumber}
                      </p>
                    </div>
                  </div>
                  {session.status === "scheduled" && (
                    <button
                      onClick={() => handleCompleteSession(session.id)}
                      className="bg-foreground text-background px-5 py-2 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  {session.status === "completed" && !session.review && (
                    <button
                      onClick={() => setReviewing(session.id)}
                      className="border hairline text-foreground px-5 py-2 text-[11px] uppercase tracking-luxury hover:bg-foreground hover:text-background transition-colors"
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
            <p className="text-[11px] uppercase tracking-luxury text-ink-muted">Upcoming (Next 7 Days)</p>
            {data.upcomingSessions.length === 0 ? (
              <div className="border hairline bg-surface p-8 text-center">
                <p className="text-ink-muted text-sm">No upcoming sessions.</p>
              </div>
            ) : (
              data.upcomingSessions.map((session: any) => (
                <div key={session.id} className="border hairline bg-surface p-5 flex gap-4">
                  <div className="w-14 h-14 border hairline bg-surface-elevated flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] uppercase tracking-luxury text-ink-muted">{format(new Date(session.date), "MMM")}</span>
                    <span className="font-display text-xl font-light">{format(new Date(session.date), "d")}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{session.enrollment.rider.fullName}</p>
                    <p className="text-xs text-ink-soft mb-2">{session.enrollment.program.name} (Session {session.sessionNumber})</p>
                    <button
                      onClick={() => setRescheduling(session.id)}
                      className="text-[10px] uppercase tracking-luxury text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
                    >
                      Reschedule
                    </button>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-ink-soft">{session.startTime}</p>
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
