"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Star,
  XCircle,
  Activity,
  Target,
  Loader2,
  ArrowLeft,
  Home,
  FileText,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SimpleLineChart from "@/components/shared/SimpleLineChart";
import Link from "next/link";

interface AnalyticsData {
  stable?: {
    name: string;
    location: string;
  };
  overview: {
    totalUsers?: number;
    totalStables?: number;
    totalBookings: number;
    totalRevenue?: number;
    completedBookings?: number;
    cancellationRate?: string;
    netEarnings?: number;
    platformCommission?: number;
    aov?: number;
    clv?: number;
    avgLeadTime?: string;
  };
  ratings?: {
    averageStableRating: number;
    averageHorseRating: number;
    totalReviews: number;
  };
  bookingsByMonth?: any[];
  revenueByMonth?: any[];
  bookingsByStatus?: any[];
  topStables?: any[];
  peakTimes?: any[];
  customerSegmentation?: {
    newRiders: number;
    returningRiders: number;
    byExperience: {
      beginners: number;
      intermediate: number;
      advanced: number;
    };
  };
  horseUtilization?: any[];
  customerFeedback?: {
    avgStableRating: number;
    avgHorseRating: number;
    totalReviews: number;
  };
  recentBookings?: {
    id: string;
    horseName: string;
    riderName: string;
    riderEmail: string;
    stableName: string;
    date: string;
    time: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }[];
  detailedUsers?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    totalBookings: number;
    bookings: {
      id: string;
      horseName: string;
      stableName: string;
      date: string;
      time: string;
      totalPrice: number;
      status: string;
    }[];
  }[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user.role !== "stable_owner" && session.user.role !== "admin")) {
      router.push("/dashboard");
      return;
    }

    fetchAnalytics();
  }, [session, status, router, days]);

  async function fetchAnalytics() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics?days=${days}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Analytics API error:", errorData);
        throw new Error(errorData.error || `Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      if (!data.analytics) {
        console.error("Invalid analytics data:", data);
        throw new Error("Invalid analytics data received");
      }

      setAnalytics(data.analytics);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      console.error("Error message:", err?.message);
      console.error("Error details:", err);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!analytics && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95">
        <div className="border-b border-white/10 bg-black/60 py-12 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
            <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-white">
              Analytics
            </h1>
          </div>
        </div>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 font-display text-xl font-bold">Failed to Load Analytics</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {session?.user.role === "stable_owner"
                ? "Unable to load your stable analytics. Please ensure you have an approved stable."
                : "Unable to load analytics data. Please try again."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={fetchAnalytics}>
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/stable">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // At this point, analytics should be loaded
  if (!analytics) {
    return null; // This should not happen due to earlier check, but satisfies TypeScript
  }

  const isAdmin = session?.user.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Link href="/dashboard/admin/stables">
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    Manage Stables
                  </Button>
                </Link>
                <Link href="/dashboard/admin/horses">
                  <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Horse Admin Tiers
                  </Button>
                </Link>
                <Link href="/dashboard/admin/horse-changes">
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    <FileText className="h-4 w-4" />
                    Horse Changes
                  </Button>
                </Link>
                <Link href="/dashboard/admin/locations">
                  <Button variant="outline" size="sm" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    <MapPin className="h-4 w-4" />
                    Manage Locations
                  </Button>
                </Link>
                <Link href="/dashboard/admin/instant-booking">
                  <Button variant="outline" size="sm" className="gap-2 border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:text-teal-300">
                    <Calendar className="h-4 w-4" />
                    Instant Booking
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-white">
                {isAdmin ? "Platform Analytics" : "Stable Analytics"}
              </h1>
              <p className="text-white/70">
                {isAdmin
                  ? "Platform-wide statistics and insights"
                  : `Performance metrics for ${analytics.stable?.name}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={days === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(7)}
              >
                7 Days
              </Button>
              <Button
                variant={days === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(30)}
              >
                30 Days
              </Button>
              <Button
                variant={days === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(90)}
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Overview Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isAdmin ? (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">
                      {analytics.overview.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Stables</p>
                    <p className="text-3xl font-bold">
                      {analytics.overview.totalStables || 0}
                    </p>
                  </div>
                  <Activity className="h-12 w-12 text-secondary" />
                </div>
              </Card>
            </>
          ) : null}

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Total Bookings" : "Bookings"}
                </p>
                <p className="text-3xl font-bold">
                  {analytics.overview.totalBookings || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.completedBookings || 0} completed
                </p>
              </div>
              <Calendar className="h-12 w-12 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Total Revenue" : "Net Earnings"}
                </p>
                <p className="text-3xl font-bold">
                  ${((isAdmin ? analytics.overview.totalRevenue : analytics.overview.netEarnings) || 0).toFixed(2)}
                </p>
                {!isAdmin && analytics.overview.platformCommission && (
                  <p className="text-xs text-muted-foreground">
                    Platform fee: ${parseFloat((analytics.overview.platformCommission || 0).toString()).toFixed(2)}
                  </p>
                )}
                {isAdmin && analytics.overview.platformCommission !== undefined && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Commission (15%): ${analytics.overview.platformCommission.toFixed(2)}
                  </p>
                )}
              </div>
              <DollarSign className="h-12 w-12 text-secondary" />
            </div>
          </Card>

          {analytics.overview.cancellationRate && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                  <p className="text-3xl font-bold">
                    {analytics.overview.cancellationRate}
                  </p>
                </div>
                <XCircle className="h-12 w-12 text-muted-foreground" />
              </div>
            </Card>
          )}
        </div>

        {/* Ratings Section (for owners) */}
        {!isAdmin && analytics.ratings && (
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Stable Rating</p>
                  <p className="text-3xl font-bold">
                    {analytics.ratings.averageStableRating.toFixed(1)}
                  </p>
                </div>
                <Star className="h-12 w-12 text-yellow-400 fill-yellow-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Horse Rating</p>
                  <p className="text-3xl font-bold">
                    {analytics.ratings.averageHorseRating.toFixed(1)}
                  </p>
                </div>
                <Star className="h-12 w-12 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-3xl font-bold">{analytics.ratings.totalReviews}</p>
                </div>
                <Users className="h-12 w-12 text-secondary" />
              </div>
            </Card>
          </div>
        )}

        {/* Advanced Metrics (Admin Only) */}
        {isAdmin && (
          <>
            {/* AOV, CLV, Lead Time */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              {analytics.overview.aov !== undefined && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Order Value</p>
                      <p className="text-3xl font-bold">
                        ${analytics.overview.aov.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Revenue per booking
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-500" />
                  </div>
                </Card>
              )}
              {analytics.overview.clv !== undefined && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Lifetime Value</p>
                      <p className="text-3xl font-bold">
                        ${analytics.overview.clv.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg revenue per user
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-purple-500" />
                  </div>
                </Card>
              )}
              {analytics.overview.avgLeadTime && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Lead Time</p>
                      <p className="text-3xl font-bold">
                        {analytics.overview.avgLeadTime} days
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Booking to ride date
                      </p>
                    </div>
                    <Calendar className="h-12 w-12 text-blue-500" />
                  </div>
                </Card>
              )}
            </div>

            {/* Customer Segmentation */}
            {analytics.customerSegmentation && (
              <Card className="p-6 mb-8">
                <h3 className="mb-6 font-display text-2xl font-bold">Customer Segmentation</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-4 font-semibold text-lg">New vs Returning</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <span className="font-medium">New Riders</span>
                        <span className="text-2xl font-bold text-green-600">
                          {analytics.customerSegmentation.newRiders}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <span className="font-medium">Returning Riders</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {analytics.customerSegmentation.returningRiders}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-4 font-semibold text-lg">By Experience Level</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <span className="font-medium">Beginners (1 ride)</span>
                        <span className="text-2xl font-bold text-yellow-600">
                          {analytics.customerSegmentation.byExperience.beginners}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <span className="font-medium">Intermediate (2-5 rides)</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {analytics.customerSegmentation.byExperience.intermediate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <span className="font-medium">Advanced (6+ rides)</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {analytics.customerSegmentation.byExperience.advanced}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Horse Utilization */}
            {analytics.horseUtilization && analytics.horseUtilization.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="mb-6 font-display text-2xl font-bold">Horse Utilization Rate</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left font-semibold">Horse Name</th>
                        <th className="pb-3 text-left font-semibold">Stable</th>
                        <th className="pb-3 text-right font-semibold">Bookings</th>
                        <th className="pb-3 text-right font-semibold">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.horseUtilization.map((horse: any, idx: number) => {
                        const totalPossibleBookings = 100; // Approximate max bookings per period
                        const utilizationRate = ((parseInt(horse.bookings) / totalPossibleBookings) * 100).toFixed(1);
                        return (
                          <tr key={idx} className="border-b">
                            <td className="py-3">{horse.name}</td>
                            <td className="py-3 text-muted-foreground">{horse.stable_name}</td>
                            <td className="py-3 text-right font-semibold">{horse.bookings}</td>
                            <td className="py-3 text-right">
                              <span className={`font-bold ${parseFloat(utilizationRate) > 70 ? "text-green-600" :
                                parseFloat(utilizationRate) > 40 ? "text-yellow-600" :
                                  "text-red-600"
                                }`}>
                                {utilizationRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Peak Booking Times */}
            {analytics.peakTimes && analytics.peakTimes.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="mb-6 font-display text-2xl font-bold">Peak Booking Times</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {analytics.peakTimes.slice(0, 6).map((time: any, idx: number) => {
                    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const dayName = daysOfWeek[parseInt(time.day_of_week)];
                    const hour = parseInt(time.hour);
                    const timeStr = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;

                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div>
                          <p className="font-semibold">{dayName}</p>
                          <p className="text-sm text-muted-foreground">{timeStr}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{time.booking_count}</p>
                          <p className="text-xs text-muted-foreground">bookings</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Customer Feedback */}
            {analytics.customerFeedback && (
              <Card className="p-6 mb-8">
                <h3 className="mb-6 font-display text-2xl font-bold">Customer Feedback & Ratings</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Stable Rating</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {analytics.customerFeedback.avgStableRating.toFixed(1)}
                      </p>
                    </div>
                    <Star className="h-12 w-12 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Horse Rating</p>
                      <p className="text-3xl font-bold text-green-600">
                        {analytics.customerFeedback.avgHorseRating.toFixed(1)}
                      </p>
                    </div>
                    <Star className="h-12 w-12 text-green-500 fill-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reviews</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analytics.customerFeedback.totalReviews}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Bookings Table */}
            {analytics.recentBookings && analytics.recentBookings.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="mb-6 font-display text-2xl font-bold">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-left font-semibold text-sm">Horse</th>
                        <th className="pb-3 text-left font-semibold text-sm">Date</th>
                        <th className="pb-3 text-left font-semibold text-sm">Time</th>
                        <th className="pb-3 text-left font-semibold text-sm">Rider</th>
                        <th className="pb-3 text-left font-semibold text-sm">Stable</th>
                        <th className="pb-3 text-right font-semibold text-sm">Price</th>
                        <th className="pb-3 text-center font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentBookings.map((booking: any) => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 font-medium">{booking.horseName}</td>
                          <td className="py-3 text-muted-foreground">{booking.date}</td>
                          <td className="py-3 text-muted-foreground">{booking.time}</td>
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{booking.riderName}</p>
                              <p className="text-xs text-muted-foreground">{booking.riderEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">{booking.stableName}</td>
                          <td className="py-3 text-right font-semibold text-green-600">
                            ${booking.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400'
                              }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Detailed Users Section */}
            {analytics.detailedUsers && analytics.detailedUsers.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="mb-6 font-display text-2xl font-bold">User Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-left font-semibold text-sm">Name</th>
                        <th className="pb-3 text-left font-semibold text-sm">Email</th>
                        <th className="pb-3 text-left font-semibold text-sm">Phone</th>
                        <th className="pb-3 text-center font-semibold text-sm">Bookings</th>
                        <th className="pb-3 text-left font-semibold text-sm">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.detailedUsers.map((user: any) => (
                        <React.Fragment key={user.id}>
                          <tr className="border-b border-white/5 hover:bg-white/5 cursor-pointer group">
                            <td className="py-3 font-medium">{user.fullName}</td>
                            <td className="py-3 text-muted-foreground text-sm">{user.email}</td>
                            <td className="py-3 text-muted-foreground text-sm">{user.phoneNumber}</td>
                            <td className="py-3 text-center">
                              <span className="inline-flex px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                                {user.totalBookings}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                          {/* Booking History */}
                          {user.bookings && user.bookings.length > 0 && (
                            <tr>
                              <td colSpan={5} className="pb-4 pt-2">
                                <div className="ml-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">BOOKING HISTORY</p>
                                  <div className="space-y-2">
                                    {user.bookings.map((b: any) => (
                                      <div key={b.id} className="flex items-center justify-between text-sm p-2 bg-white/5 rounded">
                                        <div className="flex items-center gap-4">
                                          <span className="font-medium">{b.horseName}</span>
                                          <span className="text-muted-foreground">@</span>
                                          <span className="text-muted-foreground">{b.stableName}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="text-muted-foreground">{b.date} {b.time}</span>
                                          <span className="font-semibold text-green-600">${b.totalPrice.toFixed(2)}</span>
                                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${b.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400' :
                                            b.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400' :
                                              b.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400'
                                            }`}>
                                            {b.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Bookings Over Time</h3>
            {analytics.bookingsByMonth && analytics.bookingsByMonth.length > 0 ? (
              <SimpleLineChart
                data={analytics.bookingsByMonth.map((item: any) => {
                  // Handle month conversion - it might be a string or Date-like object
                  let month: string | Date = item.month;
                  if (item.month && typeof item.month === 'object' && 'toISOString' in item.month) {
                    month = new Date(item.month);
                  } else if (typeof month === 'string') {
                    // Already a string, pass through
                    month = month;
                  } else {
                    // Try to convert to ISO string if it's a date-like object
                    month = new Date(item.month).toISOString();
                  }
                  return {
                    month: month,
                    value: Number(item.count || item.booking_count || 0),
                  };
                })}
                label="Bookings"
                valueFormatter={(v) => Math.round(v).toString()}
                color="hsl(var(--primary))"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <p>No booking data available</p>
              </div>
            )}
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Revenue Over Time</h3>
            {analytics.revenueByMonth && analytics.revenueByMonth.length > 0 ? (
              <SimpleLineChart
                data={analytics.revenueByMonth.map((item: any) => {
                  // Handle month conversion - it might be a string or Date-like object
                  let month: string | Date = item.month;
                  if (item.month && typeof item.month === 'object' && 'toISOString' in item.month) {
                    month = new Date(item.month);
                  } else if (typeof month === 'string') {
                    // Already a string, pass through
                    month = month;
                  } else {
                    // Try to convert to ISO string if it's a date-like object
                    month = new Date(item.month).toISOString();
                  }
                  return {
                    month: month,
                    value: Number(item.revenue || 0),
                  };
                })}
                label="Revenue"
                valueFormatter={(v) => `EGP ${v.toFixed(2)}`}
                color="hsl(var(--secondary))"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <p>No revenue data available</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

