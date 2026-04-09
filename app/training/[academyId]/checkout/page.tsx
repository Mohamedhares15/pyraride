"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { Calendar, CreditCard, Banknote, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function AcademyCheckoutPage({ params }: { params: { academyId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams?.get("programId");

  const [program, setProgram] = useState<any>(null);
  const [academy, setAcademy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState<string>("");
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

    // Set default start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split("T")[0]);

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
        alert(err.message);
        router.push(`/training/${params.academyId}`);
      })
      .finally(() => setLoading(false));
  }, [params.academyId, programId, session, status, router]);

  const handleCheckout = async () => {
    if (!startDate) return alert("Please select a valid start date");
    setEnrolling(true);

    try {
      const res = await fetch("/api/training/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          startDate,
          paymentMethod,
          paymentStructure,
        }),
      });

      if (res.ok) {
        // Redirect to success / dashboard with training tab
        router.push("/dashboard/rider?tab=training&enrollment=success");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to process enrollment");
        setEnrolling(false);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during checkout");
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!program || !academy) return null;

  const totalPrice = Number(program.price);
  const amountToPay = paymentStructure === "PARTIAL" ? totalPrice * 0.15 : totalPrice;
  const balanceDue = totalPrice - amountToPay;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#D4AF37]/30 font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        <Link 
          href={`/training/${params.academyId}`}
          className="inline-flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors mb-12 text-sm uppercase tracking-widest gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Academy
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-light mb-4">Complete Enrollment</h1>
          <p className="text-gray-400">Secure your spot in the <span className="text-white">{program.name}</span> program.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Step 1: Schedule Configuration */}
            <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
              <h2 className="text-xl font-display text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm">1</span>
                Schedule Start Date
              </h2>

              <p className="text-sm text-gray-400 mb-6">
                Choose when you want to begin your training. The system will automatically construct the rest of your session dates based on the program's defined schedule ({program.availableDays.join(", ")}).
              </p>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Expected Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Payment Plan */}
            <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
              <h2 className="text-xl font-display text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm">2</span>
                Payment Structure
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentStructure("FULL")}
                  className={`relative p-6 rounded-2xl border text-left transition-all ${
                    paymentStructure === "FULL"
                      ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-white">Full Upfront Payment</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentStructure === "FULL" ? "border-[#D4AF37]" : "border-white/20"}`}>
                      {paymentStructure === "FULL" && <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full" />}
                    </div>
                  </div>
                  <p className="text-2xl font-light text-white mb-2">EGP {totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Settle everything now</p>
                </button>

                <button
                  onClick={() => setPaymentStructure("PARTIAL")}
                  className={`relative p-6 rounded-2xl border text-left transition-all ${
                    paymentStructure === "PARTIAL"
                      ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20"
                  }`}
                >
                  <div className="absolute -top-3 -right-3 bg-red-500/20 text-red-400 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30">
                    Trial Offer
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-white">Pay per Session (15%)</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentStructure === "PARTIAL" ? "border-[#D4AF37]" : "border-white/20"}`}>
                      {paymentStructure === "PARTIAL" && <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full" />}
                    </div>
                  </div>
                  <p className="text-2xl font-light text-white mb-2">EGP {(totalPrice * 0.15).toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]">
                    Try the first session before committing. 
                  </p>
                </button>
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
              <h2 className="text-xl font-display text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm">3</span>
                Payment Method
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("VISA")}
                  className={`p-6 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                    paymentMethod === "VISA"
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === "VISA" ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-white/5 text-gray-400"}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Credit/Debit Card</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Secure Online Checkout</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-6 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                    paymentMethod === "CASH"
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === "CASH" ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-white/5 text-gray-400"}`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Pay at Stable</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]">No upfront charge</p>
                  </div>
                </button>
              </div>
            </section>
            
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white/[0.02] border border-[#D4AF37]/20 p-8 rounded-3xl backdrop-blur-xl">
              
              <h3 className="font-display text-xl mb-8">Enrollment Summary</h3>

              {/* Academy Meta */}
              <div className="flex gap-4 items-center mb-8 pb-8 border-b border-white/5">
                <div className="w-16 h-16 rounded-xl bg-black overflow-hidden relative shrink-0 border border-white/10">
                  {academy.imageUrl && <Image src={academy.imageUrl} alt={academy.name} fill className="object-cover" />}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">{academy.location}</p>
                  <p className="font-medium leading-tight">{academy.name}</p>
                </div>
              </div>

              {/* Program Meta */}
              <div className="space-y-4 mb-8 pb-8 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-sm">Program</p>
                  <p className="font-medium text-right">{program.name}</p>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-sm">Sessions</p>
                  <p className="font-medium text-right">{program.totalSessions}</p>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="font-medium text-right">{program.sessionDuration} Hrs per session</p>
                </div>
              </div>

              {/* Invoice */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Program Cost</span>
                  <span>EGP {totalPrice.toLocaleString()}</span>
                </div>
                
                {paymentStructure === "PARTIAL" && (
                  <div className="flex justify-between items-center text-sm text-[#D4AF37]">
                    <span>Outstanding Balance (Due later)</span>
                    <span>- EGP {balanceDue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/10 mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm uppercase tracking-widest text-gray-500">Amount to Pay</span>
                  <span className="text-3xl font-light">EGP {amountToPay.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-right text-gray-500 uppercase tracking-widest">
                  {paymentMethod === "VISA" ? "Will be charged now" : "Pay at the stable counter"}
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={enrolling || !startDate}
                className="w-full bg-[#D4AF37] hover:bg-[#C49A2F] text-black py-4 rounded-xl font-semibold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "VISA" ? (
                  <>Checkout via Visa <span className="group-hover:translate-x-1 transition-transform">→</span></>
                ) : (
                  <>Confirm Enrollment <span className="group-hover:translate-x-1 transition-transform">→</span></>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Trusted & Secure Booking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
