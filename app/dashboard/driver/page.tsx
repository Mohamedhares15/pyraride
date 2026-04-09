"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { MapPin, UserCircle2, Clock, Loader2, ChevronRight } from "lucide-react";

export default function DriverRadarPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

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

  const claimOrder = async (id: string) => {
    if (claimingId) return;
    setClaimingId(id);

    try {
      const res = await fetch(`/api/driver/orders/${id}/accept`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        toast.success("Ride accepted! Redirecting to active routes...");
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

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-[#D4AF37]/5 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center animate-pulse">
              <svg className="w-7 h-7 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20 animate-ping" />
        </div>
        <p className="text-sm font-medium text-white/50">Scanning network...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full">
      {/* Header Section */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[22px] font-bold tracking-tight">Available Rides</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[13px] text-white/50">
            {orders.length === 0 ? "No rides available" : `${orders.length} ride${orders.length > 1 ? 's' : ''} nearby`}
          </span>
        </div>
      </div>

      {/* Ride Cards */}
      <div className="flex-1 px-4 pb-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-white/60">No pickups available</p>
            <p className="text-[13px] text-white/30 mt-1 max-w-[240px]">New transport requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const orderDate = new Date(order.date);
              const formattedDate = orderDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-[#141414] border border-white/[0.06] overflow-hidden transition-all active:scale-[0.98]"
                >
                  {/* Route Preview Bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                      <div className="w-px h-5 bg-white/10" />
                      <div className="h-2.5 w-2.5 rounded-full border-2 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <p className="text-[13px] font-medium truncate">{order.transportationZone}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                        <p className="text-[13px] text-white/50 truncate">{order.package.stable?.name || order.package.title}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md">{formattedDate}</p>
                      <div className="flex items-center gap-1 mt-1.5 justify-end">
                        <Clock className="w-3 h-3 text-white/30" />
                        <span className="text-[11px] text-white/40">{order.startTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger + Action */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      {order.rider.profileImageUrl ? (
                        <Image src={order.rider.profileImageUrl} alt="" width={40} height={40} className="rounded-full object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                          <UserCircle2 className="w-5 h-5 text-white/30" />
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-semibold">{order.rider.fullName || "Guest"}</p>
                        <p className="text-[11px] text-white/40">{order.ticketsCount} passenger{order.ticketsCount > 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => claimOrder(order.id)}
                      disabled={claimingId !== null}
                      className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C9A431] text-black font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {claimingId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Accept
                          <ChevronRight className="w-4 h-4" />
                        </>
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
