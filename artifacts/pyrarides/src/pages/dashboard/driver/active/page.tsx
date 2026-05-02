"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/shims/next-auth-react";
import NextImage from "@/shims/next-image";
import { toast } from "sonner";
import { MapPin, Phone, Loader2, Navigation, ExternalLink } from "lucide-react";
import { useRouter } from '@/shims/next-navigation';

export default function DriverActivePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchActive = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/orders/active");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 20000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  const completeOrder = async (id: string) => {
    if (completingId) return;
    setCompletingId(id);

    try {
      const res = await fetch(`/api/driver/orders/${id}/complete`, { method: "POST" });

      if (res.ok) {
        toast.success("Drop-off confirmed! Ride completed.");
        fetchActive();
      } else {
        toast.error("Could not complete the ride.");
      }
    } catch (e) {
      toast.error("Network error.");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[22px] font-bold tracking-tight">Active Routes</h1>
        <p className="text-[13px] text-white/40 mt-1">
          {orders.length === 0 ? "No active pickups" : `${orders.length} in progress`}
        </p>
      </div>

      <div className="flex-1 px-4 pb-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-white/60">No active routes</p>
            <p className="text-[13px] text-white/30 mt-1 max-w-[240px]">Accept a ride from the Radar to start navigating.</p>
            <button
              onClick={() => router.push("/dashboard/driver")}
              className="mt-5 text-[13px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-5 py-2 rounded-xl border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-colors"
            >
              Open Radar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const mapsUrl = order.pickupLocationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.transportationZone)}`;

              return (
                <div key={order.id} className="rounded-2xl bg-[#141414] border border-white/[0.06] overflow-hidden">
                  {/* Status Strip */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                    </span>
                    <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">En Route to Pickup</span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Passenger Card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      {order.rider.profileImageUrl ? (
<NextImage src={order.rider.profileImageUrl} alt="" width={44} height={44} className="rounded-full object-cover ring-1 ring-white/10 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                          <span className="text-base font-bold text-white/40">{order.rider.fullName?.[0] || "G"}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold truncate">{order.rider.fullName || "Guest"}</p>
                        <p className="text-[11px] text-white/40">{order.ticketsCount} passenger{order.ticketsCount > 1 ? "s" : ""}</p>
                      </div>
                      {order.rider.phoneNumber && (
                        <a
                          href={`tel:${order.rider.phoneNumber}`}
                          className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 active:scale-90 transition-transform"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Route Info */}
                    <div className="flex items-center gap-3 px-1">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div className="w-px h-4 bg-white/10" />
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-[#D4AF37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{order.transportationZone}</p>
                        <p className="text-[12px] text-white/30 mt-2 truncate">{order.package.stable?.name || "PyraRides Range"}</p>
                      </div>
                    </div>

                    {/* Navigate Button */}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] transition-colors active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Navigation className="w-4.5 h-4.5" />
                        <span>Navigate to Pickup</span>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-60" />
                    </a>

                    {/* Complete Button */}
                    <button
                      onClick={() => completeOrder(order.id)}
                      disabled={completingId !== null}
                      className="w-full p-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.06] active:scale-[0.98]"
                    >
                      {completingId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        "Complete Drop-off"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
