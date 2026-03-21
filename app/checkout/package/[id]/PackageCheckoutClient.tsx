"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar as CalendarIcon, CheckCircle2, Ticket, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PackageCheckoutClient({ pkg }: { pkg: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState<string>("");
  const [tickets, setTickets] = useState<number>(pkg.minPeople);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const isPrivate = pkg.packageType === "PRIVATE";
  const finalPrice = isPrivate ? pkg.price : pkg.price * tickets;

  const minDate = new Date().toISOString().split("T")[0];

  const safeToFixed = (value: any, decimals: number = 0) => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return (0).toFixed(decimals);
    return num.toFixed(decimals);
  };

  const handleCheckout = async () => {
    if (status === "unauthenticated") {
      toast.error("Please log in to complete your booking.");
      router.push(`/login?callbackUrl=/checkout/package/${pkg.id}`);
      return;
    }

    if (!date) {
      setError("Please select a date for your experience.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          date,
          startTime: pkg.startTime || "10:00",
          ticketsCount: isPrivate ? pkg.maxPeople : tickets,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success("Booking confirmed! Redirecting...");
        router.push(`/payment/success?packageBookingId=${data.bookingId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during checkout.");
      toast.error(err.message || "An error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black safe-area-black relative pt-safe">
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
              href={`/packages`}
              className="mb-2 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Packages</span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-lg md:text-3xl">
              Complete Your Booking
            </h1>
          </div>

          <div className="flex-1 grid gap-6 md:grid-cols-12 md:gap-8">
            {/* Left Column: Package Details & Form */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 pb-8 md:pb-0">
              
              {/* Selected Package Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Selected Package</h2>
                
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-white/20">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="w-full md:w-1/3">
                      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20">
                        <div className="relative h-32 w-full">
                          <Image
                            src={pkg.imageUrl || "/hero-bg.webp"}
                            alt={pkg.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm font-bold text-white">{isPrivate ? "Private VIP" : "Group Event"}</p>
                            <p className="text-xs text-[rgb(218,165,32)]">EGP {pkg.price} {isPrivate ? "Total" : "/ ticket"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{pkg.title}</h3>
                          <p className="mt-1 text-sm text-white/70 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-[rgb(218,165,32)] flex-shrink-0 ml-4 hidden sm:block" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{pkg.duration} hours</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Up to {pkg.maxPeople} people</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Options Form */}
              <div className="space-y-4 mt-4">
                <h2 className="text-xl font-bold text-white">Date & Guests</h2>
                
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="date" className="text-white text-sm">
                        Select Date *
                        {date && (
                          <span className="ml-2 text-xs font-normal text-white/50">
                            ({new Date(date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })})
                          </span>
                        )}
                      </Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 pointer-events-none z-10" />
                        <input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            setError("");
                          }}
                          min={minDate}
                          className="h-12 w-full rounded-md border border-white/20 bg-white/5 px-10 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(218,165,32)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                          required
                        />
                      </div>
                      {pkg.availableDays && pkg.availableDays.length > 0 && pkg.availableDays[0] !== "Everyday" && (
                        <p className="text-xs text-[rgb(218,165,32)]/80 mt-1">
                          Usually runs on: {pkg.availableDays.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Guests / Tickets */}
                    <div className="space-y-3">
                      <Label htmlFor="tickets" className="text-white text-sm">
                        {isPrivate ? "Group Size" : "Number of Tickets *"}
                      </Label>
                      {isPrivate ? (
                        <div className="h-12 w-full rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm text-white flex items-center">
                          <Users className="w-5 h-5 mr-3 text-white/50" />
                          Private VIP (Up to {pkg.maxPeople} guests included)
                        </div>
                      ) : (
                        <div className="relative">
                          <Ticket className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 pointer-events-none z-10" />
                          <select 
                            id="tickets"
                            className="h-12 w-full rounded-md border border-white/20 bg-[#121212] px-10 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(218,165,32)] focus-visible:ring-offset-2"
                            value={tickets}
                            onChange={(e) => setTickets(Number(e.target.value))}
                          >
                            {Array.from({ length: pkg.maxPeople - pkg.minPeople + 1 }, (_, i) => pkg.minPeople + i).map(num => (
                              <option key={num} value={num} className="bg-black text-white">{num} {num === 1 ? 'Ticket' : 'Tickets'}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col pb-8 md:pb-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-xl flex flex-col sticky top-24">
                <h2 className="mb-4 text-lg md:text-xl font-bold text-white flex-shrink-0">Booking Summary</h2>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Package Info */}
                  <div>
                    <p className="text-sm text-white/70">Package</p>
                    <p className="font-semibold text-white">{pkg.title}</p>
                    <p className="text-xs text-[rgb(218,165,32)]">{isPrivate ? "Private Event" : "Group Experience"}</p>
                  </div>

                  {/* Date & Time Summary */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Date:</span>
                      <span className="text-white">{date ? new Date(date).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Time:</span>
                      <span className="text-white">{pkg.startTime || "10:00"} (Approx {pkg.duration} hrs)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">{isPrivate ? "Guests:" : "Tickets:"}</span>
                      <span className="text-white">{isPrivate ? `Up to ${pkg.maxPeople}` : tickets}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <Label className="text-white text-sm">Secure Payment</Label>
                    <div className="rounded-lg border border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.1)] p-3 flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[rgb(218,165,32)] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/90">
                        Payment will be processed securely via Stripe. Your booking is instantly confirmed upon success.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section of Card - Fixed at bottom on desktop */}
                <div className="mt-6 space-y-4 border-t border-white/10 pt-4 flex-shrink-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Subtotal:</span>
                    <span className="text-white">EGP {safeToFixed(finalPrice, 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total:</span>
                    <span className="text-xl font-bold text-[rgb(218,165,32)]">
                      EGP {safeToFixed(finalPrice, 2)}
                    </span>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm flex items-start gap-2">
                       <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                       <span className="text-red-400">{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full h-12 bg-[rgb(218,165,32)] hover:bg-[rgb(218,165,32)]/90 text-black font-semibold text-base"
                  >
                    {isProcessing ? "Processing..." : "Confirm & Pay"}
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
