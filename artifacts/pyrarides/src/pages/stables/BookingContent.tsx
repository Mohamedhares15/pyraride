import { Link } from "wouter";
import { Home } from "lucide-react";
import Navbar from "@/components/shared/Navbar";

export default function BookingPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const stableId = searchParams.get("stableId");
  const horseId = searchParams.get("horseId");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <Home className="h-4 w-4" /><span className="text-sm">Home</span>
          </Link>
          {stableId && (
            <Link href={`/stables/${stableId}`} className="text-sm text-white/60 hover:text-white transition-colors">
              ← Back to Stable
            </Link>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Book Your Ride</h1>
          <p className="text-white/60 mb-8">
            {stableId ? `Booking for stable ID: ${stableId}` : "Please select a stable to begin booking."}
          </p>
          {!stableId && (
            <Link href="/stables" className="inline-block bg-[#D4AF37] text-black font-semibold px-8 py-4 rounded-full hover:bg-[#D4AF37]/90 transition-colors">
              Browse Stables
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
