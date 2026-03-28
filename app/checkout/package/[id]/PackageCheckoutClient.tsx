"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar as CalendarIcon, CheckCircle2, Ticket, Users, AlertTriangle, Car } from "lucide-react";

interface TransportZone {
  id: string;
  name: string;
  price: number;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PackageCheckoutClient({ pkg }: { pkg: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState<string>("");
  const [tickets, setTickets] = useState<number>(pkg.minPeople);
  const [transportZones, setTransportZones] = useState<TransportZone[]>([
    { id: "none", name: "I will arrange my own transportation (Meet at location)", price: 0 }
  ]);
  const [selectedZone, setSelectedZone] = useState<string>("none");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pkg.hasTransportation) {
      fetch("/api/transport-zones")
        .then(res => res.json())
        .then((data: TransportZone[]) => {
          if (Array.isArray(data)) {
            const formattedZones = data.map(z => ({
              ...z,
              name: `${z.name} (+${z.price} EGP)`
            }));
            setTransportZones([
              { id: "none", name: "I will arrange my own transportation (Meet at location)", price: 0 },
              ...formattedZones
            ]);
          }
        })
        .catch(err => console.error("Failed to fetch transport zones", err));
    }
  }, [pkg.hasTransportation]);

  const isPrivate = pkg.packageType === "PRIVATE";
  const basePrice = isPrivate ? pkg.price : pkg.price * tickets;
  const transportPrice = pkg.hasTransportation ? (transportZones.find(z => z.id === selectedZone)?.price || 0) : 0;
  const finalPrice = basePrice + transportPrice;

  const minLeadTimeHours = pkg.minLeadTimeHours ?? 0;

  // Calculate the earliest allowed booking date based on lead time and package start time
  const getMinDate = () => {
    const now = new Date();
    const earliestAllowedTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);
    
    if (pkg.startTime || minLeadTimeHours > 0) {
      // If no start time is specified, assume the package closes at 6 PM (18:00) for same-day booking purposes.
      const [hour, minute] = (pkg.startTime || "18:00").split(":").map(Number);
      const todayStartTime = new Date();
      todayStartTime.setHours(hour, minute, 0, 0);
      
      // If today's slot is already past the earliest allowed time, min safe day is tomorrow (or later)
      if (todayStartTime < earliestAllowedTime) {
        const nextValidDay = new Date(earliestAllowedTime);
        nextValidDay.setHours(hour, minute, 0, 0);
        if (nextValidDay < earliestAllowedTime) {
           nextValidDay.setDate(nextValidDay.getDate() + 1);
        }
        // Keep checking if the new day is valid (edge case for very large lead times)
        return nextValidDay.toISOString().split("T")[0];
      }
    }
    
    return earliestAllowedTime.toISOString().split("T")[0];
  };

  const minDate = getMinDate();

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

    const [parsedYear, parsedMonth, parsedDay] = date.split("-").map(Number);
    const localSelectedDate = new Date(parsedYear, parsedMonth - 1, parsedDay);

    if (pkg.availableDays && pkg.availableDays.length > 0 && pkg.availableDays[0] !== "Everyday") {
      const selectedDayName = localSelectedDate.toLocaleDateString("en-US", { weekday: "long" });
      const isAvailable = pkg.availableDays.some(
        (d: string) => d.toLowerCase() === selectedDayName.toLowerCase()
      );
      if (!isAvailable) {
        setError(`This package is only available on: ${pkg.availableDays.join(", ")}. Please select a matching date.`);
        return;
      }
    }

    if (minLeadTimeHours > 0) {
      const [hour, minute] = (pkg.startTime || "18:00").split(":").map(Number);
      const bookingDateTime = new Date(localSelectedDate);
      bookingDateTime.setHours(hour, minute, 0, 0);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilBooking < minLeadTimeHours) {
        setError(`This package requires at least ${minLeadTimeHours} hours advance booking. Please select a later date.`);
        return;
      }
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
          startTime: pkg.startTime || "18:00",
          ticketsCount: isPrivate ? pkg.maxPeople : tickets,
          transportationZoneId: pkg.hasTransportation && selectedZone !== "none" 
            ? selectedZone 
            : undefined,
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
              className="mb-2 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white mt-12 md:mt-0"
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-12 w-full justify-start text-left font-normal border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                              !date && "text-white/50"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-5 w-5 text-white/50" />
                            {date ? format(new Date(date.split("-").map(Number)[0], date.split("-").map(Number)[1] - 1, date.split("-").map(Number)[2]), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border border-white/10" align="start">
                          <Calendar
                            mode="single"
                            selected={date ? new Date(date.split("-").map(Number)[0], date.split("-").map(Number)[1] - 1, date.split("-").map(Number)[2]) : undefined}
                            onSelect={(d) => {
                              if (d) {
                                const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                setDate(formatted);
                                setError("");
                              }
                            }}
                            disabled={(d) => {
                              // Normalize time for comparison
                              const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                              const minD = new Date(minDate.split("-").map(Number)[0], minDate.split("-").map(Number)[1] - 1, minDate.split("-").map(Number)[2]);
                              
                              if (checkDate < minD) return true;
                              
                              if (pkg.availableDays && pkg.availableDays.length > 0 && pkg.availableDays[0] !== "Everyday") {
                                const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" });
                                const isAvailable = pkg.availableDays.some(
                                  (availDay: string) => availDay.toLowerCase() === dayName.toLowerCase()
                                );
                                if (!isAvailable) return true;
                              }
                              
                              return false;
                            }}
                            initialFocus
                            className="bg-[#121212] rounded-md border-white/10 text-white"
                          />
                        </PopoverContent>
                      </Popover>
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

                  {/* Transportation Zone Selector */}
                  {pkg.hasTransportation && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                      <Label htmlFor="transport" className="text-white text-sm">
                        Pickup Location (Optional)
                      </Label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 pointer-events-none z-10" />
                        <select 
                          id="transport"
                          className="h-12 w-full rounded-md border border-white/20 bg-[#121212] px-10 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(218,165,32)] focus-visible:ring-offset-2 appearance-none"
                          value={selectedZone}
                          onChange={(e) => setSelectedZone(e.target.value)}
                        >
                          {transportZones.map((zone: TransportZone) => (
                            <option key={zone.id} value={zone.id} className="bg-black text-white">
                              {zone.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                      <p className="text-xs text-white/50 -mt-1">
                        Select a zone to add round-trip transportation from your hotel or home in Cairo/Giza.
                      </p>
                    </div>
                  )}
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
                    {pkg.hasTransportation && selectedZone !== "none" && (
                      <div className="flex justify-between text-sm text-[rgb(218,165,32)]">
                        <span className="text-[rgb(218,165,32)]/70 flex items-center gap-1">
                          <Car className="h-3 w-3" /> Pickup:
                        </span>
                        <span>+EGP {transportPrice}</span>
                      </div>
                    )}
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

          {/* Trust Indicators Footer to fill empty vertical space */}
          <div className="mt-12 md:mt-auto pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center opacity-80 pb-8">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <CheckCircle2 className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Best Price Guarantee</p>
              <p className="text-xs text-white/50">Absolutely no hidden fees</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <Ticket className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Instant Confirmation</p>
              <p className="text-xs text-white/50">Your ticket is booked instantly</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hidden md:block">
              <AlertTriangle className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Verified Guides</p>
              <p className="text-xs text-white/50">Safety and quality assured</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hidden md:block">
              <CalendarIcon className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Flexible Cancellation</p>
              <p className="text-xs text-white/50">Cancel up to 48h before</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
