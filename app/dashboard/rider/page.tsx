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
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Edit2,
  Trash2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReviewModal from "@/components/shared/ReviewModal";
import CancelRescheduleModal from "@/components/shared/CancelRescheduleModal";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "confirmed" | "completed" | "cancelled";
  stable: {
    name: string;
    location: string;
    imageUrl?: string;
  };
  horse: {
    name: string;
    imageUrls?: string[];
  };
  hasReview?: boolean;
}

export default function RiderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelRescheduleModalOpen, setCancelRescheduleModalOpen] = useState(false);
  const [cancelRescheduleMode, setCancelRescheduleMode] = useState<"cancel" | "reschedule">("cancel");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    if (session.user.role !== "rider") {
      router.push("/dashboard");
      return;
    }

    fetchBookings();
  }, [session, status, router]);

  async function fetchBookings() {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bookings");
      }

      const data = await response.json();
      const formattedBookings = (data.bookings || []).map((booking: any) => ({
        ...booking,
        totalPrice: booking.totalPrice ? parseFloat(booking.totalPrice.toString()) : 0,
        startTime: booking.startTime || "",
        endTime: booking.endTime || "",
        status: booking.status || "confirmed",
        hasReview: booking.hasReview || false,
      }));
      setBookings(formattedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid time";
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid time";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              My Bookings
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Manage your upcoming rides and view your history
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/stables">
                Book New Ride
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {error ? (
          <Card className="border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-red-500">Failed to load bookings</h3>
            <p className="mb-6 text-neutral-400">{error}</p>
            <Button onClick={fetchBookings} variant="outline" className="border-red-500/20 hover:bg-red-500/10">
              Try Again
            </Button>
          </Card>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-neutral-900/50 p-12 text-center backdrop-blur-sm"
          >
            <div className="mb-6 rounded-full bg-white/5 p-6 ring-1 ring-white/10">
              <span className="text-4xl">🐴</span>
            </div>
            <h2 className="mb-3 font-display text-2xl font-bold text-white">
              No Bookings Yet
            </h2>
            <p className="mb-8 max-w-md text-neutral-400">
              Start your journey by exploring our curated selection of premium stables and horses.
            </p>
            <Button asChild size="lg" className="bg-primary text-black hover:bg-primary/90">
              <Link href="/stables">Explore Stables</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50 transition-all hover:border-white/20 hover:bg-neutral-900">
                  <div className="flex flex-col md:flex-row">
                    {/* Status Strip (Mobile) */}
                    <div className={`h-1.5 w-full md:h-auto md:w-1.5 ${booking.status === 'confirmed' ? 'bg-emerald-500' :
                      booking.status === 'completed' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`} />

                    <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                      {/* Main Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between md:justify-start md:gap-4">
                          <div>
                            <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors">
                              {booking.stable.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <span>{booking.horse.name}</span>
                              <span>•</span>
                              <span className="capitalize">{booking.stable.location}</span>
                            </div>
                          </div>
                          <div className="md:hidden">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-neutral-300">
                          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{formatDate(booking.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Price */}
                      <div className="flex flex-col gap-4 border-t border-white/10 pt-4 md:items-end md:border-t-0 md:pt-0">
                        <div className="hidden md:block">
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="flex items-center justify-between gap-8 md:justify-end">
                          <div className="text-left md:text-right">
                            <p className="text-xs text-neutral-500">Total Price</p>
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-white">
                                EGP {booking.totalPrice.toFixed(0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {booking.status === "completed" && !booking.hasReview && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setReviewModalOpen(true);
                                }}
                                className="bg-white/10 text-white hover:bg-white/20"
                              >
                                <Star className="mr-2 h-3.5 w-3.5" />
                                Review
                              </Button>
                            )}

                            {booking.status === "confirmed" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setCancelRescheduleMode("reschedule");
                                    setCancelRescheduleModalOpen(true);
                                  }}
                                  className="border-white/10 bg-transparent text-white hover:bg-white/5"
                                >
                                  <Edit2 className="mr-2 h-3.5 w-3.5" />
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setCancelRescheduleMode("cancel");
                                    setCancelRescheduleModalOpen(true);
                                  }}
                                  className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                >
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
        )}
      </div>

      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          bookingId={selectedBooking.id}
          stableName={selectedBooking.stable.name}
          horseName={selectedBooking.horse.name}
          onReviewSubmitted={() => {
            fetchBookings();
          }}
        />
      )}

      {/* Cancel/Reschedule Modal */}
      {selectedBooking && (
        <CancelRescheduleModal
          open={cancelRescheduleModalOpen}
          onOpenChange={setCancelRescheduleModalOpen}
          booking={selectedBooking}
          mode={cancelRescheduleMode}
        />
      )}
    </div>
  );
}

