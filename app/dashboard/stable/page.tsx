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
import RiderReviewModal from "@/components/shared/RiderReviewModal";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  commission: number;
  status: "confirmed" | "completed" | "cancelled";
  horse: {
    name: string;
  };
  rider: {
    fullName: string | null;
    email: string;
  };
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [riderReviews, setRiderReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "stable_owner") {
      router.push("/dashboard");
      return;
    }

    fetchStableData();
  }, [session, status, router]);

  async function fetchStableData() {
    try {
      // Fetch the owner's stable directly
      const stablesRes = await fetch("/api/stables?ownerOnly=true");
      if (!stablesRes.ok) {
        throw new Error("Failed to fetch stable data");
      }
      const stablesData = await stablesRes.json();
      
      const ownerStable = stablesData.stables?.[0]; // Should be only one

      if (!ownerStable) {
        setError("Stable not found. Please create a stable first.");
        setIsLoading(false);
        return;
      }

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

      // Fetch bookings for this stable
      const bookingsRes = await fetch(`/api/stables/${ownerStable.id}/bookings`);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const fetchedBookings = bookingsData.bookings || [];
        setBookings(fetchedBookings);
        
        // Recalculate stats after fetching bookings
        const totalBookings = fetchedBookings.length;
        const totalEarnings = fetchedBookings
          .filter((b: Booking) => b.status === "completed")
          .reduce((sum: number, b: Booking) => sum + (parseFloat(b.totalPrice.toString()) - parseFloat(b.commission.toString())), 0);
        const upcoming = fetchedBookings.filter(
          (b: Booking) =>
            b.status === "confirmed" &&
            new Date(b.startTime) > new Date()
        ).length;

        setStats({
          totalBookings,
          totalEarnings,
          upcomingBookings: upcoming,
        });
      }

      // Fetch rider reviews to check which bookings have been reviewed
      const reviewsRes = await fetch("/api/rider-reviews");
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const reviewedBookingIds = new Set<string>(
          reviewsData.reviews?.map((r: any) => r.bookingId as string) || []
        );
        setRiderReviews(reviewedBookingIds);
      }
    } catch (err) {
      console.error("Error fetching stable data:", err);
      setError(err instanceof Error ? err.message : "Failed to load stable data");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
                Stable Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your stable and track bookings
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/stable/horses">
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Horses
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/stable/manage">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Stable
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchStableData}>Try Again</Button>
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
                  ${stats.totalEarnings.toFixed(2)}
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
                            ${(parseFloat(booking.totalPrice.toString()) - parseFloat(booking.commission.toString())).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your Earnings
                        </p>
                      </div>
                      {booking.status === "completed" && !riderReviews.has(booking.id) && (
                        <Button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setReviewModalOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Review Rider
                        </Button>
                      )}
                      {booking.status === "completed" && riderReviews.has(booking.id) && (
                        <Badge variant="secondary" className="whitespace-nowrap">
                          ✅ Reviewed
                        </Badge>
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
      </div>

      {/* Rider Review Modal */}
      {selectedBooking && (
        <RiderReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          bookingId={selectedBooking.id}
          riderId={selectedBooking.rider.id}
          riderName={selectedBooking.rider.fullName || selectedBooking.rider.email}
          onReviewSubmitted={() => {
            // Refresh data to update the reviewed status
            fetchStableData();
          }}
        />
      )}
    </div>
  );
}

