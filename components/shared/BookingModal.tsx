"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, DollarSign, Users, CheckCircle, ArrowRight, Calendar, MapPin, CreditCard } from "lucide-react";

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stableId: string;
  stableName: string;
  horses: Horse[];
  pricePerHour?: number;
}

export default function BookingModal({
  open,
  onOpenChange,
  stableId,
  stableName,
  horses,
  pricePerHour = 50,
}: BookingModalProps) {
  const { data: session } = useSession();
  const [selectedHorseId, setSelectedHorseId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [selectedRiders, setSelectedRiders] = useState<number>(1);
  const [pickupRequested, setPickupRequested] = useState<boolean>(false);
  const [addons, setAddons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Calculate minimum date (today)
  const minDate = new Date().toISOString().split("T")[0];

  // Calculate price
  const calculatePrice = () => {
    if (!selectedDate || !startTime || !endTime) return 0;

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return hours > 0 ? hours * pricePerHour : 0;
  };

  const calculateHours = () => {
    if (!selectedDate || !startTime || !endTime) return 0;

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const validateBooking = () => {
    if (!session) {
      return "Please sign in to book a ride";
    }

    if (!selectedHorseId) {
      return "Please select a horse";
    }

    if (!selectedDate) {
      return "Please select a date";
    }

    if (!startTime || !endTime) {
      return "Please select start and end times";
    }

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    const now = new Date();

    if (start < now) {
      return "Start time must be in the future";
    }

    if (end <= start) {
      return "End time must be after start time";
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours < 0.5) {
      return "Minimum booking duration is 30 minutes";
    }

    if (hours > 8) {
      return "Maximum booking duration is 8 hours";
    }

    if (selectedRiders < 1 || selectedRiders > 10) {
      return "Number of riders must be between 1 and 10";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validationError = validateBooking();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stableId,
          horseId: selectedHorseId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          totalPrice: totalPrice,
          riders: selectedRiders,
          pickupRequested,
          addons,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message if available
        const errorMsg = data.details 
          ? `${data.error}\n\n${data.details}`
          : data.error || "Failed to create checkout session";
        throw new Error(errorMsg);
      }

      // Redirect to payment or show success
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success || data.bookingId) {
        // Booking created without payment (development mode or Paymob/payment on-site)
        setBookingId(data.bookingId || null);
        setBookingSuccess(true);
        setIsSubmitting(false);
      } else {
        // Fallback
        setBookingId(null);
        setBookingSuccess(true);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      setIsSubmitting(false);
    }
  };

  const hours = calculateHours();
  const totalPrice = calculatePrice();
  
  // Get selected horse name for success message
  const selectedHorse = horses.find(h => h.id === selectedHorseId);

  // Success screen
  if (bookingSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Success Header with Gradient */}
            <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 px-6 py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              
              <h3 className="mb-2 font-display text-2xl font-bold text-white">
                Booking Confirmed
              </h3>
              
              <p className="text-sm text-white/90">
                Your horse riding adventure has been successfully booked
              </p>
            </div>

            {/* Content Section */}
            <div className="px-6 py-6 space-y-6">
              {/* Booking Details Card */}
              {selectedDate && selectedHorse && (
                <Card className="border-2 border-primary/10 bg-gradient-to-br from-card to-muted/30">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Date & Time
                        </p>
                        <p className="font-semibold text-foreground">
                          {new Date(selectedDate).toLocaleDateString("en-US", { 
                            weekday: "long", 
                            month: "long", 
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {startTime} - {endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Horse
                        </p>
                        <p className="font-semibold text-foreground">{selectedHorse.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {selectedHorse.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Location
                        </p>
                        <p className="font-semibold text-foreground">{stableName}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Payment Info */}
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ${totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Payment will be processed on-site or via Paymob
                </p>
              </div>

              {/* Booking ID */}
              {bookingId && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Booking Reference
                  </p>
                  <p className="font-mono text-sm font-semibold text-primary break-all">
                    {bookingId}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    setBookingSuccess(false);
                    onOpenChange(false);
                    window.location.href = "/dashboard/rider";
                  }}
                >
                  View My Bookings
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setBookingSuccess(false);
                    onOpenChange(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Book Your Ride</DialogTitle>
          <DialogDescription>
            Complete your booking at {stableName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {/* Select Horse */}
          <div className="space-y-2">
            <Label>Select a Horse *</Label>
            <div className="grid gap-3">
              {horses.map((horse) => (
                <Card
                  key={horse.id}
                  className={`cursor-pointer border-2 transition-all ${
                    selectedHorseId === horse.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedHorseId(horse.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-semibold">{horse.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {horse.description}
                          </p>
                        </div>
                      </div>
                      {selectedHorseId === horse.id && (
                        <Badge className="bg-primary">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Select Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Select Date *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {selectedDate && startTime && endTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {hours > 0 ? `${hours.toFixed(1)} hours` : "Invalid time range"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                ${pricePerHour}/hour × {hours.toFixed(1)} hours
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !selectedHorseId || !selectedDate}
            >
              {isSubmitting ? "Creating..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
