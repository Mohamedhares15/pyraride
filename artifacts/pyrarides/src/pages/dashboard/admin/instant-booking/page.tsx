"use client";

import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import { useEffect } from "react";
import InstantBookingForm from "@/components/admin/InstantBookingForm";
import { ArrowLeft } from "lucide-react";
import { Link } from 'wouter';

export default function InstantBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b hairline bg-surface sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/admin/horses">
            <button className="flex items-center gap-2 text-[11px] uppercase tracking-luxury text-ink-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
          <div className="h-5 w-px bg-foreground/10" />
          <p className="text-sm font-medium">Admin: Register Walk-in Booking</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Admin Tool</p>
            <h2 className="font-display text-3xl font-light mb-3">Instant Booking Registration</h2>
            <p className="text-ink-soft text-sm">
              Register a ride that happened without an online booking.
              This allows the rider to leave a review and adds the ride to their profile.
            </p>
          </div>

          <InstantBookingForm />

          <div className="mt-8 border hairline bg-surface p-5">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">When to use this</p>
            <ul className="text-sm text-ink-soft space-y-1.5 list-disc list-inside">
              <li>Walk-in customer who paid at the stable</li>
              <li>Ride booked via phone or WhatsApp</li>
              <li>Friend who rode without booking online</li>
              <li>Any ride that should be in the system but wasn&apos;t booked online</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
