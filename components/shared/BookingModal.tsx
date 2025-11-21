"use client";

import { useState, useEffect } from "react";
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
  
  // Get initial date from URL params or use today
  const getInitialDate = () => {
    if (typeof window === 'undefined') return "";
    const params = new URLSearchParams(window.location.search);
    return params.get('date') || new Date().toISOString().split("T")[0];
  };
  
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [selectedRiders, setSelectedRiders] = useState<number>(1);
  const [pickupRequested, setPickupRequested] = useState<boolean>(false);
  const [addons, setAddons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
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

      // Store booking data for confirmation modal
      if (data.bookingId || data.success) {
        setBookingData({
          bookingId: data.bookingId || `BOOK-${Date.now()}`,
          horseName: selectedHorse?.name || "Unknown",
          date: selectedDate,
          startTime,
          endTime,
          location: stableCoordinates?.address || stableName,
          totalPrice,
          riders: selectedRiders,
        });
        setBookingId(data.bookingId || null);
        setBookingSuccess(true);
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

  // Set dark blurred background on overlay when modal opens and booking is successful
  useEffect(() => {
    if (open && bookingSuccess && bookingData) {
      // Use multiple attempts to ensure overlay element exists after Radix renders
      let timeoutId: NodeJS.Timeout;
      let attempts = 0;
      const maxAttempts = 10;

      const applyBackground = () => {
        attempts++;
        const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
        if (overlay) {
          // Set blurred pyramid background matching design.png
          overlay.style.backgroundImage = "url('/gallery5.jpeg')";
          overlay.style.backgroundSize = "cover";
          overlay.style.backgroundPosition = "center";
          overlay.style.backgroundRepeat = "no-repeat";
          overlay.style.filter = "blur(8px) brightness(0.4)";
          overlay.style.transform = "scale(1.1)";
          overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        } else if (attempts < maxAttempts) {
          timeoutId = setTimeout(applyBackground, 100);
        }
      };

      timeoutId = setTimeout(applyBackground, 50);

      return () => {
        clearTimeout(timeoutId);
        const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
        if (overlay) {
          overlay.style.backgroundImage = '';
          overlay.style.filter = '';
          overlay.style.transform = '';
          overlay.style.backgroundColor = '';
          overlay.style.backgroundSize = '';
          overlay.style.backgroundPosition = '';
          overlay.style.backgroundRepeat = '';
        }
      };
    }
    return undefined;
  }, [open, bookingSuccess, bookingData]);

  // Helper to format Google Maps directions URL (only if booking success)
  const gmapsLink = bookingSuccess && bookingData && bookingData.location
    ? `https://maps.google.com/?daddr=${encodeURIComponent(bookingData.location)}`
    : undefined;

  // Format date for calendar icon display (only if booking success)
  const bookingDate = bookingSuccess && bookingData ? new Date(bookingData.date) : null;
  const dayOfMonth = bookingDate ? bookingDate.getDate() : 0;

  // Success screen or booking form - use direct conditional return
  if (bookingSuccess && bookingData && bookingDate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden"
        >
          {/* DARK card container - IDENTICAL to design.png */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl w-full max-w-md"
            style={{
              background: "rgba(28, 28, 30, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Header with checkmark and title */}
            <div className="px-8 py-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-6"
              >
                <div 
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" 
                  style={{ 
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%)", 
                    border: "2px solid rgba(16, 185, 129, 0.5)",
                    boxShadow: "0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 10px rgba(16, 185, 129, 0.1)"
                  }}
                >
                  <CheckCircle className="h-10 w-10" style={{ color: "#10b981", filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))" }} />
                </div>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-2 text-white"
              >
                Booking Confirmed!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base text-gray-300"
              >
                Your adventure awaits! 🐴
              </motion.p>
            </div>

            {/* Details in ONE dark card - IDENTICAL to design.png */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-8 pb-8 space-y-6"
            >
              {/* Date & Time */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4"
              >
                <Calendar className="w-8 h-8 text-white flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DATE & TIME</p>
                  <p className="text-base font-semibold text-white">
                    {new Date(bookingData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {bookingData.startTime} – {bookingData.endTime}
                  </p>
                </div>
              </motion.div>

              {/* Horse Information */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-4"
              >
                <svg className="w-8 h-8 text-white flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">HORSE INFORMATION</p>
                  <p className="text-base font-semibold text-white">{bookingData.horseName}</p>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {bookingData.riders} {bookingData.riders === 1 ? 'rider' : 'riders'}
                  </p>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-start gap-4"
              >
                <MapPin className="w-8 h-8 text-white flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">LOCATION</p>
                  <p className="text-base font-semibold text-white mb-4">{bookingData.location}</p>
                  {gmapsLink && (
                    <a
                      href={gmapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full rounded-2xl transition-all text-white font-semibold"
                      style={{
                        height: "52px",
                        padding: "0 24px",
                        background: "linear-gradient(90deg, #0d9488 0%, #2563eb 100%)",
                        fontSize: "15px",
                      }}
                    >
                      Get Directions
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Total Amount */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-4 pt-6" 
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
              >
                <svg className="w-8 h-8 text-white flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="7" width="14" height="10" rx="1" />
                  <path d="M5 7 Q6 6 7 7 Q8 6 9 7 Q10 6 11 7 Q12 6 13 7 Q14 6 15 7 Q16 6 17 7 Q18 6 19 7" stroke="rgba(28, 28, 30, 0.95)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">TOTAL AMOUNT</p>
                  <p className="text-2xl font-bold text-white mb-2">${bookingData.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 italic">
                    Payment will be processed on-site or via your preferred method
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

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
                  className={`cursor-pointer transition-all ${
                    selectedHorseId === horse.id
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
                        ${horse.pricePerHour}/hour
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
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                ${currentHorsePrice}/hour × {hours.toFixed(1)} hours
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
