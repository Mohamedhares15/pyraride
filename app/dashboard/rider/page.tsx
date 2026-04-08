"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReviewModal from "@/components/shared/ReviewModal";
import CancelRescheduleModal from "@/components/shared/CancelRescheduleModal";
import Image from "next/image";

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
  academy: { name: string; location: string; imageUrl: string | null };
  program: { name: string; skillLevel: string; totalSessions: number; sessionDuration: number; price: number };
  sessions: any[];
}

export default function RiderDashboard() {
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

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/"); return; }
    if (session.user.role !== "rider") { router.push("/dashboard"); return; }

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
    if (action === "cancel" && !confirm("Are you sure you want to cancel this training enrollment?")) return;
    
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
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1"><CheckCircle className="mr-1.5 h-3.5 w-3.5" />{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    if (status === "completed") 
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1"><CheckCircle className="mr-1.5 h-3.5 w-3.5" />Completed</Badge>;
    if (status === "cancelled") 
      return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1"><XCircle className="mr-1.5 h-3.5 w-3.5" />Cancelled</Badge>;
    if (status === "expired") 
      return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 px-3 py-1">Expired</Badge>;
    return null;
  };

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl pt-[var(--header-total-height)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-8">
          <div>
            <h1 className="font-display text-3xl font-light tracking-tight text-white md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex gap-8">
          <button 
            onClick={() => { setActiveTab("rides"); router.push("/dashboard/rider?tab=rides", { scroll: false }); }}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest relative transition-colors ${activeTab === 'rides' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'}`}
          >
            My Rides
            {activeTab === 'rides' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#D4AF37]" />}
          </button>
          <button 
            onClick={() => { setActiveTab("training"); router.push("/dashboard/rider?tab=training", { scroll: false }); }}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest relative transition-colors ${activeTab === 'training' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'}`}
          >
            My Training
            {activeTab === 'training' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#D4AF37]" />}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <Card className="border-red-500/20 bg-red-500/5 p-8 text-center"><AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" /><h3 className="mb-2 text-lg font-semibold text-red-500">Failed to load</h3><p className="mb-6 text-neutral-400">{error}</p><Button onClick={fetchData} variant="outline" className="border-red-500/20 hover:bg-red-500/10">Try Again</Button></Card>
        ) : activeTab === "rides" ? (
          /* Bookings Tab */
          bookings.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-sm">
              <div className="mb-6 rounded-full bg-white/5 p-6 ring-1 ring-white/10"><span className="text-4xl">🐴</span></div>
              <h2 className="mb-3 font-display text-2xl font-light text-white">No Bookings Yet</h2>
              <p className="mb-8 max-w-md text-neutral-400">Start your journey by exploring our curated selection of premium stables.</p>
              <Button asChild size="lg" className="bg-[#D4AF37] text-black hover:bg-[#C49A2F] uppercase tracking-[0.2em] font-semibold rounded-full"><Link href="/stables">Explore Stables</Link></Button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking, index) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:bg-white/[0.04]">
                    <div className="flex flex-col md:flex-row">
                      <div className={`h-1.5 w-full md:h-auto md:w-1.5 ${booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between md:justify-start md:gap-4">
                            <div>
                              <h3 className="font-display text-xl font-bold text-white mb-2">{booking.stable.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <span>{booking.horse.name}</span><span>•</span><span className="capitalize">{booking.stable.location}</span>
                              </div>
                            </div>
                            <div className="md:hidden">{getStatusBadge(booking.status)}</div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-300">
                            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"><Calendar className="h-4 w-4 text-[#D4AF37]" /><span>{formatDate(booking.startTime)}</span></div>
                            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"><Clock className="h-4 w-4 text-[#D4AF37]" /><span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 border-t border-white/10 pt-4 md:items-end md:border-t-0 md:pt-0">
                          <div className="hidden md:block">{getStatusBadge(booking.status)}</div>
                          <div className="flex items-center justify-between gap-8 md:justify-end">
                            <div className="text-left md:text-right">
                              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Total</p>
                              <span className="text-xl font-light text-white">EGP {booking.totalPrice.toFixed(0)}</span>
                            </div>
                            <div className="flex gap-2">
                              {booking.status === "completed" && !booking.hasReview && <Button size="sm" onClick={() => { setSelectedBooking(booking); setReviewModalOpen(true); }} className="bg-white/10 text-white hover:bg-white/20"><Star className="mr-2 h-3.5 w-3.5" />Review</Button>}
                              {booking.status === "confirmed" && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking); setCancelRescheduleMode("reschedule"); setCancelRescheduleModalOpen(true); }} className="border-white/10 bg-transparent text-white hover:bg-white/5"><Edit2 className="mr-2 h-3.5 w-3.5" />Reschedule</Button>
                                  <Button size="sm" variant="destructive" onClick={() => { setSelectedBooking(booking); setCancelRescheduleMode("cancel"); setCancelRescheduleModalOpen(true); }} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-sm">
              <div className="mb-6 rounded-full bg-white/5 p-6 ring-1 ring-white/10"><TrendingUp className="h-8 w-8 text-[#D4AF37]" /></div>
              <h2 className="mb-3 font-display text-2xl font-light text-white">No Active Training</h2>
              <p className="mb-8 max-w-md text-neutral-400">Join PyraRides Academy and start your professional horse riding journey today.</p>
              <Button asChild size="lg" className="bg-[#D4AF37] text-black hover:bg-[#C49A2F] uppercase tracking-[0.2em] font-semibold rounded-full"><Link href="/training">Explore Academies</Link></Button>
            </motion.div>
          ) : (
            <div className="grid gap-8">
              {enrollments.map((enr, idx) => {
                const progressPercentage = Math.round((enr.completedSessions / enr.totalSessions) * 100);
                
                return (
                  <motion.div key={enr.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    {/* Training Header */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-6">
                        <div className="hidden md:block relative w-24 h-24 rounded-xl overflow-hidden shadow-lg border border-white/10">
                          <Image src={enr.academy.imageUrl || "/hero-bg.webp"} alt={enr.academy.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(enr.status)}
                            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">{enr.program.skillLevel}</span>
                          </div>
                          <h3 className="font-display text-2xl text-white mb-1">{enr.program.name}</h3>
                          <p className="text-gray-400 text-sm">{enr.academy.name} • {enr.academy.location}</p>
                          
                          <div className="mt-4 flex items-center gap-6">
                             <div className="text-sm">
                               <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Duration</p>
                               <span className="text-white">{formatDate(enr.startDate)} — {formatDate(enr.expiryDate)}</span>
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-between">
                         <div className="mb-6 md:mb-0 w-full md:w-48">
                           <div className="flex justify-between text-xs mb-2">
                             <span className="text-gray-400">Progress</span>
                             <span className="text-[#D4AF37] font-medium">{enr.completedSessions} / {enr.totalSessions} Sessions</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-[#D4AF37]" style={{ width: `${progressPercentage}%` }} />
                           </div>
                         </div>

                         <div className="flex gap-3">
                           {enr.status === "active" && (
                             <button onClick={() => handleRenewCancelEnrollment(enr.id, "cancel")} className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors">Cancel</button>
                           )}
                           {(enr.status === "completed" || enr.status === "expired") && (
                             <button onClick={() => handleRenewCancelEnrollment(enr.id, "renew")} className="bg-[#D4AF37] text-black px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-transform">Renew Program</button>
                           )}
                         </div>
                      </div>
                    </div>

                    {/* Sessions Grid */}
                    <div className="bg-black/50 p-6 md:p-8 border-t border-white/5">
                      <h4 className="font-display text-lg text-white mb-6">Schedule</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {enr.sessions.map((session) => (
                          <div key={session.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] relative group">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-semibold">Session {session.sessionNumber}</span>
                              {session.status === "completed" ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : session.status === "cancelled" ? (
                                <XCircle className="w-4 h-4 text-red-400" />
                              ) : session.status === "rescheduled" ? (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                            <p className="text-white text-sm mb-1">{formatDate(session.date)}</p>
                            <p className="text-gray-400 text-xs">{session.startTime} - {session.endTime}</p>
                            
                            {/* Review Tooltip */}
                            {session.review && (
                              <div className="mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-1 mb-1 text-[#D4AF37]">
                                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                </div>
                                <p className="text-[10px] text-gray-300 italic line-clamp-2">"{session.review.comment}"</p>
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
    </div>
  );
}


