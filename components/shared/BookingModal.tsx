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
  
  // Get selected horse name for success message
  const selectedHorse = horses.find(h => h.id === selectedHorseId);

  // Set background image on overlay when modal opens and booking is successful
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
          // Create background image element
          const bgImage = document.createElement('div');
          bgImage.className = 'blurred-bg-image';
          bgImage.style.cssText = `
            position: absolute;
            inset: 0;
            background-image: url('/gallery5.jpeg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: blur(8px);
            transform: scale(1.1);
            z-index: -1;
          `;
          
          // Add dark overlay
          const darkOverlay = document.createElement('div');
          darkOverlay.className = 'dark-overlay';
          darkOverlay.style.cssText = `
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.4);
            pointer-events: none;
            z-index: 0;
          `;

          // Set overlay styles
          overlay.style.position = 'relative';
          overlay.style.backgroundColor = 'transparent';
          
          // Add elements if not already present
          if (!overlay.querySelector('.blurred-bg-image')) {
            overlay.appendChild(bgImage);
          }
          if (!overlay.querySelector('.dark-overlay')) {
            overlay.appendChild(darkOverlay);
          }
        } else if (attempts < maxAttempts) {
          timeoutId = setTimeout(applyBackground, 100);
        }
      };

      timeoutId = setTimeout(applyBackground, 50);

      return () => {
        clearTimeout(timeoutId);
        const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
        if (overlay) {
          const bgImage = overlay.querySelector('.blurred-bg-image');
          const darkOverlay = overlay.querySelector('.dark-overlay');
          if (bgImage) bgImage.remove();
          if (darkOverlay) darkOverlay.remove();
          overlay.style.backgroundColor = '';
        }
      };
    }
  }, [open, bookingSuccess, bookingData]);

  // Success screen with new design - matching reference image exactly
  if (bookingSuccess && bookingData) {
    // Helper to format Google Maps directions URL
    const gmapsLink =
      bookingData.location
        ? `https://maps.google.com/?daddr=${encodeURIComponent(bookingData.location)}`
        : undefined;

    // Format date for calendar icon display
    const bookingDate = new Date(bookingData.date);
    const dayOfMonth = bookingDate.getDate();

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden"
        >
          {/* White/Light card - centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full"
          >
            {/* Green Gradient Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-4"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed</h2>
              <p className="text-green-50">Your adventure is ready!</p>
            </div>

            <div className="p-6 bg-white">
              {/* Booking Details Card - IDENTICAL to reference */}
              <div className="p-5 border border-gray-200 rounded-xl bg-[#f5f5f5] shadow-md">
                <div className="space-y-[18px]">
                  {/* Date & Time */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <CalendarSVG className="w-11 h-11" day={dayOfMonth} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold tracking-[0.5px] text-gray-500 uppercase mb-1 leading-tight">
                        DATE &amp; TIME
                      </p>
                      <div className="font-semibold text-[15px] text-[#1f2937] leading-snug">
                        {new Date(bookingData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-[13px] text-gray-600 mt-[2px] leading-snug">
                        {bookingData.startTime} - {bookingData.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Horse Information */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <HorseHeadSVG className="w-11 h-11" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold tracking-[0.5px] text-gray-500 uppercase mb-1 leading-tight">
                        HORSE INFORMATION
                      </p>
                      <div className="font-semibold text-[15px] text-[#1f2937] leading-snug">
                        {bookingData.horseName}
                      </div>
                      <div className="text-[13px] text-gray-600 mt-[2px] leading-snug">
                        {bookingData.riders} {bookingData.riders === 1 ? 'rider' : 'riders'}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <PinSVG className="w-11 h-11" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold tracking-[0.5px] text-gray-500 uppercase mb-1 leading-tight">
                        LOCATION
                      </p>
                      <div className="font-semibold text-[15px] text-[#1f2937] leading-tight mb-[2px]">
                        {bookingData.location}
                      </div>
                      {/* Get Directions Button - IDENTICAL to reference */}
                      {gmapsLink && (
                        <a
                          href={gmapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d9488] to-[#2563eb] text-white font-bold text-base py-3 px-7 rounded-full shadow-md transition-all w-full"
                        >
                          Get Directions
                          <DirectionsArrowSVG className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Total Amount - inside the same card */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <ReceiptSVG className="w-11 h-11" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold tracking-[0.5px] text-gray-500 uppercase mb-1 leading-tight">
                        TOTAL AMOUNT
                      </p>
                      <p className="text-xl font-bold text-[#1f2937] mb-[4px] leading-tight">
                        ${bookingData.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-[13px] text-gray-600 leading-snug">
                        Payment will be processed on-site or via your preferred method
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
