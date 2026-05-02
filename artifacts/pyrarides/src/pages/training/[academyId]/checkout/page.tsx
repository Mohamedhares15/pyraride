"use client";

import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useSession } from "@/shims/next-auth-react";
import { useRouter, useSearchParams } from '@/shims/next-navigation';
import NextImage from "@/shims/next-image";
import { Link } from 'wouter';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, CreditCard, Banknote, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, Ticket, Users, AlertTriangle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export default function AcademyCheckoutPage() {
  const rawParams = useParams<{ academyId: string }>();
  const params = { academyId: rawParams?.academyId ?? "" };
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams?.get("programId");

  const [program, setProgram] = useState<any>(null);
  const [academy, setAcademy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [date, setDate] = useState<string>("");
  const [paymentStructure, setPaymentStructure] = useState<"FULL" | "PARTIAL">("FULL");
  const [paymentMethod, setPaymentMethod] = useState<"VISA" | "CASH">("VISA");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/signin");
      return;
    }
    if (!programId) {
      router.push(`/training/${params.academyId}`);
      return;
    }

    // Set default start date to tomorrow if none is set
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);

    // Fetch Program Data
    fetch(`/api/academies/${params.academyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) throw new Error("Academy not found");
        setAcademy(data);
        const p = data.programs.find((p: any) => p.id === programId);
        if (!p) throw new Error("Program not found");
        setProgram(p);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
        router.push(`/training/${params.academyId}`);
      })
      .finally(() => setLoading(false));
  }, [params.academyId, programId, session, status, router]);

  const handleCheckout = async () => {
    if (!date) {
      setError("Please select a date for your first session.");
      return;
    }
    setEnrolling(true);
    setError("");

    try {
      const res = await fetch("/api/training/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          startDate: date,
          paymentMethod,
          paymentStructure,
        }),
      });

      if (res.ok) {
        toast.success("Enrollment confirmed! Redirecting...");
        router.push("/dashboard/rider?tab=training&enrollment=success");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to process enrollment");
        toast.error(data.error || "Failed to process enrollment");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during checkout.");
      toast.error(err.message || "An error occurred during checkout.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  if (!program || !academy) return null;

  const totalPrice = Number(program.price);
  const amountToPay = paymentStructure === "PARTIAL" ? totalPrice * 0.15 : totalPrice;
  const balanceDue = totalPrice - amountToPay;

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Earliest logic standard
    return today.toISOString().split("T")[0];
  };
  const minDate = getMinDate();

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
              href={`/training/${params.academyId}`}
              className="mb-2 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white mt-12 md:mt-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Academy</span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-lg md:text-3xl">
              Complete Your Enrollment
            </h1>
          </div>

          <div className="flex-1 grid gap-6 md:grid-cols-12 md:gap-8">
            {/* Left Column: Form Controls */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 pb-8 md:pb-0">
              
              {/* Selected Program Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Selected Program</h2>
                
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-white/20">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="w-full md:w-1/3">
                      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20">
                        <div className="relative h-32 w-full">
<NextImage
                            src={academy.imageUrl || "/hero-bg.webp"}
                            alt={academy.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm font-bold text-white uppercase tracking-widest">{program.skillLevel}</p>
                            <p className="text-xs text-[rgb(218,165,32)]">EGP {totalPrice}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{program.name}</h3>
                          <p className="mt-1 text-sm text-white/70 line-clamp-1">
                            {academy.name} • {academy.location}
                          </p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-[rgb(218,165,32)] flex-shrink-0 ml-4 hidden sm:block" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{program.totalSessions} Sessions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{program.sessionDuration} Hrs/Session</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Date & Payment Flow */}
              <div className="space-y-4 mt-4">
                <h2 className="text-xl font-bold text-white">Date & Payment Configurations</h2>
                
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md space-y-8">
                  
                  {/* Step 1: Start Date */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 text-white">
                      <span className="w-6 h-6 rounded-full bg-[rgb(218,165,32)]/20 text-[rgb(218,165,32)] text-xs flex items-center justify-center font-bold">1</span>
                      <Label className="text-white text-sm font-semibold">Schedule First Session Start Date *</Label>
                    </div>
                    {date && (
                      <span className="mb-2 block text-xs font-normal text-white/50">
                        Selected: ({new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})
                      </span>
                    )}

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
                            const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            const minD = new Date(minDate.split("-").map(Number)[0], minDate.split("-").map(Number)[1] - 1, minDate.split("-").map(Number)[2]);
                            
                            if (checkDate < minD) return true;
                            
                            if (program.availableDays && program.availableDays.length > 0 && program.availableDays[0] !== "Everyday") {
                              const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" });
                              const isAvailable = program.availableDays.some(
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
                    {program.availableDays && program.availableDays.length > 0 && program.availableDays[0] !== "Everyday" && (
                      <p className="text-xs text-[rgb(218,165,32)]/80 mt-1">
                        Program runs heavily on: {program.availableDays.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Step 2: Payment Plan */}
                  <div className="space-y-3 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-4 text-white">
                      <span className="w-6 h-6 rounded-full bg-[rgb(218,165,32)]/20 text-[rgb(218,165,32)] text-xs flex items-center justify-center font-bold">2</span>
                      <Label className="text-white text-sm font-semibold">Payment Structure</Label>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentStructure("FULL")}
                        className={`relative p-4 rounded-xl border text-left transition-all ${
                          paymentStructure === "FULL"
                            ? "border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.05)] shadow-[0_0_20px_rgba(218,165,32,0.15)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-white">Full Program Payment</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentStructure === "FULL" ? "border-[rgb(218,165,32)]" : "border-white/30"}`}>
                            {paymentStructure === "FULL" && <div className="w-2 h-2 bg-[rgb(218,165,32)] rounded-full" />}
                          </div>
                        </div>
                        <p className="text-xl font-bold text-white mb-1">EGP {totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-white/50">Commit to {program.totalSessions} Sessions</p>
                      </button>

                      <button
                        onClick={() => setPaymentStructure("PARTIAL")}
                        className={`relative p-4 rounded-xl border text-left transition-all ${
                          paymentStructure === "PARTIAL"
                            ? "border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.05)] shadow-[0_0_20px_rgba(218,165,32,0.15)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="absolute -top-3 -right-3 bg-red-500/20 text-red-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border border-red-500/30 shadow-lg">
                          Trial Available
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-white">Partial (15% Only)</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentStructure === "PARTIAL" ? "border-[rgb(218,165,32)]" : "border-white/30"}`}>
                            {paymentStructure === "PARTIAL" && <div className="w-2 h-2 bg-[rgb(218,165,32)] rounded-full" />}
                          </div>
                        </div>
                        <p className="text-xl font-bold text-[rgb(218,165,32)] mb-1">EGP {(totalPrice * 0.15).toLocaleString()}</p>
                        <p className="text-xs text-white/50">Try 1 Session before committing fully</p>
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Payment Method */}
                  <div className="space-y-3 pt-6 border-t border-white/10">
                     <div className="flex items-center gap-2 mb-4 text-white">
                      <span className="w-6 h-6 rounded-full bg-[rgb(218,165,32)]/20 text-[rgb(218,165,32)] text-xs flex items-center justify-center font-bold">3</span>
                      <Label className="text-white text-sm font-semibold">Payment Medium</Label>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod("VISA")}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          paymentMethod === "VISA"
                            ? "border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.05)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "VISA" ? "bg-[rgb(218,165,32)]/20 text-[rgb(218,165,32)]" : "bg-white/10 text-white/50"}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm shrink-0 whitespace-nowrap overflow-hidden text-clip">Credit / Debit</p>
                          <p className="text-[10px] text-white/50 shrink-0 whitespace-nowrap overflow-hidden text-clip">Secure Online Flow</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("CASH")}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          paymentMethod === "CASH"
                            ? "border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.05)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "CASH" ? "bg-[rgb(218,165,32)]/20 text-[rgb(218,165,32)]" : "bg-white/10 text-white/50"}`}>
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm shrink-0 whitespace-nowrap overflow-hidden text-clip">Pay at Stable</p>
                          <p className="text-[10px] text-white/50 shrink-0 whitespace-nowrap overflow-hidden text-clip">Physical Currency</p>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Summary */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col pb-8 md:pb-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-xl flex flex-col sticky top-24">
                <h2 className="mb-6 text-lg md:text-xl font-bold text-white flex-shrink-0">Order Summary</h2>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Academy Info */}
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
<NextImage src={academy.imageUrl} alt={academy.name} width={40} height={40} className="rounded-md object-cover w-10 h-10 shrink-0" />
                     <div className="flex-1 min-w-0">
                       <p className="text-white font-semibold text-sm truncate">{academy.name}</p>
                       <p className="text-[10px] text-white/50 uppercase tracking-widest truncate">{academy.location}</p>
                     </div>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-3 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Program Base Price:</span>
                      <span className="text-white">EGP {totalPrice.toLocaleString()}</span>
                    </div>
                    {paymentStructure === "PARTIAL" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Partial Target (15%):</span>
                        <span className="text-[rgb(218,165,32)]">Pay EGP {(totalPrice * 0.15).toLocaleString()}</span>
                      </div>
                    )}
                    {paymentStructure === "PARTIAL" && (
                       <div className="flex justify-between text-sm">
                        <span className="text-white/70 flex items-center gap-1">Remaining Balance:</span>
                        <span className="text-gray-400 opacity-80">(EGP {balanceDue.toLocaleString()})</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Info Security */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <Label className="text-white text-sm">Payment Process</Label>
                    <div className="rounded-lg border border-[rgb(218,165,32)] bg-[rgba(218,165,32,0.1)] p-3 flex items-start gap-2">
                       {paymentMethod === "VISA" ? (
                          <CheckCircle2 className="h-5 w-5 text-[rgb(218,165,32)] flex-shrink-0 mt-0.5" />
                       ) : (
                          <AlertTriangle className="h-5 w-5 text-[rgb(218,165,32)] flex-shrink-0 mt-0.5" />
                       )}
                      <p className="text-xs text-white/90">
                        {paymentMethod === "VISA" 
                           ? "Payment will be processed securely. Your enrollment is recorded instantly." 
                           : "Your spot is reserved. Please remember to pay physically upon arriving at the academy."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section of Card */}
                <div className="mt-6 space-y-4 border-t border-white/10 pt-4 flex-shrink-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Subtotal:</span>
                    <span className="text-white line-through opacity-70 text-xs">EGP {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-white">Amount Due Now:</span>
                    <span className="text-2xl font-bold text-[rgb(218,165,32)] flex flex-col items-end">
                      EGP {amountToPay.toLocaleString()}
                      <span className="text-[9px] uppercase tracking-widest text-white/50 mt-1 font-normal">
                        {paymentMethod === "VISA" ? "Digital Checkout" : "Pay Later in Cash"}
                      </span>
                    </span>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm flex items-start gap-2">
                       <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                       <span className="text-red-400 flex-1">{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    disabled={enrolling || !date}
                    className="w-full h-12 bg-[rgb(218,165,32)] hover:bg-[rgb(218,165,32)]/90 text-black font-semibold text-sm uppercase tracking-widest"
                  >
                    {enrolling ? "Enrolling..." : (paymentMethod === "VISA" ? "Pay Securely" : "Confirm Enrollment")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators Footer */}
          <div className="mt-12 md:mt-auto pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center opacity-80 pb-8">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <ShieldCheck className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Verified Captains</p>
              <p className="text-xs text-white/50">Professionally licensed academies</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <Ticket className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Instant Sync</p>
              <p className="text-xs text-white/50">Schedules populate automatically</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hidden md:block">
              <Users className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">1-on-1 Sessions</p>
              <p className="text-xs text-white/50">Personalized equitation training</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hidden md:block">
              <CalendarIcon className="h-6 w-6 text-[#D4AF37] mx-auto" />
              <p className="text-sm font-semibold text-white">Strict Routines</p>
              <p className="text-xs text-white/50">Built-in commitment checks</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
