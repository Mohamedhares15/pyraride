"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
      const response = await fetch(`/api/analytics?days=${days}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load analytics</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
                {isAdmin ? "Platform Analytics" : "Stable Analytics"}
              </h1>
              <p className="text-muted-foreground">
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
                  ${(analytics.overview.totalRevenue || analytics.overview.netEarnings || 0).toFixed(2)}
                </p>
                {!isAdmin && analytics.overview.platformCommission && (
                  <p className="text-xs text-muted-foreground">
                    Platform fee: ${parseFloat(analytics.overview.platformCommission.toString()).toFixed(2)}
                  </p>
                )}
              </div>
              <DollarSign className="h-12 w-12 text-secondary" />
            </div>
          </Card>

          {!isAdmin && analytics.overview.cancellationRate && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                  <p className="text-3xl font-bold">
                    {parseFloat(analytics.overview.cancellationRate).toFixed(1)}%
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

        {/* Charts Placeholder */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Bookings Over Time</h3>
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <p>Chart visualization coming soon</p>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Revenue Over Time</h3>
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <p>Chart visualization coming soon</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

