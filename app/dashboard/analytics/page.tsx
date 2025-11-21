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
  Loader2,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      setIsLoading(true);
      const response = await fetch(`/api/analytics?days=${days}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      if (!data.analytics) {
        throw new Error("Invalid analytics data received");
      }
      
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalytics(null);
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

  if (!analytics && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
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

