"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { MapPin, UserCircle2, Loader2, ChevronRight, Navigation, RefreshCw } from "lucide-react";
import DriverMap from "./components/DriverMap";

export default function DriverRadarPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  
  // Geolocation & Distances
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [isLocating, setIsLocating] = useState(true);

  // 1. Fetch Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverLocation([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation blocked, using default central Cairo.", err);
          setDriverLocation([30.0444, 31.2357]);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setDriverLocation([30.0444, 31.2357]);
      setIsLocating(false);
    }
  }, []);

  // 2. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/orders/available");
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
    fetchOrders();
    const interval = setInterval(fetchOrders, 12000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleDistanceCalculated = useCallback((orderId: string, dist: number) => {
    setDistances(prev => {
      if (prev[orderId] === dist) return prev;
      return { ...prev, [orderId]: dist };
    });
  }, []);

  const claimOrder = async (id: string) => {
    if (claimingId) return;
    setClaimingId(id);

    try {
      const res = await fetch(`/api/driver/orders/${id}/accept`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        toast.success("Ride accepted! Starting navigation...");
        window.location.href = "/dashboard/driver/active";
      } else {
        toast.error(data.error || "This ride was already taken.");
        fetchOrders();
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading || isLocating) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0A0A0A]">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-[#3B82F6]/5 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-[#3B82F6]/10 flex items-center justify-center animate-pulse">
              <Navigation className="w-6 h-6 text-[#3B82F6] animate-bounce" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#3B82F6]/20 animate-ping" />
        </div>
        <p className="text-sm font-medium text-white/50">Acquiring satellites & radar...</p>
      </div>
    );
  }

  // Sort orders by closest distance first
  const sortedOrders = [...orders].sort((a, b) => {
    const distA = distances[a.id] || 999;
    const distB = distances[b.id] || 999;
    return distA - distB;
  });

  return (
    <div className="relative w-full h-full flex flex-col pt-safe">
      {/* Absolute Fullscreen Map Background */}
      <div className="absolute inset-0 z-0">
        <DriverMap 
          orders={orders} 
          driverLocation={driverLocation} 
          onDistanceCalculated={handleDistanceCalculated}
        />
      </div>

      {/* Top Floating Radar Bar */}
      <div className="relative z-10 p-5 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${orders.length > 0 ? 'bg-emerald-400' : 'bg-[#D4AF37]'}`}></span>
            <span className={`relative inline-flex h-2 w-2 rounded-full ${orders.length > 0 ? 'bg-emerald-500' : 'bg-[#D4AF37]'}`}></span>
          </span>
          <span className="text-[13px] font-semibold tracking-wide uppercase">
            {orders.length === 0 ? "Searching..." : `${orders.length} Rides Active`}
          </span>
        </div>

        <button onClick={fetchOrders} className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 p-2.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/70">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* spacer to push cards to the bottom */}
      <div className="flex-1 pointer-events-none"></div>

      {/* Bottom Floating Cards Container */}
      <div className="relative z-10 w-full pb-4 px-4 pointer-events-none flex flex-col gap-3 max-h-[60%] overflow-y-auto overscroll-contain snap-y snap-mandatory scrollbar-hide">
        {sortedOrders.length === 0 ? (
          <div className="pointer-events-auto snap-center shrink-0 w-full bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 text-center shadow-2xl">
            <div className="h-16 w-16 mx-auto rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Scanning Area</h3>
            <p className="text-[13px] text-white/50">Stay online. New ride requests will appear here instantly.</p>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const distance = distances[order.id];
            
            return (
              <div
                key={order.id}
                className="pointer-events-auto snap-center shrink-0 w-full rounded-[24px] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden transition-all active:scale-[0.98]"
              >
                {/* Status Bar */}
                <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">VIP Pickup</span>
                  </div>
                  {distance !== undefined && (
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      <span className="text-[11px] font-bold text-white">{distance.toFixed(1)} km away</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-4">
                  {/* Route */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                      <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/50 to-[#D4AF37]/50 rounded-full" />
                      <div className="h-3 w-3 rounded-sm border-2 border-[#D4AF37] ring-4 ring-[#D4AF37]/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-4">
                        <p className="text-[10px] uppercase text-white/30 font-bold mb-0.5 tracking-wider">Pickup</p>
                        <p className="text-[16px] font-bold truncate leading-tight">{order.transportationZone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-white/30 font-bold mb-0.5 tracking-wider">Drop-off</p>
                        <p className="text-[15px] font-medium text-white/80 truncate leading-tight">{order.package.stable?.name || order.package.title}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Rider & Action */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {order.rider.profileImageUrl ? (
                        <Image src={order.rider.profileImageUrl} alt="" width={44} height={44} className="rounded-full object-cover ring-2 ring-white/10" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center">
                          <UserCircle2 className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                      <div>
                        <p className="text-[14px] font-bold">{order.rider.fullName || "Guest"}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
                          <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-white/70">
                            ⭐ 5.0
                          </span>
                          • {order.ticketsCount} pax
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => claimOrder(order.id)}
                      disabled={claimingId !== null}
                      className="flex h-12 shrink-0 items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-[14px] px-6 rounded-xl transition-all disabled:opacity-40 disabled:scale-100 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      {claimingId === order.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Accept
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
