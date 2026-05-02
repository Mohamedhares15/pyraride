"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  horse: {
    name: string;
  };
  rider: {
    id: string;
    fullName: string | null;
    email: string;
  };
  riderReview?: {
    id: string;
  } | null;
}


interface Stable {
  id: string;
  name: string;
  location: string;
  status: string;
  _count: {
    bookings: number;
    horses: number;
  };
}

export default function StableOwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stable, setStable] = useState<Stable | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    upcomingBookings: 0,
  });
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

    if (!session || session.user.role !== "stable_owner") {
      router.push("/dashboard");
      return;
    }

    // Trigger auto-completion of past bookings
    fetch("/api/system/auto-complete-bookings", { method: "POST" })
      .catch((err) => console.error("Failed to auto-complete bookings:", err));

    fetchDashboardData();
  }, [session, status, router]);

  async function fetchDashboardData() {
    try {
      // Fetch both Captain data and Stable data simultaneously
      const [captainRes, stablesRes] = await Promise.all([
        fetch("/api/captain/dashboard").catch(() => null),
        fetch("/api/stables?ownerOnly=true").catch(() => null)
      ]);

      let hasAcademy = false;

      if (captainRes && captainRes.ok) {
        const data = await captainRes.json();
        if (data && !data.error) {
          setAcademyAssignment(data);
          hasAcademy = true;
        }
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
          id: ownerStable.id,
          name: ownerStable.name,
          location: ownerStable.location,
          status: ownerStable.status || "approved",
          _count: {
            bookings: ownerStable.totalBookings || 0,
            horses: ownerStable.horseCount || 0,
          },
        });

        // Fetch bookings using the resolved stable ID
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
        // If they have no stable but DO have an academy, default them directly to the academy tab
        setActiveView("academy");
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
                Stable Dashboard
              </h1>
              <p className="text-white/70">
                Manage your stable and track bookings
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/dashboard/stable/horses">
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Horses
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/dashboard/stable/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Schedule
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Link href="/dashboard/stable/manage">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Stable
                </Link>
              </Button>
            </div>
          </div>

          {/* Dual-Role Tab Switcher (if also a captain) */}
          {academyAssignment && (
            <div className="mt-6 flex gap-2 bg-white/5 p-1 rounded-full border border-white/10 self-start">
              <button
                onClick={() => setActiveView("stable")}
                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                  activeView === "stable" ? "bg-[#D4AF37] text-black" : "text-white/60 hover:text-white"
                }`}
              >
                🏠 My Stable
              </button>
              <button
                onClick={() => setActiveView("academy")}
                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                  activeView === "academy" ? "bg-[#D4AF37] text-black" : "text-white/60 hover:text-white"
                }`}
              >
                🎓 My Academy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <style jsx global>{`
          .dashboard-card {
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(8px);
          }
        `}</style>

        {activeView === "academy" && academyAssignment ? (
          /* ---- Academy (Captain) View ---- */
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display text-white">{academyAssignment.academy?.name || "My Academy"}</h2>
                <p className="text-gray-400">{academyAssignment.academy?.location}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Trainees", value: academyAssignment.stats?.activeTrainees || 0, icon: "👥" },
                { label: "Completed Sessions", value: academyAssignment.stats?.completedSessions || 0, icon: "✅" },
                { label: "Revenue (Month)", value: `EGP ${academyAssignment.stats?.revenueThisMonth || 0}`, icon: "💰" },
                { label: "Total Enrollments", value: academyAssignment.stats?.totalEnrollments || 0, icon: "🎓" },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-2xl mb-2">{stat.icon}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl text-white font-light">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            {academyAssignment.upcomingSessions?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-xl text-white">Upcoming Sessions</h3>
                <div className="grid gap-3">
                  {academyAssignment.upcomingSessions.map((session: any) => (
                    <div key={session.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm font-medium">Session {session.sessionNumber} — {session.enrollment?.rider?.fullName || "Trainee"}</p>
                        <p className="text-gray-500 text-xs">{session.startTime} - {session.endTime}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">{session.enrollment?.program?.skillLevel || "Training"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <a href="/dashboard/captain" className="text-[#D4AF37] text-xs uppercase tracking-widest hover:underline">Open Full Captain Dashboard →</a>
            </div>
          </div>
        ) : (
          /* ---- Stable Owner View (Original) ---- */
          <>
        {error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-3xl font-bold">{stats.totalBookings}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-primary" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-3xl font-bold">
                      EGP {stats.totalEarnings.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-secondary" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-3xl font-bold">{stats.upcomingBookings}</p>
                  </div>
                  <Clock className="h-12 w-12 text-muted-foreground" />
                </div>
              </Card>
            </div>

            {/* Bookings */}
            {bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center"
              >
                <div className="mb-4 text-6xl">📅</div>
                <h2 className="mb-2 font-display text-2xl font-bold">
                  No Bookings Yet
                </h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                  Your bookings will appear here once riders start booking your horses!
                </p>
                <div className="flex gap-3">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/stable/manage">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Stable
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/stable/horses">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Horses
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold">Recent Bookings</h2>
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{booking.horse.name}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(booking.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatTime(booking.startTime)} -{" "}
                                {formatTime(booking.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.rider.fullName || booking.rider.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <span className="text-xl font-bold">
                                EGP {(parseFloat(booking.totalPrice.toString()) - parseFloat(booking.commission.toString())).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Your Earnings
                            </p>
                          </div>
                          {(booking.status === "confirmed" || booking.status === "rescheduled") && (
                            <>
                              <Button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelRescheduleMode("cancel");
                                  setCancelRescheduleModalOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelRescheduleMode("reschedule");
                                  setCancelRescheduleModalOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                Reschedule
                              </Button>
                            </>
                          )}
                          {booking.status === "completed" && (
                            <Button
                              onClick={() => {
                                setReviewBooking(booking);
                                setReviewModalOpen(true);
                              }}
                              size="sm"
                              variant={booking.riderReview ? "secondary" : "default"}
                              className="whitespace-nowrap"
                              disabled={!!booking.riderReview}
                            >
                              {booking.riderReview ? "Reviewed" : "Review Rider"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        </>
      )}
      </div>


      {/* Cancel/Reschedule Modal */}
      {
        selectedBooking && (
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
        )
      }

      {/* Rider Review Modal */}
      {reviewBooking && (
        <RiderReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          bookingId={reviewBooking.id}
          riderId={reviewBooking.rider.id}
          riderName={reviewBooking.rider.fullName || reviewBooking.rider.email}
          onReviewSubmitted={() => {
              fetchDashboardData(); // Refresh data to update "Reviewed" status
          }}
        />
      )}
    </div >
  );
}

