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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading…</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-ink-muted text-sm">Failed to load bookings.</p>
      </div>
    );
  }

  const displayList = tab === "upcoming" ? data.upcoming : tab === "past" ? data.past : data.bookings;

  const statusBadge = (s: string) => {
    switch (s) {
      case "confirmed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const transportBadge = (s: string | null) => {
    switch (s) {
      case "completed": return "bg-emerald-50 text-emerald-700";
      case "in_transit": return "bg-blue-50 text-blue-700";
      case "assigned": return "bg-violet-50 text-violet-700";
      case "arrived": return "bg-green-50 text-green-700";
      default: return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b hairline bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-5">
            <Link href="/dashboard/analytics">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-luxury text-ink-muted hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </button>
            </Link>
          </div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Admin</p>
          <h1 className="font-display text-3xl md:text-4xl font-light">Package Bookings</h1>
          <p className="text-ink-soft text-sm mt-1">Track all booked and upcoming VIP package reservations</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { label: "Total", value: data.stats.total },
            { label: "Upcoming", value: data.stats.upcoming },
            { label: "Confirmed", value: data.stats.confirmed },
            { label: "Completed", value: data.stats.completed },
            { label: "Cancelled", value: data.stats.cancelled },
            { label: "Transport", value: data.stats.withTransport },
            { label: "Revenue (EGP)", value: Math.round(data.stats.totalRevenue).toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="border hairline bg-surface p-4">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-2">{stat.label}</p>
              <p className="font-display text-2xl font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border hairline p-1 w-max">
          {(["upcoming", "all", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-[11px] uppercase tracking-luxury transition-all capitalize ${
                tab === t ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
              }`}
            >
              {t} ({t === "upcoming" ? data.upcoming.length : t === "past" ? data.past.length : data.bookings.length})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {displayList.length === 0 ? (
          <div className="border hairline bg-surface flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center border hairline bg-surface-elevated mx-auto mb-4">
              <Package className="h-6 w-6 text-foreground opacity-20" />
            </div>
            <p className="text-ink-muted text-sm">No bookings in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((booking: any) => {
              const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric"
              });

              return (
                <div key={booking.id} className="border hairline bg-surface overflow-hidden">
                  <div className="p-5 md:p-6">
                    {/* Top Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        {booking.package.imageUrl && (
                          <NextImage
                            src={booking.package.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover border hairline shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-foreground">{booking.package.title}</h3>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {booking.package.stable?.name || "No stable"} · {booking.package.packageType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex px-2.5 py-1 text-[11px] uppercase tracking-luxury font-medium border ${statusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.transportationZone && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] uppercase tracking-luxury font-medium ${transportBadge(booking.driverStatus)}`}>
                            <Truck className="w-3 h-3" />
                            {booking.driverStatus || "pending"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-1">Date & Time</p>
                        <p className="text-foreground font-medium">{formattedDate}</p>
                        <p className="text-ink-soft text-xs">{booking.startTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-1">Tickets</p>
                        <p className="text-foreground font-medium">{booking.ticketsCount} pax</p>
                        <p className="text-foreground font-display text-base">EGP {parseFloat(booking.totalPrice).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-1">Rider</p>
                        <p className="text-foreground font-medium">{booking.rider?.fullName || "Guest"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {booking.rider?.email && (
                            <a href={`mailto:${booking.rider.email}`} className="text-ink-muted hover:text-foreground transition-colors">
                              <Mail className="w-3 h-3" />
                            </a>
                          )}
                          {booking.rider?.phoneNumber && (
                            <a href={`tel:${booking.rider.phoneNumber}`} className="text-ink-muted hover:text-foreground transition-colors">
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      {booking.transportationZone && (
                        <div>
                          <p className="text-[10px] uppercase tracking-luxury text-ink-muted mb-1">Transport</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-ink-muted shrink-0" />
                            <p className="text-foreground font-medium truncate">{booking.transportationZone}</p>
                          </div>
                          {booking.driver ? (
                            <p className="text-xs text-ink-soft mt-0.5">Driver: {booking.driver.fullName}</p>
                          ) : (
                            <p className="text-xs text-amber-600 mt-0.5">No driver assigned</p>
                          )}
                        </div>
                      )}
                    </div>
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
