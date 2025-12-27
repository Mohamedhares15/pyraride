"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-white/60 font-light tracking-widest uppercase text-sm">Finalizing Booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.webp"
          alt="Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "outCirc" }}
        >
          {/* Glass Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 text-center shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30"
            >
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>

            <h1 className="mb-4 font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
              Booking Confirmed!
            </h1>

            <p className="mb-8 text-lg text-white/70 font-light leading-relaxed max-w-md mx-auto">
              Your adventure awaits. We've sent a confirmation email with all the details to your inbox.
            </p>

            {bookingId && (
              <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Booking ID</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">{bookingId}</span>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="h-14 rounded-full bg-white text-black hover:bg-white/90 px-8 text-base font-bold tracking-wide shadow-lg shadow-white/10 transition-all hover:scale-105">
                <Link href="/dashboard/rider">
                  View My Bookings
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 px-8 text-base font-semibold tracking-wide backdrop-blur-sm transition-all hover:scale-105">
                <Link href="/stables">Browse More Stables</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
