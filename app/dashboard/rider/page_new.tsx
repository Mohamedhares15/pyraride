"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  MoreHorizontal, 
  X, 
  MessageSquare,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

// Mock data for development/preview
const MOCK_BOOKINGS = [
  {
    id: "1",
    stableName: "Kheyool El Shewkhy",
    horseName: "Storm",
    date: "2025-01-15",
    time: "08:00",
    duration: 60,
    status: "confirmed",
    price: 700,
    image: "/horses/storm.jpg"
  },
  {
    id: "2",
    stableName: "Al Sorat Farm",
    horseName: "Thunder",
    date: "2025-01-20",
    time: "16:00",
    duration: 90,
    status: "pending",
    price: 1200,
    image: "/horses/thunder.jpg"
  }
];

export default function RiderDashboardNew() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming"); // upcoming, past, cancelled

  useEffect(() => {
    // In a real implementation, fetch from API
    // For now, simulate loading
    const timer = setTimeout(() => {
      setBookings(MOCK_BOOKINGS);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "pending": return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/20";
      default: return "bg-neutral-500/20 text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white/20">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white md:text-5xl">
              My <span className="font-serif italic text-white/80">Journeys</span>
            </h1>
            <p className="mt-2 text-lg text-neutral-400">
              Manage your upcoming rides and history
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Search className="mr-2 h-4 w-4" />
              Find Stable
            </Button>
            <Button 
              className="bg-white text-black hover:bg-neutral-200"
            >
              Book New Ride
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          {["upcoming", "pending", "past", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                filter === f
                  ? "bg-white text-black"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[280px] animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-1 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Image Section */}
                  <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl md:h-auto md:w-64">
                    <div className="absolute inset-0 bg-neutral-800" /> {/* Placeholder for image */}
                    {/* In real app: <Image src={booking.image} ... /> */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      🐴
                    </div>
                    <div className="absolute left-3 top-3">
                      <Badge className={`backdrop-blur-md ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex flex-1 flex-col justify-between p-2 md:py-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-serif text-2xl text-white">
                          {booking.horseName}
                        </h3>
                        <span className="text-lg font-medium text-white">
                          EGP {booking.price}
                        </span>
                      </div>
                      <p className="text-neutral-400">{booking.stableName}</p>

                      <div className="mt-6 flex flex-wrap gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider">Date</p>
                            <p className="text-sm font-medium text-white">Jan 15, 2025</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider">Time</p>
                            <p className="text-sm font-medium text-white">08:00 AM</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider">Location</p>
                            <p className="text-sm font-medium text-white">Giza Plateau</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/5 pt-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-neutral-400 hover:text-white hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/10 bg-transparent text-white hover:bg-white/5"
                      >
                        Reschedule
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-white text-black hover:bg-neutral-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Calendar className="h-10 w-10 text-white/40" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-white">No bookings found</h3>
            <p className="mb-8 max-w-sm text-neutral-400">
              You haven't made any bookings in this category yet. Start your journey today.
            </p>
            <Button className="bg-white text-black hover:bg-neutral-200">
              Explore Stables
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
