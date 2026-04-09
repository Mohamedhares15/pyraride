"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { MapPin, Navigation, UserCircle2, Clock, CarFront, Loader2 } from "lucide-react";

export default function DriverRadarPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchOrders = async () => {
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
  };

  // Poll for new rides every 15 seconds like an Uber app
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const claimOrder = async (id: string) => {
    if (claimingId) return;
    setClaimingId(id);
    
    try {
      const res = await fetch(`/api/driver/orders/${id}/accept`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Ride Successfully Claimed! Navigating to Active View.");
        // We'll drop them to active later
        window.location.href = "/dashboard/driver/active";
      } else {
        toast.error(data.error || "Failed to claim ride. Another driver may have beat you to it.");
        fetchOrders(); // Refresh to remove claimed order
      }
    } catch (e) {
      toast.error("Network error while trying to claim the ride.");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(218,165,32)]/10 shadow-[0_0_50px_rgba(218,165,32,0.2)]">
          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(218,165,32)]/20"></div>
          <Navigation className="h-10 w-10 text-[rgb(218,165,32)]" />
        </div>
        <h2 className="font-display text-xl font-bold">Connecting to Satellite...</h2>
        <p className="mt-2 text-sm text-white/50">Establishing connection to the PyraRides Dispatch Network.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 w-full h-full relative">
      
      {/* Decorative Top Map Gradient mask */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="text-center pt-2 pb-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white shadow-black drop-shadow-md">
            Scanning for Pickups
          </h2>
          <div className="mx-auto mt-2 flex items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 w-max">
             <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
             </span>
             <span className="text-[10px] font-medium uppercase tracking-widest text-green-400">
               {orders.length} Rides Found
             </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <CarFront className="h-16 w-16 mb-4 text-white/20" />
            <p className="text-lg font-medium text-white/70">No incoming rides available</p>
            <p className="text-sm mt-1">Keep the app open to receive instant dispatches.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const orderDate = new Date(order.date);
              const formattedDate = orderDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              
              return (
                <div key={order.id} className="relative overflow-hidden rounded-2xl border border-[rgb(218,165,32)]/30 bg-[#1A1A1A] text-left shadow-xl transition-all active:scale-[0.98]">
                  {/* Map / Hero Section of Card */}
                  <div className="h-24 w-full bg-[#121212] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                     <Image src={order.package.imageUrl || '/hero-bg.webp'} alt="Target" fill className="object-cover opacity-30 grayscale blur-[2px]" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
                     <div className="absolute bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[rgb(218,165,32)]" />
                        <span className="text-xs font-semibold">{order.transportationZone}</span>
                     </div>
                  </div>

                  {/* Body details */}
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                         {order.rider.profileImageUrl ? (
                           <Image src={order.rider.profileImageUrl} alt="Rider" width={40} height={40} className="rounded-full object-cover border border-white/20" />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                             <UserCircle2 className="w-6 h-6 text-white/50" />
                           </div>
                         )}
                         <div>
                           <p className="font-semibold text-white text-sm leading-tight">{order.rider.fullName || "Valued Guest"}</p>
                           <p className="text-[10px] text-white/50 uppercase tracking-widest">{order.ticketsCount} passenger(s)</p>
                         </div>
                       </div>
                       
                       <div className="text-right">
                         <div className="bg-[rgb(218,165,32)]/10 text-[rgb(218,165,32)] px-2 py-1 rounded text-xs font-bold whitespace-nowrap mb-1">
                           {formattedDate}
                         </div>
                         <div className="flex items-center justify-end gap-1 text-white/70 text-xs">
                           <Clock className="w-3 h-3" /> {order.startTime}
                         </div>
                       </div>
                    </div>

                    <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">Destination Base</p>
                      <p className="text-sm font-medium">{order.package.stable?.name || order.package.title}</p>
                      <p className="text-xs text-white/50 truncate mt-0.5">{order.package.stable?.address || "Pyramids Target Area"}</p>
                    </div>

                    <button 
                      onClick={() => claimOrder(order.id)}
                      disabled={claimingId !== null}
                      className="w-full h-14 rounded-xl bg-[rgb(218,165,32)] hover:bg-[rgb(218,165,32)]/90 text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center shadow-[0_0_20px_rgba(218,165,32,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {claimingId === order.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Locking System...
                        </>
                      ) : (
                        "Tap to Accept Ride"
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
