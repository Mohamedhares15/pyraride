"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "@/shims/next-auth-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from '@/shims/next-navigation';
import { Link } from 'wouter';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Edit2,
  Trash2,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReviewModal from "@/components/shared/ReviewModal";
import CancelRescheduleModal from "@/components/shared/CancelRescheduleModal";
import CancelEnrollmentModal from "@/components/shared/CancelEnrollmentModal";
import NextImage from "@/shims/next-image";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "confirmed" | "completed" | "cancelled";
  stable: { name: string; location: string; imageUrl?: string; };
  horse: { name: string; imageUrls?: string[]; };
  hasReview?: boolean;
}

interface Enrollment {
  id: string;
  status: string;
  totalSessions: number;
  completedSessions: number;
  startDate: string;
  expiryDate: string;
  academy: { name: string; location: string; imageUrl: string | null; captain?: { fullName: string; phoneNumber?: string } };
  program: { name: string; skillLevel: string; totalSessions: number; sessionDuration: number; price: number };
  sessions: any[];
}

function RiderDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabQuery = searchParams?.get("tab") || "rides";

  const [activeTab, setActiveTab] = useState<"rides" | "training">(activeTabQuery as "rides" | "training");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelRescheduleModalOpen, setCancelRescheduleModalOpen] = useState(false);
  const [cancelRescheduleMode, setCancelRescheduleMode] = useState<"cancel" | "reschedule">("cancel");
  const [selectedEnrollmentToCancel, setSelectedEnrollmentToCancel] = useState<Enrollment | null>(null);
  const [cancelEnrollmentModalOpen, setCancelEnrollmentModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/"); return; }
    if (session.user?.role !== "rider") { router.push("/dashboard"); return; }
    fetchData();
  }, [session, status, router, activeTab]);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "rides") {
        const response = await fetch("/api/bookings");
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        const response = await fetch("/api/training/enrollments");
        if (!response.ok) throw new Error("Failed to fetch enrollments");
        const data = await response.json();
        setEnrollments(data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRenewCancelEnrollment = async (enrollmentId: string, action: "renew" | "cancel") => {
    try {
      const res = await fetch(`/api/training/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update enrollment");
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } catch {
      return "Invalid time";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "confirmed" || status === "active")
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1"><CheckCircle className="mr-1.5 h-3.5 w-3.5" />{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    if (status === "completed")
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"><CheckCircle className="mr-1.5 h-3.5 w-3.5" />Completed</Badge>;
    if (status === "cancelled")
      return <Badge className="bg-red-50 text-red-700 border-red-200 px-3 py-1"><XCircle className="mr-1.5 h-3.5 w-3.5" />Cancelled</Badge>;
    if (status === "expired")
      return <Badge className="bg-stone-50 text-stone-500 border-stone-200 px-3 py-1">Expired</Badge>;
    return null;
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b hairline bg-background/95 backdrop-blur-xl pt-[var(--header-total-height)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-8">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-1">Rider Portal</p>
            <h1 className="font-display text-3xl font-light md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex gap-8">
          <button
            onClick={() => { setActiveTab("rides"); router.push("/dashboard/rider?tab=rides", { scroll: false }); }}
            className={`pb-4 text-[11px] uppercase tracking-luxury relative transition-colors ${activeTab === 'rides' ? 'text-foreground' : 'text-ink-muted hover:text-foreground'}`}
          >
            My Rides
            {activeTab === 'rides' && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-foreground" />}
          </button>
          <button
            onClick={() => { setActiveTab("training"); router.push("/dashboard/rider?tab=training", { scroll: false }); }}
            className={`pb-4 text-[11px] uppercase tracking-luxury relative transition-colors ${activeTab === 'training' ? 'text-foreground' : 'text-ink-muted hover:text-foreground'}`}
          >
            My Training
            {activeTab === 'training' && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-foreground" />}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {isLoading ? (
          <div className="flex justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          </div>
        ) : error ? (
          <div className="border hairline bg-red-50 p-10 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500 opacity-60" />
            <h3 className="mb-2 font-display text-xl text-red-700">Failed to load</h3>
            <p className="mb-6 text-red-600/70 text-sm">{error}</p>
            <Button onClick={fetchData} variant="outline" className="border-foreground/20 text-foreground">Try Again</Button>
          </div>
        ) : activeTab === "rides" ? (
          /* Bookings Tab */
          bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center border hairline bg-surface p-16 text-center"
            >
              <div className="mb-6 text-5xl">🐴</div>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">No bookings yet</p>
              <h2 className="mb-3 font-display text-3xl font-light">Start Your Journey</h2>
              <p className="mb-8 max-w-md text-ink-soft text-sm">Explore our curated selection of premium stables across the Giza Plateau.</p>
              <Link href="/stables" className="inline-block bg-foreground text-background px-10 py-4 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors">
                Explore Stables
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking, index) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <div className="border hairline bg-surface transition-colors hover:bg-surface-elevated">
                    <div className="flex flex-col md:flex-row">
                      <div className={`h-1 w-full md:h-auto md:w-1 ${booking.status === 'confirmed' ? 'bg-emerald-400' : booking.status === 'completed' ? 'bg-blue-400' : 'bg-red-300'}`} />
                      <div className="flex flex-1 flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between md:justify-start md:gap-4">
                            <div>
                              <h3 className="font-display text-xl font-light mb-1">{booking.stable.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-ink-soft">
                                <span>{booking.horse.name}</span><span>·</span><span className="capitalize">{booking.stable.location}</span>
                              </div>
                            </div>
                            <div className="md:hidden">{getStatusBadge(booking.status)}</div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-2 border hairline bg-background px-3 py-2 text-ink-soft">
                              <Calendar className="h-3.5 w-3.5 text-foreground opacity-50" />
                              <span>{formatDate(booking.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 border hairline bg-background px-3 py-2 text-ink-soft">
                              <Clock className="h-3.5 w-3.5 text-foreground opacity-50" />
                              <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 border-t hairline pt-4 md:items-end md:border-t-0 md:pt-0">
                          <div className="hidden md:block">{getStatusBadge(booking.status)}</div>
                          <div className="flex items-center justify-between gap-8 md:justify-end">
                            <div className="text-left md:text-right">
                              <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-0.5">Total</p>
                              <span className="font-display text-xl font-light">EGP {Number(booking.totalPrice || 0).toFixed(0)}</span>
                            </div>
                            <div className="flex gap-2">
                              {booking.status === "completed" && !booking.hasReview && (
                                <Button size="sm" onClick={() => { setSelectedBooking(booking); setReviewModalOpen(true); }} variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                                  <Star className="mr-2 h-3.5 w-3.5" />Review
                                </Button>
                              )}
                              {booking.status === "confirmed" && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking); setCancelRescheduleMode("reschedule"); setCancelRescheduleModalOpen(true); }} className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                                    <Edit2 className="mr-2 h-3.5 w-3.5" />Reschedule
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking); setCancelRescheduleMode("cancel"); setCancelRescheduleModalOpen(true); }} className="border-red-200 text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Training Tab */
          enrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center border hairline bg-surface p-16 text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center border hairline bg-surface-elevated">
                <TrendingUp className="h-7 w-7 text-foreground opacity-40" />
              </div>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">No active training</p>
              <h2 className="mb-3 font-display text-3xl font-light">Begin Your Training</h2>
              <p className="mb-8 max-w-md text-ink-soft text-sm">Join PyraRides Academy and start your professional horse riding journey today.</p>
              <Link href="/training" className="inline-block bg-foreground text-background px-10 py-4 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors">
                Explore Academies
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {enrollments.map((enr, idx) => {
                const progressPercentage = Math.round((enr.completedSessions / enr.totalSessions) * 100);
                return (
                  <motion.div key={enr.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="border hairline bg-surface overflow-hidden">
                    {/* Training Header */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-6">
                        <div className="hidden md:block relative w-20 h-20 overflow-hidden border hairline flex-shrink-0">
                          <NextImage src={enr.academy.imageUrl || "/hero-bg.webp"} alt={enr.academy.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {getStatusBadge(enr.status)}
                            <span className="text-[10px] uppercase tracking-luxury text-ink-muted border hairline px-2 py-0.5">{enr.program.skillLevel}</span>
                          </div>
                          <h3 className="font-display text-2xl font-light mb-1">{enr.program.name}</h3>
                          <p className="text-ink-soft text-sm">{enr.academy.name} · {enr.academy.location}</p>
                          <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-0.5">Duration</p>
                            <span className="text-sm text-foreground">{formatDate(enr.startDate)} — {formatDate(enr.expiryDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-between gap-4">
                        <div className="w-full md:w-52">
                          <div className="flex justify-between text-[10px] uppercase tracking-luxury mb-2">
                            <span className="text-ink-muted">Progress</span>
                            <span className="text-foreground">{enr.completedSessions} / {enr.totalSessions} sessions</span>
                          </div>
                          <div className="h-px w-full bg-foreground/10 overflow-hidden">
                            <div className="h-full bg-foreground transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {enr.status === "active" && enr.completedSessions < 2 && (
                            <button
                              onClick={() => { setSelectedEnrollmentToCancel(enr); setCancelEnrollmentModalOpen(true); }}
                              className="text-[10px] uppercase tracking-luxury text-ink-muted hover:text-red-600 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {(enr.status === "completed" || enr.status === "expired") && (
                            <button
                              onClick={() => handleRenewCancelEnrollment(enr.id, "renew")}
                              className="bg-foreground text-background px-6 py-2 text-[10px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors"
                            >
                              Renew Program
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sessions Grid */}
                    <div className="bg-surface-elevated p-6 md:p-8 border-t hairline">
                      <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">Schedule</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {enr.sessions.map((session) => (
                          <div key={session.id} className="p-4 border hairline bg-background">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] uppercase tracking-luxury text-foreground opacity-60">Session {session.sessionNumber}</span>
                              {session.status === "completed" ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : session.status === "cancelled" ? (
                                <XCircle className="w-4 h-4 text-red-400" />
                              ) : session.status === "rescheduled" ? (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-ink-muted" />
                              )}
                            </div>
                            <p className="text-foreground text-sm mb-0.5">{formatDate(session.date)}</p>
                            <p className="text-ink-muted text-xs">{session.startTime} – {session.endTime}</p>
                            {session.review && (
                              <div className="mt-3 pt-3 border-t hairline">
                                <div className="flex items-center gap-0.5 mb-1 text-foreground opacity-50">
                                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                </div>
                                <p className="text-[10px] text-ink-soft italic line-clamp-2">"{session.review.comment}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>

      {selectedBooking && (
        <ReviewModal open={reviewModalOpen} onOpenChange={setReviewModalOpen} bookingId={selectedBooking.id} stableName={selectedBooking.stable.name} horseName={selectedBooking.horse.name} onReviewSubmitted={() => fetchData()} />
      )}
      {selectedBooking && (
        <CancelRescheduleModal open={cancelRescheduleModalOpen} onOpenChange={setCancelRescheduleModalOpen} booking={selectedBooking} mode={cancelRescheduleMode} />
      )}
      <CancelEnrollmentModal
        open={cancelEnrollmentModalOpen}
        onOpenChange={setCancelEnrollmentModalOpen}
        enrollment={selectedEnrollmentToCancel}
        onConfirm={async (enrollmentId) => {
          try {
            const res = await fetch(`/api/training/enrollments/${enrollmentId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "cancel" }),
            });
            if (res.ok) fetchData();
            else alert("Failed to cancel enrollment");
          } catch (e) {
            alert("Something went wrong");
          }
        }}
      />
    </div>
  );
}

export default function RiderDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading…</span>
        </div>
      </div>
    }>
      <RiderDashboardContent />
    </Suspense>
  );
}
