"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/shims/next-auth-react";
import { motion } from "framer-motion";
import { useRouter } from '@/shims/next-navigation';
import { Link } from 'wouter';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CancelRescheduleModal from "@/components/shared/CancelRescheduleModal";
import RiderReviewModal from "@/components/shared/RiderReviewModal";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  commission: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  horse: { name: string; };
  rider: { id: string; fullName: string | null; email: string; };
  riderReview?: { id: string; } | null;
}

interface Stable {
  id: string;
  name: string;
  location: string;
  status: string;
  _count: { bookings: number; horses: number; };
}

export default function StableOwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stable, setStable] = useState<Stable | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalEarnings: 0, upcomingBookings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelRescheduleModalOpen, setCancelRescheduleModalOpen] = useState(false);
  const [cancelRescheduleMode, setCancelRescheduleMode] = useState<"cancel" | "reschedule">("cancel");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [activeView, setActiveView] = useState<"stable" | "academy">("stable");
  const [academyAssignment, setAcademyAssignment] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "stable_owner") {
      router.push("/dashboard");
      return;
    }
    fetch("/api/system/auto-complete-bookings", { method: "POST" })
      .catch((err) => console.error("Failed to auto-complete bookings:", err));
    fetchDashboardData();
  }, [session, status, router]);

  async function fetchDashboardData() {
    try {
      const [captainRes, stablesRes] = await Promise.all([
        fetch("/api/captain/dashboard").catch(() => null),
        fetch("/api/stables?ownerOnly=true").catch(() => null)
      ]);

      let hasAcademy = false;
      if (captainRes && captainRes.ok) {
        const data = await captainRes.json();
        if (data && !data.error) { setAcademyAssignment(data); hasAcademy = true; }
      }

      let ownerStable = null;
      if (stablesRes && stablesRes.ok) {
        const stablesData = await stablesRes.json();
        ownerStable = stablesData.stables?.[0];
      }

      if (!ownerStable && !hasAcademy) {
        setError("Dashboard restricted. Please register a stable or be assigned to an academy first.");
        setIsLoading(false);
        return;
      }

      if (ownerStable) {
        setStable({
          id: ownerStable.id, name: ownerStable.name, location: ownerStable.location,
          status: ownerStable.status || "approved",
          _count: { bookings: ownerStable.totalBookings || 0, horses: ownerStable.horseCount || 0 },
        });

        const bookingsRes = await fetch(`/api/stables/${ownerStable.id}/bookings`);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          const fetchedBookings = bookingsData.bookings || [];
          setBookings(fetchedBookings);
          const totalBookings = fetchedBookings.length;
          const totalEarnings = fetchedBookings
            .filter((b: Booking) => b.status === "completed")
            .reduce((sum: number, b: Booking) => sum + (parseFloat(b.totalPrice.toString()) - parseFloat(b.commission.toString())), 0);
          const upcoming = fetchedBookings.filter(
            (b: Booking) => b.status === "confirmed" && new Date(b.startTime) > new Date()
          ).length;
          setStats({ totalBookings, totalEarnings, upcomingBookings: upcoming });
        }
      } else if (hasAcademy) {
        setActiveView("academy");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case "completed": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      case "cancelled": return <Badge className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default: return null;
    }
  };

  if (status === "loading" || isLoading) {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b hairline bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-5 flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Stable Owner Portal</p>
              <h1 className="font-display text-3xl md:text-4xl font-light">
                Stable Dashboard
              </h1>
              <p className="mt-2 text-ink-soft text-sm">Manage your stable and track bookings</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                <Link href="/dashboard/stable/horses">
                  <Plus className="mr-2 h-4 w-4" />Manage Horses
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                <Link href="/dashboard/stable/schedule">
                  <Calendar className="mr-2 h-4 w-4" />Manage Schedule
                </Link>
              </Button>
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90 transition-colors">
                <Link href="/dashboard/stable/manage">
                  <Settings className="mr-2 h-4 w-4" />Manage Stable
                </Link>
              </Button>
            </div>
          </div>

          {/* Dual-Role Tab Switcher */}
          {academyAssignment && (
            <div className="mt-6 flex gap-1 border hairline self-start p-1">
              <button
                onClick={() => setActiveView("stable")}
                className={`px-6 py-2 text-[11px] uppercase tracking-luxury transition-all ${
                  activeView === "stable" ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
                }`}
              >
                My Stable
              </button>
              <button
                onClick={() => setActiveView("academy")}
                className={`px-6 py-2 text-[11px] uppercase tracking-luxury transition-all ${
                  activeView === "academy" ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
                }`}
              >
                My Academy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {activeView === "academy" && academyAssignment ? (
          /* Academy (Captain) View */
          <div className="space-y-8">
            <div>
              <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-1">Academy</p>
              <h2 className="font-display text-2xl font-light">{academyAssignment.academy?.name || "My Academy"}</h2>
              <p className="text-ink-soft text-sm mt-1">{academyAssignment.academy?.location}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Trainees", value: academyAssignment.stats?.activeTrainees || 0 },
                { label: "Completed Sessions", value: academyAssignment.stats?.completedSessions || 0 },
                { label: "Revenue (Month)", value: `EGP ${academyAssignment.stats?.revenueThisMonth || 0}` },
                { label: "Total Enrollments", value: academyAssignment.stats?.totalEnrollments || 0 },
              ].map((stat, i) => (
                <div key={i} className="border hairline bg-surface p-6">
                  <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-2">{stat.label}</p>
                  <p className="font-display text-2xl font-light">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            {academyAssignment.upcomingSessions?.length > 0 && (
              <div className="space-y-4">
                <p className="text-[11px] tracking-luxury uppercase text-ink-muted">Upcoming Sessions</p>
                <div className="grid gap-3">
                  {academyAssignment.upcomingSessions.map((session: any) => (
                    <div key={session.id} className="border hairline bg-surface p-4 flex justify-between items-center">
                      <div>
                        <p className="text-foreground text-sm">Session {session.sessionNumber} — {session.enrollment?.rider?.fullName || "Trainee"}</p>
                        <p className="text-ink-muted text-xs mt-0.5">{session.startTime} – {session.endTime}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-luxury text-ink-soft border hairline px-2 py-0.5">
                        {session.enrollment?.program?.skillLevel || "Training"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t hairline">
              <a href="/dashboard/captain" className="text-[11px] uppercase tracking-luxury text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">
                Open Full Captain Dashboard →
              </a>
            </div>
          </div>
        ) : (
          /* Stable Owner View */
          <>
            {error ? (
              <div className="border hairline bg-surface p-10 text-center">
                <p className="text-red-600 mb-4 text-sm">{error}</p>
                <Button onClick={fetchDashboardData} variant="outline" className="border-foreground/20 text-foreground">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="mb-8 grid gap-5 md:grid-cols-3">
                  <div className="border hairline bg-surface p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-2">Total Bookings</p>
                        <p className="font-display text-4xl font-light">{stats.totalBookings}</p>
                      </div>
                      <Calendar className="h-10 w-10 text-foreground opacity-20" />
                    </div>
                  </div>
                  <div className="border hairline bg-surface p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-2">Total Earnings</p>
                        <p className="font-display text-4xl font-light">EGP {stats.totalEarnings.toFixed(0)}</p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-foreground opacity-20" />
                    </div>
                  </div>
                  <div className="border hairline bg-surface p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-2">Upcoming</p>
                        <p className="font-display text-4xl font-light">{stats.upcomingBookings}</p>
                      </div>
                      <Clock className="h-10 w-10 text-foreground opacity-20" />
                    </div>
                  </div>
                </div>

                {/* Bookings */}
                {bookings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center border hairline bg-surface p-16 text-center"
                  >
                    <div className="mb-4 text-5xl">📅</div>
                    <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">No bookings yet</p>
                    <h2 className="font-display text-3xl font-light mb-3">Awaiting Your First Booking</h2>
                    <p className="mb-8 max-w-md text-ink-soft text-sm">
                      Your bookings will appear here once riders start booking your horses.
                    </p>
                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                        <Link href="/dashboard/stable/manage">
                          <Settings className="mr-2 h-4 w-4" />Manage Stable
                        </Link>
                      </Button>
                      <Button asChild className="bg-foreground text-background hover:bg-foreground/90 transition-colors">
                        <Link href="/dashboard/stable/horses">
                          <Plus className="mr-2 h-4 w-4" />Add Horses
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Recent Bookings</p>
                    {bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <div className="border hairline bg-surface p-6 transition-colors hover:bg-surface-elevated">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-medium text-foreground">{booking.horse.name}</h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-foreground opacity-40" />
                                  <span>{formatDate(booking.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-foreground opacity-40" />
                                  <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-foreground opacity-40" />
                                  <span>{booking.rider.fullName || booking.rider.email}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-foreground opacity-40" />
                                  <span className="font-display text-xl font-light">
                                    EGP {(parseFloat(booking.totalPrice.toString()) - parseFloat(booking.commission.toString())).toFixed(0)}
                                  </span>
                                </div>
                                <p className="text-[10px] uppercase tracking-luxury text-ink-muted">Your Earnings</p>
                              </div>

                              {(booking.status === "confirmed" || booking.status === "rescheduled") && (
                                <>
                                  <Button
                                    onClick={() => { setSelectedBooking(booking); setCancelRescheduleMode("cancel"); setCancelRescheduleModalOpen(true); }}
                                    size="sm" variant="outline"
                                    className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => { setSelectedBooking(booking); setCancelRescheduleMode("reschedule"); setCancelRescheduleModalOpen(true); }}
                                    size="sm" variant="outline"
                                    className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors"
                                  >
                                    Reschedule
                                  </Button>
                                </>
                              )}
                              {booking.status === "completed" && (
                                <Button
                                  onClick={() => { setReviewBooking(booking); setReviewModalOpen(true); }}
                                  size="sm"
                                  variant={booking.riderReview ? "secondary" : "default"}
                                  className={booking.riderReview ? "border-foreground/20 text-ink-muted" : "bg-foreground text-background hover:bg-foreground/90 transition-colors"}
                                  disabled={!!booking.riderReview}
                                >
                                  {booking.riderReview ? "Reviewed" : "Review Rider"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {selectedBooking && (
        <CancelRescheduleModal
          open={cancelRescheduleModalOpen}
          onOpenChange={setCancelRescheduleModalOpen}
          booking={{
            id: selectedBooking.id,
            status: selectedBooking.status,
            startTime: selectedBooking.startTime,
            endTime: selectedBooking.endTime,
            totalPrice: parseFloat(selectedBooking.totalPrice.toString()),
            stable: { name: stable?.name || "" },
            horse: { name: selectedBooking.horse.name },
          }}
          mode={cancelRescheduleMode}
        />
      )}

      {reviewBooking && (
        <RiderReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          bookingId={reviewBooking.id}
          riderId={reviewBooking.rider.id}
          riderName={reviewBooking.rider.fullName || reviewBooking.rider.email}
          onReviewSubmitted={() => { fetchDashboardData(); }}
        />
      )}
    </div>
  );
}
