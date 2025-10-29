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
import { CalendarIcon, Clock, DollarSign, Users } from "lucide-react";

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
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to payment
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // If no checkout URL, maybe it's direct booking (for development)
        onOpenChange(false);
        alert("Booking created successfully! Check your dashboard.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      setIsSubmitting(false);
    }
  };

  const hours = calculateHours();
  const totalPrice = calculatePrice();

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
