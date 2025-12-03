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

  const horseImage = horse?.media?.find(m => m.type === "image")?.url || horse?.imageUrls?.[0];

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !stable || !horse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black flex items-center justify-center px-4">
        <div className="text-center text-white">
          <p className="mb-4">{error || "Failed to load booking details"}</p>
          <Link href="/stables">
            <Button>Back to Stables</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
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
      <div className="relative z-10 min-h-screen px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/stables/${stableId}`}
              className="mb-6 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Stable</span>
            </Link>
            <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-4xl">
              Complete Your Booking
            </h1>
            <p className="text-white/70">
              Review your booking details and proceed to checkout
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Booking Details Card */}
            <div className="md:col-span-2 space-y-6">
              {/* Horse Details */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-white">Horse Selection</h2>

                {horseImage && (
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl">
                    <Image
                      src={horseImage}
                      alt={horse.name}
                      width={800}
                      height={450}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{horse.name}</h3>
                    <p className="text-sm text-white/70">{horse.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-white/70">Price per hour:</span>
                    <span className="font-semibold text-white">
                      EGP {horse.pricePerHour?.toFixed(0) || "0"}
                    </span>
                  </div>
                </div>

                {/* View Portfolio Button */}
                <Button
                  variant="outline"
                  className="mt-4 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    // TODO: Open portfolio viewer
                    toast.info("Portfolio viewer coming soon");
                  }}
                >
                  View Portfolio
                </Button>
              </div>

              {/* Date & Time Selection */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-white">Date & Time</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-12 bg-white/10 border-white/20 pl-10 text-white placeholder:text-white/50 focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                      <Input
                        type="time"
                        value={selectedStartTime}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          setSelectedStartTime(newStartTime);

                          // Automatically set end time to 1 hour after start time
                          if (newStartTime) {
                            const [hours, minutes] = newStartTime.split(':').map(Number);
                            const endDate = new Date();
                            endDate.setHours(hours + 1, minutes, 0, 0);
                            const endHours = endDate.getHours();
                            const endMinutes = endDate.getMinutes();
                            setSelectedEndTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
                          }
                        }}
                        className="h-12 bg-white/10 border-white/20 pl-10 text-white placeholder:text-white/50 focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
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
            </div>

            {/* Checkout Summary */}
            <div className="md:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-white">Booking Summary</h2>

                <div className="space-y-4">
                  {/* Stable Info */}
                  <div>
                    <p className="text-sm text-white/70">Stable</p>
                    <p className="font-semibold text-white">{stable.name}</p>
                    <p className="text-xs text-white/60">{stable.location}</p>
                  </div>

                  {/* Horse Info */}
                  <div>
                    <p className="text-sm text-white/70">Horse</p>
                    <p className="font-semibold text-white">{horse.name}</p>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Date:</span>
                      <span className="text-white">{selectedDate ? new Date(selectedDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Time:</span>
                      <span className="text-white">{selectedStartTime && selectedEndTime ? `${selectedStartTime} - ${selectedEndTime}` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Duration:</span>
                      <span className="text-white">{calculateHours().toFixed(1)} hours</span>
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
                        <p className="mt-1 text-xs text-white/60">Pay on arrival</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toast.info("Card payment coming soon");
                        }}
                        className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-left opacity-50"
                        disabled
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-white/10 p-2">
                              <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white">Card (Visa/Mastercard)</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-white/60">Coming soon</p>
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Subtotal:</span>
                      <span className="text-white">EGP {(((horse?.pricePerHour || 0) * calculateHours()) || 0).toFixed(0)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Promo Discount:</span>
                        <span>-EGP {(promoDiscount || 0).toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="text-xl font-bold text-[rgb(218,165,32)]">
                        EGP {(calculatePrice() || 0).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Checkout Button */}
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

          {/* Home Button */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
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
