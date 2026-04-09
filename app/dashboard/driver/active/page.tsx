"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { MapPin, Phone, CarFront, Loader2, Navigation, Anchor } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DriverActivePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchActive = async () => {
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
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const completeOrder = async (id: string) => {
    if (completingId) return;
    setCompletingId(id);
    
    try {
      const res = await fetch(`/api/driver/orders/${id}/complete`, {
        method: "POST"
      });
      
      if (res.ok) {
        toast.success("Ride Successfully Completed!");
        fetchActive(); // Will drop off the list
      } else {
        toast.error("Failed to complete ride logic.");
      }
    } catch (e) {
      toast.error("Network error while trying to complete.");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
     return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(218,165,32)]" />
      </div>
     )
  }

  return (
    <div className="flex flex-col p-4 w-full h-full relative">
      <div className="relative z-10 flex flex-col gap-6 pt-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white mb-2 ml-1">
          Active Missions
        </h2>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 bg-white/5 rounded-2xl border border-white/5 mt-10">
            <Anchor className="h-12 w-12 mb-4 text-white/20" />
            <p className="text-lg font-medium text-white/70">No active routines.</p>
            <p className="text-sm mt-1">Jump to the Radar to accept your next passenger.</p>
            <button onClick={() => router.push("/dashboard/driver")} className="mt-6 px-6 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-colors">
               Open Radar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const mapsUrl = order.pickupLocationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.transportationZone)}`;
              
              return (
                <div key={order.id} className="overflow-hidden rounded-2xl border border-blue-500/30 bg-blue-900/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] flex flex-col">
                  
                  {/* Driver Route UI */}
                  <div className="p-5 flex flex-col">
                     <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                        <div>
                          <p className="font-bold text-lg text-white mb-1">Pickup Route</p>
                          <div className="flex items-center gap-2 text-sm text-blue-400">
                             <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                             </span>
                             In Progress
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                           <CarFront className="w-6 h-6 text-white" />
                        </div>
                     </div>

                     {/* Passenger Box */}
                     <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden mb-6">
                        <div className="w-1 bg-[#D4AF37] h-full absolute left-0 top-0" />
                        {order.rider.profileImageUrl ? (
                          <Image src={order.rider.profileImageUrl} alt="Rider" width={48} height={48} className="rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-lg font-bold">{order.rider.fullName?.[0] || "R"}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-white truncate">{order.rider.fullName || "Guest Account"}</p>
                           <p className="text-xs text-white/50">{order.ticketsCount} Passenger(s)</p>
                        </div>
                        {order.rider.phoneNumber && (
                          <a href={`tel:${order.rider.phoneNumber}`} className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-500/30 active:scale-95 transition-transform">
                             <Phone className="w-4 h-4" />
                          </a>
                        )}
                     </div>

                     {/* Nav Actions */}
                     <div className="flex flex-col gap-3">
                       <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Directions</p>
                       <a 
                         href={mapsUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="w-full flex items-center justify-between p-4 bg-blue-500 hover:bg-blue-600 transition-colors rounded-xl text-white font-bold"
                       >
                          <div className="flex items-center gap-3">
                             <Navigation className="w-5 h-5" />
                             <span>Navigate to Passenger</span>
                          </div>
                          <span className="text-xs opacity-80">(Google Maps)</span>
                       </a>
                       
                       <div className="bg-white/5 p-4 rounded-xl flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-white/50 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Destination Delivery</p>
                            <p className="text-xs text-white/50 truncate mt-0.5">{order.package.stable?.name || "PyraRides Range"}</p>
                          </div>
                       </div>
                     </div>
                  </div>

                  {/* Complete Terminal Button */}
                  <div className="p-5 border-t border-white/5 bg-black/20">
                    <button 
                      onClick={() => completeOrder(order.id)}
                      disabled={completingId !== null}
                      className="w-full h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/10"
                    >
                      {completingId === order.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Mark Drop-off Complete"
                      )}
                    </button>
                    <p className="text-center mt-3 text-[10px] text-white/30 uppercase tracking-widest">
                       Verify all luggage and equipment before completing.
                    </p>
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
