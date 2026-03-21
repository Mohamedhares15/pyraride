"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Users, Calendar as CalendarIcon, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Fallback plain HTML Date parsing logic since we aren't using a complex Calendar component
export default function PackageCheckoutClient({ pkg }: { pkg: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState<string>("");
  const [tickets, setTickets] = useState<number>(pkg.minPeople);
  const [isProcessing, setIsProcessing] = useState(false);

  // Group events multiply price by tickets. Private events are a flat fee.
  const isPrivate = pkg.packageType === "PRIVATE";
  const finalPrice = isPrivate ? pkg.price : pkg.price * tickets;

  const handleCheckout = async () => {
    if (status === "unauthenticated") {
      toast.error("Please log in to complete your booking.");
      router.push(`/login?callbackUrl=/checkout/package/${pkg.id}`);
      return;
    }

    if (!date) {
      toast.error("Please select a date for your experience.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          date,
          startTime: pkg.startTime || "08:00", // Default to 8am if not set
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
        // Fallback for missing stripe keys
        toast.success("Booking confirmed! Redirecting...");
        router.push(`/payment/success?packageBookingId=${data.bookingId}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
      {/* Left Column - Details & Form */}
      <div className="lg:col-span-7 space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-light mb-4">Complete Booking</h1>
          <p className="text-gray-400 font-light">
            You are booking the <strong className="text-white font-medium">{pkg.title}</strong> experience.
          </p>
        </div>

        <div className="space-y-8 bg-[#0a0a0a] p-8 md:p-10 border border-white/10">
          <h2 className="text-2xl font-light text-[#D4AF37] border-b border-white/10 pb-4">
            1. Select Date & Time
          </h2>
          
          <div className="space-y-4">
            <label className="block text-sm text-gray-400 uppercase tracking-widest">Choose Date</label>
            <input 
              type="date" 
              className="w-full bg-black border border-white/20 text-white p-4 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
            {pkg.availableDays && pkg.availableDays.length > 0 && pkg.availableDays[0] !== "Everyday" && (
              <p className="text-xs text-[#D4AF37] flex items-center gap-1 mt-2">
                <Info className="w-3 h-3" />
                This package is usually available on: {pkg.availableDays.join(", ")}
              </p>
            )}
            
            <div className="pt-4">
              <label className="block text-sm text-gray-400 uppercase tracking-widest mb-2">Time Included</label>
              <div className="bg-white/5 border border-white/10 p-4 flex items-center gap-4 text-white">
                <Clock className="text-[#D4AF37]" />
                <span className="font-light">{pkg.startTime ? `Starts exactly at ${pkg.startTime}` : "Flexible start time - we will contact you"}</span>
              </div>
            </div>
          </div>
        </div>

        {!isPrivate && (
          <div className="space-y-8 bg-[#0a0a0a] p-8 md:p-10 border border-white/10">
            <h2 className="text-2xl font-light text-[#D4AF37] border-b border-white/10 pb-4">
              2. Number of Guests
            </h2>
            <div className="space-y-4">
              <label className="block text-sm text-gray-400 uppercase tracking-widest">Tickets</label>
              <select 
                className="w-full bg-black border border-white/20 text-white p-4 focus:border-[#D4AF37] outline-none appearance-none cursor-pointer"
                value={tickets}
                onChange={(e) => setTickets(Number(e.target.value))}
              >
                {Array.from({ length: pkg.maxPeople - pkg.minPeople + 1 }, (_, i) => pkg.minPeople + i).map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'} (EGP {pkg.price * num})</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-5">
        <div className="sticky top-32 bg-[#050505] border border-[#D4AF37]/30 p-8 shadow-[0_0_40px_rgba(212,175,55,0.05)]">
          <h3 className="text-xl font-light uppercase tracking-widest text-[#D4AF37] mb-6">Order Summary</h3>
          
          <div className="relative aspect-video w-full mb-6 overflow-hidden">
            <Image src={pkg.imageUrl} alt={pkg.title} fill className="object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/40 border border-white/10"></div>
          </div>
          
          <h4 className="text-2xl font-display font-light mb-2">{pkg.title}</h4>
          <p className="text-sm text-gray-400 font-light mb-8 pb-6 border-b border-white/10 line-clamp-2">
            {pkg.description}
          </p>

          <div className="space-y-4 text-sm font-light mb-8 pb-6 border-b border-white/10">
            <div className="flex justify-between text-gray-300">
              <span className="uppercase tracking-widest text-xs">Type</span>
              <span className="text-white">{isPrivate ? "Private VIP Experience" : "Group Event"}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span className="uppercase tracking-widest text-xs">Base Rate</span>
              <span className="text-white">EGP {pkg.price} {isPrivate ? "Total" : "/ person"}</span>
            </div>
            {!isPrivate && (
              <div className="flex justify-between text-gray-300">
                <span className="uppercase tracking-widest text-xs">Tickets</span>
                <span className="text-white">x {tickets}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-300">
              <span className="uppercase tracking-widest text-xs">Duration</span>
              <span className="text-white">{pkg.duration} Hours</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Due Today</p>
              <p className="text-[#D4AF37] text-3xl font-light tracking-wide">EGP {finalPrice}</p>
            </div>
          </div>

          <Button 
            onClick={handleCheckout} 
            disabled={isProcessing}
            className="w-full bg-[#D4AF37] hover:bg-white text-black transition-colors duration-500 py-6 uppercase tracking-[0.2em] font-medium rounded-none"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</>
            ) : (
              "Confirm & Pay"
            )}
          </Button>

          <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
            🔒 Secure payment by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
