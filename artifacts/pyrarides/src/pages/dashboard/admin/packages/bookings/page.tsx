"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import NextImage from "@/shims/next-image";
import { Link } from 'wouter';
import {
  Loader2, ArrowLeft, Package, Calendar, DollarSign, Users,
  MapPin, Truck, CheckCircle2, Clock, XCircle, Phone, Mail
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookingData {
  bookings: any[];
  upcoming: any[];
  past: any[];
  stats: {
    total: number;
    upcoming: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    withTransport: number;
    totalRevenue: number;
  };
}

export default function AdminPackageBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "all" | "past">("upcoming");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/admin/bookings");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 flex items-center justify-center">
        <p className="text-white/50">Failed to load bookings.</p>
      </div>
    );
  }

  const displayList = tab === "upcoming" ? data.upcoming : tab === "past" ? data.past : data.bookings;

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const transportStatusColor = (s: string | null) => {
    switch (s) {
      case "completed": return "bg-emerald-500/20 text-emerald-400";
      case "in_transit": return "bg-blue-500/20 text-blue-400";
      case "assigned": return "bg-purple-500/20 text-purple-400";
      case "arrived": return "bg-green-500/20 text-green-400";
      default: return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-8 md:py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4">
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </Button>
            </Link>
          </div>
          <h1 className="mb-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
            Package Bookings
          </h1>
          <p className="text-white/60 text-sm">Track all booked and upcoming VIP package reservations</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { label: "Total", value: data.stats.total, icon: Package, color: "text-white/80" },
            { label: "Upcoming", value: data.stats.upcoming, icon: Calendar, color: "text-blue-400" },
            { label: "Confirmed", value: data.stats.confirmed, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Completed", value: data.stats.completed, icon: CheckCircle2, color: "text-green-400" },
            { label: "Cancelled", value: data.stats.cancelled, icon: XCircle, color: "text-red-400" },
            { label: "Transport", value: data.stats.withTransport, icon: Truck, color: "text-purple-400" },
            { label: "Revenue", value: `${Math.round(data.stats.totalRevenue).toLocaleString()}`, icon: DollarSign, color: "text-[#D4AF37]" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 md:p-4 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider font-medium">{stat.label}</span>
              </div>
              <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-max">
          {(["upcoming", "all", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all capitalize ${
                tab === t
                  ? "bg-[#D4AF37] text-black"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t} ({t === "upcoming" ? data.upcoming.length : t === "past" ? data.past.length : data.bookings.length})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-white/15 mb-4" />
            <p className="text-white/50 font-medium">No bookings in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((booking: any) => {
              const bookingDate = new Date(booking.date);
              const formattedDate = bookingDate.toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric"
              });

              return (
                <Card key={booking.id} className="p-0 bg-white/5 border-white/10 overflow-hidden">
                  <div className="p-4 md:p-5">
                    {/* Top Row: Package + Status */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {booking.package.imageUrl && (
<NextImage
                            src={booking.package.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-white text-[15px]">{booking.package.title}</h3>
                          <p className="text-[11px] text-white/40">{booking.package.stable?.name || "No stable"} • {booking.package.packageType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.transportationZone && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full ${transportStatusColor(booking.driverStatus)}`}>
                            <Truck className="w-3 h-3" />
                            {booking.driverStatus || "pending"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-0.5">Date & Time</p>
                        <p className="text-white/80 font-medium">{formattedDate}</p>
                        <p className="text-white/50 text-[12px]">{booking.startTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-0.5">Tickets</p>
                        <p className="text-white/80 font-medium">{booking.ticketsCount} pax</p>
                        <p className="text-[#D4AF37] font-bold text-[14px]">EGP {parseFloat(booking.totalPrice).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-0.5">Rider</p>
                        <p className="text-white/80 font-medium">{booking.rider?.fullName || "Guest"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {booking.rider?.email && (
                            <a href={`mailto:${booking.rider.email}`} className="text-blue-400 hover:text-blue-300">
                              <Mail className="w-3 h-3" />
                            </a>
                          )}
                          {booking.rider?.phoneNumber && (
                            <a href={`tel:${booking.rider.phoneNumber}`} className="text-emerald-400 hover:text-emerald-300">
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      {booking.transportationZone && (
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-0.5">Transport</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                            <p className="text-white/80 font-medium truncate">{booking.transportationZone}</p>
                          </div>
                          {booking.driver ? (
                            <p className="text-[11px] text-purple-400 mt-0.5">Driver: {booking.driver.fullName}</p>
                          ) : (
                            <p className="text-[11px] text-yellow-400 mt-0.5">No driver assigned</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
