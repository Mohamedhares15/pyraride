"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/shims/next-auth-react";
import { Loader2, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function DriverHistoryPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/orders/history");
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
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[22px] font-bold tracking-tight">Ride History</h1>
        <p className="text-[13px] text-white/40 mt-1">
          {orders.length === 0 ? "No completed rides yet" : `${orders.length} completed ride${orders.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex-1 px-4 pb-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <Clock className="w-9 h-9 text-white/15" />
            </div>
            <p className="text-[15px] font-medium text-white/60">Nothing here yet</p>
            <p className="text-[13px] text-white/30 mt-1 max-w-[240px]">Your completed ride history will show up here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((order) => {
              const orderDate = new Date(order.date);
              const formattedDate = orderDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#141414] border border-white/[0.06]"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{order.rider?.fullName || "Guest"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                      <p className="text-[11px] text-white/40 truncate">{order.transportationZone || "Direct pickup"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-white/50">{formattedDate}</p>
                    <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">Completed</p>
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
