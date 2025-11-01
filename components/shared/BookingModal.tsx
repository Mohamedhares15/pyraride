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
          // Set dark background to match design: #0F1011
          overlay.style.position = 'relative';
          overlay.style.backgroundColor = '#0F1011';
        } else if (attempts < maxAttempts) {
          timeoutId = setTimeout(applyBackground, 100);
        }
      };

      timeoutId = setTimeout(applyBackground, 50);

      return () => {
        clearTimeout(timeoutId);
        const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
        if (overlay) {
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
          {/* Dark card - pixel-perfect to design.png */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-[720px] max-w-full rounded-[28px] overflow-hidden"
            style={{
              background: "#111316",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              padding: "24px 28px 28px",
              color: "#FFFFFF",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif",
            }}
          >
            {/* Header - pixel perfect */}
            <div className="flex flex-col items-center gap-4">
              {/* Check circle: 64x64, radius 32, bg #1E3B2F, check #8FE3B4 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#1E3B2F" }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: "#8FE3B4" }} />
              </motion.div>
              {/* H1: 32px, Semibold, -1% letter spacing, spacing 16px from icon */}
              <h2 className="font-semibold mb-2" style={{ fontSize: "32px", letterSpacing: "-0.01em", marginTop: "0" }}>
                Booking Confirmed
              </h2>
              {/* Subtitle: 18px, Regular, 120% line-height, color #C9CDD1, spacing 8px from H1 */}
              <p className="font-normal" style={{ fontSize: "18px", lineHeight: "1.2", color: "#C9CDD1", marginTop: "0" }}>
                Your adventure is ready!
              </p>
            </div>

            {/* Details Panel - pixel perfect */}
            <div
              className="mt-6"
              style={{
                padding: "24px",
                borderRadius: "20px",
                background: "#1A1D20",
                boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Date & Time - pixel perfect */}
                  <div className="flex items-start" style={{ gap: "12px" }}>
                    {/* Icon cell: 40x40, radius 12, bg #262B30 */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#262B30",
                        borderRadius: "12px",
                        color: "#FFFFFF",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "currentColor" }}>
                        <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M4 10h16M8 4v4M16 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <text x="12" y="17" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">{dayOfMonth}</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      {/* Label: 12px, Medium, +4% tracking, uppercase, color #8D949B, spacing 8px */}
                      <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                        DATE &amp; TIME
                      </p>
                      {/* Primary value: 16px, Semibold, 130% line-height */}
                      <div className="font-semibold mb-1" style={{ fontSize: "16px", lineHeight: "1.3", color: "#FFFFFF" }}>
                        {new Date(bookingData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      {/* Secondary value: 14px, Regular, 130%, color #8D949B */}
                      <div className="font-normal" style={{ fontSize: "14px", lineHeight: "1.3", color: "#8D949B" }}>
                        {bookingData.startTime} - {bookingData.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Horse Information - pixel perfect */}
                  <div className="flex items-start" style={{ gap: "12px" }}>
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#262B30",
                        borderRadius: "12px",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="11" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                        HORSE INFORMATION
                      </p>
                      <div className="font-semibold mb-1" style={{ fontSize: "16px", lineHeight: "1.3", color: "#FFFFFF" }}>
                        {bookingData.horseName}
                      </div>
                      <div className="font-normal" style={{ fontSize: "14px", lineHeight: "1.3", color: "#8D949B" }}>
                        {bookingData.riders} {bookingData.riders === 1 ? 'rider' : 'riders'}
                      </div>
                    </div>
                  </div>

                  {/* Location - pixel perfect */}
                  <div className="flex items-start" style={{ gap: "12px" }}>
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#262B30",
                        borderRadius: "12px",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8c-2.5 0-4.5 1.5-4.5 3.5 0 3 4.5 6 4.5 6s4.5-3 4.5-6c0-2-2-3.5-4.5-3.5zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <circle cx="12" cy="11" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                        LOCATION
                      </p>
                      <div className="font-semibold mb-1" style={{ fontSize: "16px", lineHeight: "1.3", color: "#FFFFFF" }}>
                        {bookingData.location}
                      </div>
                      {/* CTA Button - pixel perfect: 56px height, 24px padding, 16px radius, gradient #0D7F94 to #144A78, 20px top spacing */}
                      {gmapsLink && (
                        <a
                          href={gmapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center justify-center w-full rounded-2xl transition-all"
                          style={{
                            height: "56px",
                            padding: "0 24px",
                            borderRadius: "16px",
                            background: "linear-gradient(90deg, #0D7F94, #144A78)",
                            color: "#FFFFFF",
                            fontSize: "16px",
                            fontWeight: 600,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                          }}
                        >
                          Get Directions
                          <DirectionsArrowSVG className="w-5 h-5 ml-2" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Total Amount - pixel perfect, 24px top spacing, divider */}
                  <div className="flex items-start pt-6" style={{ gap: "12px", borderTop: "1px solid #2A2F34", marginTop: "24px", paddingTop: "16px" }}>
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#262B30",
                        borderRadius: "12px",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="7" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="7" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M5 7 Q6 6 7 7 Q8 6 9 7 Q10 6 11 7 Q12 6 13 7 Q14 6 15 7 Q16 6 17 7 Q18 6 19 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                        TOTAL AMOUNT
                      </p>
                      {/* Amount: 20px, Bold */}
                      <p className="font-bold mb-2" style={{ fontSize: "20px", color: "#FFFFFF", lineHeight: "1.2" }}>
                        ${bookingData.totalPrice.toFixed(2)}
                      </p>
                      {/* Note: 12px, tertiary, 130% line-height */}
                      <p className="font-normal" style={{ fontSize: "12px", color: "#8D949B", lineHeight: "1.3" }}>
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
