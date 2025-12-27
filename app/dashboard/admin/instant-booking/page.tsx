"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InstantBookingForm from "@/components/admin/InstantBookingForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InstantBookingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "admin") {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session || session.user.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/dashboard/admin/horses">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <h1 className="text-xl font-semibold text-white">Admin: Register Walk-in Booking</h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Instant Booking Registration
                        </h2>
                        <p className="text-white/60">
                            Register a ride that happened without an online booking.
                            This allows the rider to leave a review and adds the ride to their profile.
                        </p>
                    </div>

                    <InstantBookingForm />

                    <div className="mt-8 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                        <h3 className="text-amber-400 font-medium mb-2">💡 When to use this:</h3>
                        <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                            <li>Walk-in customer who paid at the stable</li>
                            <li>Ride booked via phone/WhatsApp</li>
                            <li>Friend who rode without booking online</li>
                            <li>Any ride that should be in the system but wasn&apos;t booked online</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
