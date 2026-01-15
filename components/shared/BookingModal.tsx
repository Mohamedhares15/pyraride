"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
import { CalendarIcon, Clock, DollarSign, Users, CheckCircle, ArrowRight, Calendar, MapPin, Receipt, X } from "lucide-react";
import LocationMap from "@/components/maps/LocationMap";
import CalendarSVG from '@/components/icons/CalendarSVG';
import HorseHeadSVG from '@/components/icons/HorseHeadSVG';
import PinSVG from '@/components/icons/PinSVG';
import ReceiptSVG from '@/components/icons/ReceiptSVG';
import DirectionsArrowSVG from '@/components/icons/DirectionsArrowSVG';

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
  pricePerHour?: number | null;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stableId: string;
  stableName: string;
  horses: Horse[];
  pricePerHour?: number;
  initialSelection?: {
    horseId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}

export default function BookingModal({
  open,
  onOpenChange,
  stableId,
  stableName,
  horses,
  pricePerHour = 50,
  initialSelection,
}: BookingModalProps) {
  const { data: session } = useSession();
  const [selectedHorseId, setSelectedHorseId] = useState<string>(initialSelection?.horseId || "");

  // Get initial date from URL params or props or use today
  const getInitialDate = () => {
    if (initialSelection?.date) return initialSelection.date;
    if (typeof window === 'undefined') return "";
    const params = new URLSearchParams(window.location.search);
    return params.get('date') || new Date().toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [startTime, setStartTime] = useState<string>(initialSelection?.startTime || "09:00");
  const [endTime, setEndTime] = useState<string>(initialSelection?.endTime || "10:00");

  // Update state when initialSelection changes (e.g. when reopening modal with different slot)
  useEffect(() => {
    if (open && initialSelection) {
      if (initialSelection.horseId) setSelectedHorseId(initialSelection.horseId);
      if (initialSelection.date) setSelectedDate(initialSelection.date);
      if (initialSelection.startTime) setStartTime(initialSelection.startTime);
      if (initialSelection.endTime) setEndTime(initialSelection.endTime);
    }
  }, [open, initialSelection]);
  const [selectedRiders, setSelectedRiders] = useState<number>(1);
  const [pickupRequested, setPickupRequested] = useState<boolean>(false);
  const [addons, setAddons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ horseName: string; date: string; time: string } | null>(null);
  const [stableCoordinates, setStableCoordinates] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  // Fetch stable coordinates on mount
  useEffect(() => {
    async function fetchStableCoords() {
      try {
        const res = await fetch(`/api/stables/${stableId}/coordinates`);
        if (res.ok) {
          const data = await res.json();
          setStableCoordinates({
            ...data.coordinates,
            address: data.address,
          });
        }
      } catch (err) {
        console.error("Error fetching stable coordinates:", err);
      }
    }
    fetchStableCoords();
  }, [stableId]);

  // Calculate minimum date (today)
  const minDate = new Date().toISOString().split("T")[0];

  // Get selected horse's price
  const getSelectedHorsePrice = () => {
    if (!selectedHorseId) return pricePerHour;
    const horse = horses.find(h => h.id === selectedHorseId);
    return horse?.pricePerHour ?? pricePerHour;
  };

  // Calculate price
  const calculatePrice = () => {
    if (!selectedDate || !startTime || !endTime) return 0;

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const horsePrice = getSelectedHorsePrice();

    return hours > 0 ? hours * horsePrice : 0;
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
      const selectedHorse = horses.find(h => h.id === selectedHorseId);

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
          stableLocation: stableCoordinates ? {
            lat: stableCoordinates.lat,
            lng: stableCoordinates.lng,
            address: stableCoordinates.address,
          } : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details
          ? `${data.error}\n\n${data.details}`
          : data.error || "Failed to create checkout session";
        throw new Error(errorMsg);
      }

      // Show success toast and close modal
      if (data.bookingId || data.success || data.booking) {
        const bookingDate = new Date(selectedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        setBookingDetails({
          horseName: selectedHorse?.name || "Unknown",
          date: bookingDate,
          time: `${startTime} – ${endTime}`
        });
        setShowSuccessToast(true);

        // Close modal after short delay
        setTimeout(() => {
          onOpenChange(false);
          // Reset form
          setSelectedHorseId("");
          setSelectedDate(getInitialDate());
          setStartTime("09:00");
          setEndTime("10:00");
          setSelectedRiders(1);
          setPickupRequested(false);
          setAddons([]);
          setShowSuccessToast(false);
          setBookingDetails(null);
        }, 3000);
      } else if (data.checkoutUrl) {
        // Redirect to payment
        window.location.href = data.checkoutUrl;
        return;
      }

      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      setIsSubmitting(false);
    }
  };

  const hours = calculateHours();
  const totalPrice = calculatePrice();
  const currentHorsePrice = getSelectedHorsePrice();

  // Get selected horse name for success message
  const selectedHorse = horses.find(h => h.id === selectedHorseId);

  // Booking form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Your Ride</DialogTitle>
          <DialogDescription>
            Complete the form below to book your horse riding adventure at {stableName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Select Horse */}
          <div className="space-y-2">
            <Label>Select Horse *</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {horses.map((horse) => (
                <Card
                  key={horse.id}
                  className={`cursor-pointer transition-all ${selectedHorseId === horse.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50"
                    }`}
                  onClick={() => setSelectedHorseId(horse.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{horse.name}</h3>
                      {selectedHorseId === horse.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {horse.description}
                    </p>
                    {horse.pricePerHour && (
                      <p className="mt-2 text-sm font-semibold text-primary">
                        EGP ${horse.pricePerHour}/hour
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Select Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Select Date *
              {selectedDate && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })})
                </span>
              )}
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className="h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                required
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Stable Location Map (Read-only) */}
          {stableCoordinates && (
            <div className="space-y-2">
              <Label>Meeting Location</Label>
              <LocationMap
                stableLat={stableCoordinates.lat}
                stableLng={stableCoordinates.lng}
                stableName={stableName}
                stableAddress={stableCoordinates.address}
              />
            </div>
          )}

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
                    EGP ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                EGP ${currentHorsePrice}/hour × {hours.toFixed(1)} hours
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

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && bookingDetails && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-[10000] max-w-md w-full shadow-2xl rounded-lg border-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-4 flex items-start gap-4"
          >
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">
                Booking Confirmed! 🐴
              </h4>
              <p className="text-sm text-muted-foreground">
                "{bookingDetails.horseName}" booked for {bookingDetails.date} at {bookingDetails.time}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
