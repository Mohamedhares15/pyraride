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
  };
  horse: {
    name: string;
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
      // Ensure bookings array is properly formatted
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
        weekday: "long",
        year: "numeric",
        month: "long",
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
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <AlertCircle className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <XCircle className="mr-1 h-3 w-3" />
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
      <div className="border-b border-border bg-card/50 py-8 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <div>
            <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-white">
              My Bookings
            </h1>
            <p className="text-white/70">
              View and manage your upcoming horse riding adventures
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchBookings} className="mt-4">
              Try Again
            </Button>
          </Card>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center"
          >
            <div className="mb-4 text-6xl">🐴</div>
            <h2 className="mb-2 font-display text-2xl font-bold">
              No Bookings Yet
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Start your adventure by booking a horse riding experience at one of our trusted stables!
            </p>
            <Button asChild>
              <Link href="/stables">Browse Stables</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="mb-1 font-display text-xl font-bold">
                            {booking.stable.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.horse.name}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid gap-3 text-sm md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-secondary" />
                          <span>
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {booking.stable.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4 md:flex-col md:items-end">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold">
                            ${parseFloat(booking.totalPrice.toString()).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total Price
                        </p>
                      </div>
                      {booking.status === "completed" && !booking.hasReview && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setReviewModalOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Write Review
                        </Button>
                      )}
                      {booking.status === "completed" && booking.hasReview && (
                        <Badge className="gap-2 bg-green-500/20 text-green-400 border-green-500/50">
                          <Star className="h-3 w-3" />
                          Reviewed
                        </Badge>
                      )}
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 md:items-end">
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
                              className="gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
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
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
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
            // Refresh bookings
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

