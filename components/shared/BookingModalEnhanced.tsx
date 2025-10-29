"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin,
  Sunrise,
  Sunset,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
}

interface BookingModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stableId: string;
  stableName: string;
  horses: Horse[];
  pricePerHour?: number;
  currency?: string;
}

type BookingStep = "date" | "horse" | "options" | "summary";

const SUNRISE_TIMES = {
  jan: "06:30", feb: "06:30", mar: "05:45",
  apr: "05:15", may: "05:00", jun: "04:50",
  jul: "05:00", aug: "05:15", sep: "05:30",
  oct: "05:50", nov: "06:15", dec: "06:30"
};

const SUNSET_TIMES = {
  jan: "17:15", feb: "17:30", mar: "17:45",
  apr: "18:00", may: "18:15", jun: "18:30",
  jul: "18:30", aug: "18:00", sep: "17:45",
  oct: "17:30", nov: "17:00", dec: "17:00"
};

export default function BookingModalEnhanced({
  open,
  onOpenChange,
  stableId,
  stableName,
  horses,
  pricePerHour = 50,
  currency = "EGP",
}: BookingModalEnhancedProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>("date");
  const [selectedHorseId, setSelectedHorseId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [selectedRiders, setSelectedRiders] = useState<number>(1);
  const [pickupRequested, setPickupRequested] = useState<boolean>(false);
  const [addons, setAddons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get suggested times based on selected date
  const getSuggestedTimes = () => {
    if (!selectedDate) return { sunrise: "05:30", sunset: "17:30" };
    
    const month = new Date(selectedDate).getMonth();
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    
    return {
      sunrise: SUNRISE_TIMES[monthNames[month] as keyof typeof SUNRISE_TIMES],
      sunset: SUNSET_TIMES[monthNames[month] as keyof typeof SUNSET_TIMES]
    };
  };

  const suggestedTimes = getSuggestedTimes();

  const minDate = new Date().toISOString().split("T")[0];

  const calculatePrice = () => {
    if (!selectedDate || !startTime || !endTime) return 0;
    
    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    const basePrice = hours * pricePerHour * selectedRiders;
    const addonPrice = addons.length * 20; // 20 EGP per addon
    const pickupPrice = pickupRequested ? 50 : 0;
    
    return basePrice + addonPrice + pickupPrice;
  };

  const calculateHours = () => {
    if (!selectedDate || !startTime || !endTime) return 0;
    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const handleSubmit = async () => {
    if (!session) {
      setError("Please sign in to book");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      const totalPrice = calculatePrice();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stableId,
          horseId: selectedHorseId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          riders: selectedRiders,
          pickup: pickupRequested,
          addons,
          totalPrice,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const data = await response.json();
      router.push(`/payment/success?bookingId=${data.booking.id}`);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppFallback = () => {
    const message = encodeURIComponent([
      `PyraRide Booking Request`,
      `Stable: ${stableName}`,
      `Date: ${selectedDate}`,
      `Time: ${startTime} - ${endTime}`,
      `Riders: ${selectedRiders}`,
      `Pickup: ${pickupRequested ? "Yes" : "No"}`,
      `Total: ${currency} ${calculatePrice()}`,
    ].join("\n"));
    
    window.open(`https://wa.me/201234567890?text=${message}`, "_blank");
  };

  const canProceed = () => {
    switch (currentStep) {
      case "date": return selectedDate && startTime && endTime;
      case "horse": return selectedHorseId !== "";
      case "options": return true;
      case "summary": return false;
      default: return false;
    }
  };

  const steps = [
    { id: "date", label: "Date & Time" },
    { id: "horse", label: "Select Horse" },
    { id: "options", label: "Options" },
    { id: "summary", label: "Review" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Your Ride at {stableName}</DialogTitle>
          <DialogDescription>
            Complete your booking in 4 simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step.id === currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs text-center">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-0.5 w-full bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Suggested Times */}
              {selectedDate && (
                <Card className="p-4 bg-primary/5">
                  <h3 className="text-sm font-semibold mb-3">Suggested Times</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setStartTime(suggestedTimes.sunrise);
                        setEndTime(`${parseInt(suggestedTimes.sunrise.split(":")[0]) + 2}:${suggestedTimes.sunrise.split(":")[1]}`);
                      }}
                    >
                      <Sunrise className="h-4 w-4" />
                      Sunrise Ride
                      <span className="text-xs text-muted-foreground ml-auto">
                        {suggestedTimes.sunrise}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setStartTime(suggestedTimes.sunset);
                        setEndTime(`${parseInt(suggestedTimes.sunset.split(":")[0]) + 2}:${suggestedTimes.sunset.split(":")[1]}`);
                      }}
                    >
                      <Sunset className="h-4 w-4" />
                      Sunset Ride
                      <span className="text-xs text-muted-foreground ml-auto">
                        {suggestedTimes.sunset}
                      </span>
                    </Button>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <Card className="p-4 bg-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-2xl font-bold">{calculateHours().toFixed(1)} hours</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Base Price</p>
                    <p className="text-2xl font-bold text-primary">
                      {currency} {calculatePrice()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === "horse" && (
            <motion.div
              key="horse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-semibold">Select Your Horse</h3>
              <div className="grid gap-3">
                {horses
                  .filter((h) => h.isActive)
                  .map((horse) => (
                    <Card
                      key={horse.id}
                      className={`cursor-pointer transition-all ${
                        selectedHorseId === horse.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedHorseId(horse.id)}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          🐴
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{horse.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {horse.description}
                          </p>
                        </div>
                        {selectedHorseId === horse.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </motion.div>
          )}

          {currentStep === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="riders">Number of Riders</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedRiders(Math.max(1, selectedRiders - 1))}
                  >
                    -
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">
                    {selectedRiders}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedRiders(selectedRiders + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Hotel Pickup</p>
                      <p className="text-sm text-muted-foreground">
                        We&apos;ll pick you up from your hotel
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={pickupRequested ? "default" : "outline"}
                    onClick={() => setPickupRequested(!pickupRequested)}
                  >
                    {pickupRequested ? "Included" : "Add +50 EGP"}
                  </Button>
                </div>
              </Card>

              <div>
                <Label>Add-ons (Optional)</Label>
                <div className="mt-2 space-y-2">
                  {[
                    { id: "guide", label: "Private Guide (+100 EGP)" },
                    { id: "helmet", label: "Helmet Rental (+20 EGP)" },
                    { id: "photos", label: "Photo Package (+50 EGP)" },
                  ].map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={addons.includes(addon.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAddons([...addons, addon.id]);
                          } else {
                            setAddons(addons.filter((a) => a !== addon.id));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{addon.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-secondary">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price</span>
                    <span>{currency} {calculateHours() * pricePerHour * selectedRiders}</span>
                  </div>
                  {pickupRequested && (
                    <div className="flex justify-between text-sm">
                      <span>Pickup</span>
                      <span>{currency} 50</span>
                    </div>
                  )}
                  {addons.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Add-ons</span>
                      <span>{currency} {addons.length * 20}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      {currency} {calculatePrice()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-semibold">Review Your Booking</h3>
              
              <Card className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stable</span>
                  <span className="font-medium">{stableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{startTime} - {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Riders</span>
                  <span className="font-medium">{selectedRiders}</span>
                </div>
                {pickupRequested && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup</span>
                    <span className="font-medium">Included</span>
                  </div>
                )}
                {addons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add-ons</span>
                    <span className="font-medium">{addons.join(", ")}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {currency} {calculatePrice()}
                  </span>
                </div>
              </Card>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleWhatsAppFallback}
                  disabled={isSubmitting}
                >
                  <MessageCircle className="h-4 w-4" />
                  Book via WhatsApp
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Processing..." : "Complete Booking"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          {currentStep !== "date" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const stepIndex = steps.findIndex((s) => s.id === currentStep);
                if (stepIndex > 0) {
                  setCurrentStep(steps[stepIndex - 1].id as BookingStep);
                }
              }}
            >
              Back
            </Button>
          )}
          {currentStep !== "summary" && (
            <Button
              type="button"
              disabled={!canProceed()}
              onClick={() => {
                const stepIndex = steps.findIndex((s) => s.id === currentStep);
                if (stepIndex < steps.length - 1) {
                  setCurrentStep(steps[stepIndex + 1].id as BookingStep);
                }
              }}
              className={currentStep === "date" ? "ml-auto" : ""}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

