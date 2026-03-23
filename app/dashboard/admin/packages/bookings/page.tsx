"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Calendar, MapPin, Users, Ticket, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface PackageBooking {
  id: string;
  date: string;
  startTime: string;
  ticketsCount: number;
  totalPrice: number;
  transportationZone: string | null;
  status: string;
  stripePaymentId: string | null;
  createdAt: string;
  package: {
    title: string;
    packageType: string;
    hasTransportation: boolean;
  };
  rider: {
    fullName: string;
    email: string;
  };
}

export default function AdminPackageBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    } else {
      fetchBookings();
    }
  }, [session, status]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/packages/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch package bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin/packages"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Packages
          </Link>
          <h1 className="text-3xl font-display font-bold">Package Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage all customer orders and transportation requests for luxury packages.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No package bookings have been made yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                    {booking.status}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Order #{booking.id.split('-')[0]}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Booked on {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                {/* Package Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.package.title}</h3>
                    <p className="text-sm text-primary mb-3">
                      {booking.package.packageType === "PRIVATE" ? "Private Event" : "Group Experience"}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-foreground font-medium">
                        {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-foreground font-medium">Starts at {booking.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {booking.package.packageType === "PRIVATE" ? <Users className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                      <span className="text-foreground font-medium">
                        {booking.package.packageType === "PRIVATE" ? "Private Group" : `${booking.ticketsCount} Tickets`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Customer Details</h3>
                  <div className="space-y-1">
                    <p className="font-medium text-base">{booking.rider.fullName}</p>
                    <p className="text-sm text-muted-foreground">{booking.rider.email}</p>
                  </div>

                  {booking.package.hasTransportation && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2">Requested Transportation</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm font-medium leading-snug">
                          {booking.transportationZone || "Meet at Stable (No Pickup Arranged)"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financials */}
                <div className="p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2">Payment Details</h3>
                    <div className="text-3xl font-bold text-primary mb-2">
                      EGP {Number(booking.totalPrice).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      {booking.stripePaymentId ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-3 w-3" /> Paid via Stripe
                        </span>
                      ) : (
                        <span>Pending Payment</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
