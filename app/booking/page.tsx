"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Home, Calendar, Clock, CreditCard, Tag, CheckCircle2, CloudSun, Wind, AlertTriangle, UserPlus, X, Search, Check } from "lucide-react";
import { getWeatherForecast, getWeatherWarning, WeatherData } from "@/lib/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import HorseSelectionModal from "@/components/booking/HorseSelectionModal";

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  pricePerHour: number | null;
  media?: Array<{ type: string; url: string }>;
}

interface Stable {
  id: string;
  name: string;
  location: string;
  minLeadTimeHours?: number;
}

interface RiderSlot {
  id: string; // unique temp id for the slot
  riderId?: string; // if verified user
  riderName?: string;
  riderEmail?: string;
  isVerified: boolean;
  selectedHorse?: Horse;
  isGuest: boolean; // true for additional slots
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Get booking details from URL params
  const stableId = searchParams.get("stableId");
  const horseId = searchParams.get("horseId");

  const [stable, setStable] = useState<Stable | null>(null);
  const [horse, setHorse] = useState<Horse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking form state - initialize with empty/static values to prevent hydration mismatch
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadTimeWarning, setLeadTimeWarning] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);

  // Group Booking State
  const [riderSlots, setRiderSlots] = useState<RiderSlot[]>([]);
  const [isHorseModalOpen, setIsHorseModalOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  // Initialize date/time from URL params after mount (client-side only)
  useEffect(() => {
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const startTime = searchParams.get("startTime") || "09:00";
    const endTime = searchParams.get("endTime") || "10:00";

    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
  }, [searchParams]);

  // Initialize primary rider slot
  useEffect(() => {
    if (session?.user && horse && riderSlots.length === 0) {
      setRiderSlots([
        {
          id: "primary",
          riderId: session.user.id,
          riderName: session.user.name || "You",
          riderEmail: session.user.email || "",
          isVerified: true,
          selectedHorse: horse,
          isGuest: false,
        }
      ]);
    }
  }, [session, horse]);

  // Fetch stable and horse data
  useEffect(() => {
    if (!stableId || !horseId) {
      setError("Missing booking information. Please select a horse from the stable page.");
      setIsLoading(false);
      return;
    }

    async function fetchBookingData() {
      try {
        // Fetch stable
        const stableRes = await fetch(`/api/stables/${stableId}`);
        if (!stableRes.ok) throw new Error("Failed to fetch stable");
        const stableData = await stableRes.json();
        setStable(stableData);

        // Fetch horse
        const horseRes = await fetch(`/api/horses/${horseId}`);
        if (!horseRes.ok) throw new Error("Failed to fetch horse");
        const horseData = await horseRes.json();
        setHorse(horseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking details");
        toast.error("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookingData();
  }, [stableId, horseId]);

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/signin?redirect=/booking?${searchParams.toString()}`);
    }
  }, [status, router, searchParams]);

  // Enforce lead time: check if booking is within minimum notice period
  useEffect(() => {
    if (!stable || !selectedDate || !selectedStartTime) return;

    const minLeadTimeHours = stable.minLeadTimeHours || 8; // Default 8 hours
    const now = new Date();
    const bookingDateTime = new Date(`${selectedDate}T${selectedStartTime}`);
    const minimumBookingTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);

    // Check if booking is within lead time period
    if (bookingDateTime < minimumBookingTime) {
      // Auto-shift to next day at same time
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split("T")[0];

      setSelectedDate(tomorrowDate);
      setLeadTimeWarning(
        `This stable requires ${minLeadTimeHours} hours advance booking. Your ride has been scheduled for ${new Date(tomorrowDate).toLocaleDateString()}.`
      );
      toast.warning(`Booking requires ${minLeadTimeHours} hours notice. Date adjusted to tomorrow.`);
    } else {
      setLeadTimeWarning(""); // Clear warning if booking time is valid
    }
  }, [stable, selectedDate, selectedStartTime]);

  // Fetch weather forecast
  useEffect(() => {
    if (selectedDate && selectedStartTime) {
      const date = new Date(`${selectedDate}T${selectedStartTime}`);
      getWeatherForecast(date).then(data => {
        setWeather(data);
        setWeatherWarning(getWeatherWarning(data));
      });
    }
  }, [selectedDate, selectedStartTime]);

  // Group Booking Functions
  const addRiderSlot = () => {
    if (riderSlots.length >= 10) {
      toast.error("Maximum group size is 10 riders");
      return;
    }

    const newSlot: RiderSlot = {
      id: Math.random().toString(36).substr(2, 9),
      isVerified: false,
      isGuest: true,
      riderEmail: "",
    };

    setRiderSlots([...riderSlots, newSlot]);
  };

  const removeRiderSlot = (id: string) => {
    setRiderSlots(riderSlots.filter(slot => slot.id !== id));
  };

  const updateRiderEmail = (id: string, email: string) => {
    setRiderSlots(riderSlots.map(slot =>
      slot.id === id ? { ...slot, riderEmail: email, isVerified: false, riderName: undefined, riderId: undefined } : slot
    ));
  };

  const verifyRider = async (id: string) => {
    const slot = riderSlots.find(s => s.id === id);
    if (!slot || !slot.riderEmail) return;

    try {
      const res = await fetch("/api/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: slot.riderEmail }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please try again later.");
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "User not found. Please check the email.");
        return;
      }

      setRiderSlots(riderSlots.map(s =>
        s.id === id ? {
          ...s,
          isVerified: true,
          riderId: data.user.id,
          riderName: data.user.fullName
        } : s
      ));
      toast.success(`Verified: ${data.user.fullName}`);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to verify user");
    }
  };

  const openHorseSelection = (slotId: string) => {
    setActiveSlotId(slotId);
    setIsHorseModalOpen(true);
  };

  const handleHorseSelect = (horse: Horse) => {
    if (!activeSlotId) return;

    setRiderSlots(riderSlots.map(slot =>
      slot.id === activeSlotId ? { ...slot, selectedHorse: horse } : slot
    ));

    setIsHorseModalOpen(false);
    setActiveSlotId(null);
  };

  // Calculate price with group discount
  const calculatePrice = () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return 0;

    const start = new Date(`${selectedDate}T${selectedStartTime}`);
    const end = new Date(`${selectedDate}T${selectedEndTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    let basePrice = 0;

    // Sum up price for all selected horses
    riderSlots.forEach(slot => {
      if (slot.selectedHorse?.pricePerHour) {
        basePrice += slot.selectedHorse.pricePerHour * hours;
      }
    });

    // Apply 10% group discount for 5+ riders
    if (riderSlots.length >= 5) {
      basePrice = basePrice * 0.9;
    }

    return Math.max(0, basePrice - promoDiscount);
  };

  const getGroupDiscount = () => {
    if (riderSlots.length < 5) return 0;
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return 0;

    const start = new Date(`${selectedDate}T${selectedStartTime}`);
    const end = new Date(`${selectedDate}T${selectedEndTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    let basePrice = 0;
    riderSlots.forEach(slot => {
      if (slot.selectedHorse?.pricePerHour) {
        basePrice += slot.selectedHorse.pricePerHour * hours;
      }
    });

    return basePrice * 0.1; // 10% discount
  };

  const calculateHours = () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return 0;
    const start = new Date(`${selectedDate}T${selectedStartTime}`);
    const end = new Date(`${selectedDate}T${selectedEndTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    // Ensure we return a valid number
    return isNaN(hours) || !isFinite(hours) ? 0 : hours;
  };

  // Helper to safely format numbers
  const safeToFixed = (value: any, decimals: number = 0) => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return (0).toFixed(decimals);
    return num.toFixed(decimals);
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoError("");
    const code = promoCode.trim().toUpperCase();

    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPromoError(data.error || "Invalid promo code");
        toast.error(data.error || "Invalid promo code");
        return;
      }

      if (data.valid) {
        // Calculate discount
        let discount = 0;
        const price = calculatePrice();

        if (data.discountType === "percentage") {
          discount = (price * data.discountAmount) / 100;
        } else {
          discount = data.discountAmount;
        }

        setPromoDiscount(discount);
        setAppliedPromo(data.code);
        setPromoCodeId(data.id);
        setPromoCode("");
        toast.success(`Promo code applied! EGP ${discount.toFixed(2)} discount`);
      }
    } catch (err) {
      console.error("Promo validation error:", err);
      setPromoError("Failed to validate promo code");
      toast.error("Failed to validate promo code");
    }
  };

  const removePromoCode = () => {
    setPromoDiscount(0);
    setAppliedPromo(null);
    setPromoCodeId(null);
    setPromoCode("");
    setPromoError("");
    toast.success("Promo code removed");
  };

  const handleCheckout = async () => {
    if (!session) {
      router.push(`/signin?redirect=/booking?${searchParams.toString()}`);
      return;
    }

    if (!stableId) {
      setError("Missing booking information");
      return;
    }

    // Validate all slots
    const invalidSlots = riderSlots.filter(s => !s.isVerified || !s.selectedHorse);
    if (invalidSlots.length > 0) {
      toast.error("Please verify all riders and select horses for everyone");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const startDateTime = new Date(`${selectedDate}T${selectedStartTime}`);
      const endDateTime = new Date(`${selectedDate}T${selectedEndTime}`);
      const totalPrice = calculatePrice();

      const bookingsPayload = riderSlots.map(slot => ({
        riderId: slot.riderId,
        horseId: slot.selectedHorse?.id
      }));

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stableId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          bookings: bookingsPayload,
          paymentMethod,
          promoCodeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const data = await response.json();

      // Use the first booking ID for redirection/reference
      const primaryBookingId = data.bookings[0].id;

      if (paymentMethod === "cash") {
        // For cash payments, redirect to success page
        router.push(`/payment/success?bookingId=${primaryBookingId}`);
      } else {
        // For card payments, redirect to payment page
        router.push(`/payment/paymob?bookingId=${primaryBookingId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const horseImage = horse?.media?.find(m => m.type === "image")?.url || horse?.imageUrls?.[0] || "/gallery1.jpg";

  if (status === "loading" || isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !stable || !horse) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center px-4">
        <div className="text-center text-white">
          <p className="mb-4">{error || "Failed to load booking details"}</p>
          <Link href="/stables">
            <Button>Back to Stables</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Don't render until date/time values are populated to prevent calculation errors
  if (!selectedDate || !selectedStartTime || !selectedEndTime) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 h-full w-full opacity-30"
          style={{
            backgroundImage: "url(/hero-bg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-7xl flex flex-col px-4 py-2 md:py-6">
          {/* Header */}
          <div className="mb-4 md:mb-6 flex-shrink-0">
            <Link
              href={`/stables/${stableId}`}
              className="mb-2 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Stable</span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-lg md:text-3xl">
              Complete Your Booking
            </h1>
          </div>

          <div className="flex-1 grid gap-6 md:grid-cols-12 md:gap-8">
            {/* Left Column: Horse & Date */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 pb-8 md:pb-0">


              {/* Riders & Horses */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Riders & Horses</h2>
                  <Button
                    onClick={addRiderSlot}
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    disabled={riderSlots.length >= 10}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Rider
                  </Button>
                </div>

                <div className="space-y-4">
                  {riderSlots.map((slot, index) => (
                    <div key={slot.id} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-white/20">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        {/* Rider Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                                {index + 1}
                              </span>
                              {slot.isGuest ? "Guest Rider" : "Primary Rider"}
                            </h3>
                            {slot.isGuest && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/50 hover:text-red-400"
                                onClick={() => removeRiderSlot(slot.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {slot.isGuest ? (
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  placeholder="Enter rider's email"
                                  value={slot.riderEmail}
                                  onChange={(e) => updateRiderEmail(slot.id, e.target.value)}
                                  className={`bg-white/10 border-white/20 text-white ${slot.isVerified ? "border-green-500/50 pr-8" : ""}`}
                                  readOnly={slot.isVerified}
                                />
                                {slot.isVerified && (
                                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                                )}
                              </div>
                              {!slot.isVerified ? (
                                <Button
                                  onClick={() => verifyRider(slot.id)}
                                  disabled={!slot.riderEmail}
                                  variant="secondary"
                                >
                                  Verify
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateRiderEmail(slot.id, "")}
                                  className="text-xs text-white/50"
                                >
                                  Change
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              {slot.riderName} ({slot.riderEmail})
                            </div>
                          )}
                        </div>

                        {/* Horse Selection */}
                        <div className="w-full md:w-1/3">
                          {slot.selectedHorse ? (
                            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20">
                              <div className="relative h-24 w-full">
                                <Image
                                  src={slot.selectedHorse.media?.find(m => m.type === "image")?.url || slot.selectedHorse.imageUrls?.[0] || "/hero-bg.webp"}
                                  alt={slot.selectedHorse.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                  <p className="text-sm font-bold text-white">{slot.selectedHorse.name}</p>
                                  <p className="text-xs text-primary">EGP {slot.selectedHorse.pricePerHour}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full rounded-t-none text-xs text-white/70 hover:bg-white/10"
                                onClick={() => openHorseSelection(slot.id)}
                              >
                                Change Horse
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="h-24 w-full border-dashed border-white/20 bg-transparent text-white/50 hover:bg-white/5 hover:text-white"
                              onClick={() => openHorseSelection(slot.id)}
                            >
                              <Search className="mr-2 h-4 w-4" />
                              Select Horse
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horse Selection Modal */}
              <HorseSelectionModal
                isOpen={isHorseModalOpen}
                onClose={() => setIsHorseModalOpen(false)}
                onSelect={handleHorseSelect}
                stableId={stableId || ""}
                selectedDate={selectedDate}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                excludedHorseIds={riderSlots.map(s => s.selectedHorse?.id).filter(Boolean) as string[]}
              />

              {leadTimeWarning && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-xs">{leadTimeWarning}</p>
                </div>
              )}

              {/* Weather Widget */}
              {weather && (
                <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{weather.icon}</span>
                      <div>
                        <p className="text-white font-medium text-sm">Weather Forecast</p>
                        <p className="text-white/60 text-xs">{weather.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{weather.temp}°C</p>
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <Wind className="h-3 w-3" />
                        <span>{weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>

                  {weatherWarning && (
                    <div className="mt-2 flex items-start gap-2 p-2 rounded bg-amber-500/20 border border-amber-500/30">
                      <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200">{weatherWarning}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col pb-8 md:pb-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-xl flex flex-col">
              <h2 className="mb-4 text-lg md:text-xl font-bold text-white flex-shrink-0">Booking Summary</h2>

              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Stable Info */}
                <div>
                  <p className="text-sm text-white/70">Stable</p>
                  <p className="font-semibold text-white">{stable.name}</p>
                  <p className="text-xs text-white/60">{stable.location}</p>
                </div>

                {/* Date & Time Summary */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Date:</span>
                    <span className="text-white">{selectedDate ? new Date(selectedDate).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Time:</span>
                    <span className="text-white">{selectedStartTime && selectedEndTime ? `${selectedStartTime} - ${selectedEndTime}` : '-'}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <Label className="text-white text-sm">Promo Code</Label>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">{appliedPromo}</span>
                        <span className="text-green-400/70 text-xs">Applied</span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Remove promo code"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError("");
                          }}
                          className="h-10 bg-white/10 border-white/20 text-white text-base placeholder:text-white/50 focus:border-white/40"
                          style={{ fontSize: '16px' }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePromoCode}
                          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-rose-400 text-xs mt-1">{promoError}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <Label className="text-white">Payment Method</Label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${paymentMethod === "cash"
                        ? "border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.1)]"
                        : "border-white/20 bg-white/5 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-white/10 p-2">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-white">Cash</span>
                        </div>
                        {paymentMethod === "cash" && (
                          <CheckCircle2 className="h-5 w-5 text-[rgb(218,165,32)]" />
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled
                      className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-left opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-white/10 p-2">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-white">Card</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Section of Card - Fixed at bottom on desktop */}
              <div className="mt-4 space-y-4 border-t border-white/10 pt-4 flex-shrink-0">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal:</span>
                  <span className="text-white">EGP {safeToFixed((horse?.pricePerHour || 0) * calculateHours(), 0)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Promo Discount:</span>
                    <span>-EGP {safeToFixed(promoDiscount, 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="text-xl font-bold text-[rgb(218,165,32)]">
                    EGP {safeToFixed(calculatePrice(), 0)}
                  </span>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  disabled={isSubmitting || !selectedDate || !selectedStartTime || !selectedEndTime}
                  className="w-full h-12 bg-[rgb(218,165,32)] hover:bg-[rgb(218,165,32)]/90 text-black font-semibold"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
