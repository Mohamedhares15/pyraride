"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/shims/next-auth-react";
import { MapPin, Clock, CheckCircle2 } from "lucide-react";

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
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full bg-background text-foreground">
      <div className="px-5 pt-8 pb-5 border-b hairline">
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-1">Driver Portal</p>
        <h1 className="font-display text-2xl font-light">Ride History</h1>
        <p className="text-sm text-ink-muted mt-1">
          {orders.length === 0 ? "No completed rides yet" : `${orders.length} completed ride${orders.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex-1 px-4 py-5">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center border hairline bg-surface mx-auto mb-5">
              <Clock className="w-7 h-7 text-foreground opacity-20" />
            </div>
            <p className="text-sm font-medium text-ink-soft">Nothing here yet</p>
            <p className="text-xs text-ink-muted mt-1 max-w-[240px]">Your completed ride history will show up here.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-foreground/8">
            {orders.map((order) => {
              const orderDate = new Date(order.date);
              const formattedDate = orderDate.toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric",
              });

              return (
                <div key={order.id} className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center border hairline bg-surface shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.rider?.fullName || "Guest"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-ink-muted shrink-0" />
                      <p className="text-xs text-ink-muted truncate">{order.transportationZone || "Direct pickup"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink-muted">{formattedDate}</p>
                    <p className="text-xs text-emerald-600 mt-0.5 font-medium">Completed</p>
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
