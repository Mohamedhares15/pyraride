"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Home, Calendar, Clock, CreditCard, Tag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize date/time from URL params after mount (client-side only)
  useEffect(() => {
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const startTime = searchParams.get("startTime") || "09:00";
    const endTime = searchParams.get("endTime") || "10:00";

    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
  }, [searchParams]);

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

  // Calculate price
  const calculatePrice = () => {
    if (!horse || !selectedDate || !selectedStartTime || !selectedEndTime) return 0;

    const start = new Date(`${selectedDate}T${selectedStartTime}`);
    const end = new Date(`${selectedDate}T${selectedEndTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const horsePrice = horse.pricePerHour || 0;

    const basePrice = hours > 0 ? hours * horsePrice : 0;
    return Math.max(0, basePrice - promoDiscount);
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
      toast.error("Please enter a promo code");
      return;
    }

    // TODO: Implement promo code validation API
    toast.info("Promo code feature coming soon");
    // For now, just show a message
  };

  const handleCheckout = async () => {
    if (!session) {
      router.push(`/signin?redirect=/booking?${searchParams.toString()}`);
      return;
    }

    if (!stableId || !horseId) {
      setError("Missing booking information");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const startDateTime = new Date(`${selectedDate}T${selectedStartTime}`);
      const endDateTime = new Date(`${selectedDate}T${selectedEndTime}`);
      const totalPrice = calculatePrice();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stableId,
          horseId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          riders: 1,
          pickup: false,
          addons: [],
          totalPrice,
          currency: "EGP",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const data = await response.json();

      if (paymentMethod === "cash") {
        // For cash payments, redirect to success page
        router.push(`/payment/success?bookingId=${data.booking.id}`);
      } else {
        // For card payments, redirect to payment page
        router.push(`/payment/paymob?bookingId=${data.booking.id}`);
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
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto overflow-x-hidden md:overflow-hidden">
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
        <div className="mx-auto max-w-7xl flex flex-col px-4 py-2 md:h-full md:py-6">
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
            {/* On mobile: h-auto (scrolls with page). On desktop: overflow-y-auto (independent scroll) */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 md:overflow-y-auto md:pr-2 md:custom-scrollbar pb-8 md:pb-0">

              {/* Horse Details */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-xl">
                <h2 className="mb-4 text-lg md:text-xl font-bold text-white">Horse Selection</h2>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 aspect-video relative overflow-hidden rounded-xl bg-white/5">
                    <Image
                      src={horseImage}
                      alt={horse.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/gallery1.jpg";
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{horse.name}</h3>
                      <p className="text-sm text-white/70 line-clamp-3">{horse.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-white/70">Price per hour:</span>
                      <span className="font-semibold text-white">
                        EGP {safeToFixed(horse.pricePerHour, 0)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => toast.info("Portfolio viewer coming soon")}
                    >
                      View Portfolio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-xl">
                <h2 className="mb-4 text-lg md:text-xl font-bold text-white">Date & Time</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 w-full">
                    <Label className="text-white">Date</Label>
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-12 bg-white/10 border-white/20 pl-10 pr-2 text-white placeholder:text-white/50 focus:border-white/40 w-full max-w-full box-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label className="text-white">Start Time</Label>
                    <div className="relative w-full">
                      <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                      <Input
                        type="time"
                        value={selectedStartTime}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          setSelectedStartTime(newStartTime);
                          if (newStartTime) {
                            const [hours, minutes] = newStartTime.split(':').map(Number);
                            const endDate = new Date();
                            endDate.setHours(hours + 1, minutes, 0, 0);
                            const endHours = endDate.getHours();
                            const endMinutes = endDate.getMinutes();
                            setSelectedEndTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
                          }
                        }}
                        className="h-12 bg-white/10 border-white/20 pl-10 pr-2 text-white placeholder:text-white/50 focus:border-white/40 w-full max-w-full box-border"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Duration</p>
                      <p className="font-semibold text-white">1 hour (fixed)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70">End Time</p>
                      <p className="font-semibold text-white">{selectedEndTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            {/* On mobile: h-auto. On desktop: h-full (fixed height) */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col md:h-full pb-8 md:pb-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-xl flex flex-col md:h-full">
                <h2 className="mb-4 text-lg md:text-xl font-bold text-white flex-shrink-0">Booking Summary</h2>

                {/* Scrollable content on desktop */}
                <div className="flex-1 space-y-4 md:overflow-y-auto md:custom-scrollbar md:pr-2">
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
                    <Label className="text-white">Promo Code</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
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
