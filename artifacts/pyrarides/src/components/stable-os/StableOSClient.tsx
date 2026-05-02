"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import {
  Calendar,
  TrendingUp,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Copy,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Star,
  HouseIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  commission: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  horse: { id: string; name: string };
  rider: { id: string; fullName: string | null; email: string; profileImageUrl?: string | null };
  createdAt: string;
}

interface Horse {
  id: string;
  name: string;
  adminTier?: string | null;
  pricePerHour: number;
  isActive: boolean;
  isTemporarilyUnavailable?: boolean;
  ownerNotes?: string | null;
  color?: string | null;
}

interface Stable {
  id: string;
  name: string;
  location: string;
  announcementBanner?: string | null;
  slug?: string | null;
  horses: Horse[];
}

type Tab = "bookings" | "revenue" | "marketing" | "horses" | "crm" | "analytics";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "horses", label: "Horses", icon: HouseIcon },
  { id: "crm", label: "Riders", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  completed: "bg-green-500/20 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-600 border-red-500/30",
  pending: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  rescheduled: "bg-purple-500/20 text-purple-600 border-purple-500/30",
};

// ─────────────────────────────────────────────────
// Stable OS Hub Component
// ─────────────────────────────────────────────────
export default function StableOSClient({ stableId }: { stableId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [stable, setStable] = useState<Stable | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "all">("month");

  // Banner state
  const [banner, setBanner] = useState("");
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerSaved, setBannerSaved] = useState(false);

  // Copy state for share link
  const [copied, setCopied] = useState(false);

  // Horse update state
  const [horseSaving, setHorseSaving] = useState<string | null>(null);
  const [horseNotes, setHorseNotes] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Auth guard ──────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user?.role !== "stable_owner" && session.user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // ── Load stable + bookings ──────────────────────
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [stableRes, bookingsRes, announceRes] = await Promise.all([
        fetch(`/api/stables/${stableId}`),
        fetch(`/api/stables/${stableId}/bookings`),
        fetch(`/api/stables/${stableId}/announce`),
      ]);

      if (stableRes.ok) {
        const data = await stableRes.json();
        setStable(data);
        const notesMap: Record<string, string> = {};
        (data.horses || []).forEach((h: Horse) => {
          notesMap[h.id] = h.ownerNotes || "";
        });
        setHorseNotes(notesMap);
      }
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }
      if (announceRes.ok) {
        const data = await announceRes.json();
        setBanner(data.banner || "");
      }
    } finally {
      setIsLoading(false);
    }
  }, [stableId]);

  useEffect(() => {
    if (session?.user?.id) loadData();
  }, [session?.user?.id, loadData]);

  // ── Helpers ─────────────────────────────────────
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const netEarning = (b: Booking) =>
    Number(b.totalPrice) - Number(b.commission);

  // ── Filter bookings by period ────────────────────
  const filteredBookings = bookings.filter((b) => {
    if (period === "all") return true;
    const d = new Date(b.startTime);
    const now = new Date();
    if (period === "day") {
      return d.toDateString() === now.toDateString();
    } else if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    } else {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return d >= monthAgo;
    }
  });

  const completedBookings = filteredBookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce((s, b) => s + netEarning(b), 0);
  const upcomingCount = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.startTime) > new Date()
  ).length;

  // ── Revenue chart data ──────────────────────────
  const revenueByHorse = (stable?.horses || []).map((h) => {
    const hBookings = completedBookings.filter((b) => b.horse.id === h.id);
    return {
      name: h.name,
      revenue: hBookings.reduce((s, b) => s + netEarning(b), 0),
      count: hBookings.length,
    };
  });

  // ── Analytics data ──────────────────────────────
  const hourCounts: Record<number, number> = {};
  bookings.forEach((b) => {
    const h = new Date(b.startTime).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  const peakHoursData = Object.entries(hourCounts)
    .map(([h, count]) => ({
      hour: `${h}:00`,
      count,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  const cancellationRate =
    bookings.length > 0
      ? ((bookings.filter((b) => b.status === "cancelled").length / bookings.length) * 100).toFixed(1)
      : "0";

  // Unique riders by riderId
  const riderMap = new Map<
    string,
    { id: string; name: string; email: string; bookings: Booking[]; totalSpent: number; lastRide: string }
  >();
  bookings.forEach((b) => {
    const rid = b.rider.id;
    if (!riderMap.has(rid)) {
      riderMap.set(rid, {
        id: rid,
        name: b.rider.fullName || b.rider.email,
        email: b.rider.email,
        bookings: [],
        totalSpent: 0,
        lastRide: b.startTime,
      });
    }
    const r = riderMap.get(rid)!;
    r.bookings.push(b);
    if (b.status === "completed") r.totalSpent += netEarning(b);
    if (new Date(b.startTime) > new Date(r.lastRide)) r.lastRide = b.startTime;
  });
  const riders = Array.from(riderMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  // ── Actions ─────────────────────────────────────
  const saveBanner = async () => {
    setBannerSaving(true);
    await fetch(`/api/stables/${stableId}/announce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banner }),
    });
    setBannerSaving(false);
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://www.pyrarides.com/${stable?.slug || `s/${stableId}`}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleHorseAvailability = async (horse: Horse) => {
    setHorseSaving(horse.id);
    const newVal = !horse.isTemporarilyUnavailable;
    await fetch(`/api/horses/${horse.id}/owner`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTemporarilyUnavailable: newVal }),
    });
    setStable((prev) =>
      prev
        ? {
            ...prev,
            horses: prev.horses.map((h) =>
              h.id === horse.id ? { ...h, isTemporarilyUnavailable: newVal, isActive: !newVal } : h
            ),
          }
        : prev
    );
    setHorseSaving(null);
  };

  const saveHorseNotes = async (horseId: string) => {
    setHorseSaving(horseId);
    await fetch(`/api/horses/${horseId}/owner`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerNotes: horseNotes[horseId] || "" }),
    });
    setHorseSaving(null);
  };

  const deleteHorse = async (horseId: string) => {
    await fetch(`/api/horses/${horseId}`, { method: "DELETE" });
    setStable((prev) =>
      prev ? { ...prev, horses: prev.horses.filter((h) => h.id !== horseId) } : prev
    );
    setDeleteConfirm(null);
  };

  // ── Export CSV ──────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["Date", "Horse", "Rider", "Status", "Earnings (EGP)"],
      ...filteredBookings.map((b) => [
        fmt(b.startTime),
        b.horse.name,
        b.rider.fullName || b.rider.email,
        b.status,
        netEarning(b).toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${stable?.name || "stable"}-bookings.csv`;
    a.click();
  };

  // ── Render ───────────────────────────────────────
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 py-3">
            <Link href={`/stables/${stableId}`}>
              <button className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-base truncate">{stable?.name || "Stable OS"}</h1>
              <p className="text-xs text-muted-foreground">Management Dashboard</p>
            </div>
            <Link href={`/stables/${stableId}`} target="_blank">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5">
                <ExternalLink className="h-3 w-3" />
                Public Page
              </button>
            </Link>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-0 no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* ═══════════════ BOOKINGS ═══════════════ */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: bookings.length, color: "text-foreground" },
                    { label: "Upcoming", value: upcomingCount, color: "text-blue-600" },
                    { label: "Completed", value: completedBookings.length, color: "text-green-600" },
                    { label: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length, color: "text-red-600" },
                  ].map((s) => (
                    <Card key={s.label} className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Period filter */}
                <div className="flex gap-2">
                  {(["day", "week", "month", "all"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                        period === p
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {p === "day" ? "Today" : p === "all" ? "All Time" : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                    </button>
                  ))}
                </div>

                {/* Booking list */}
                {filteredBookings.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-muted-foreground">No bookings for this period.</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {filteredBookings.map((b) => (
                      <Card key={b.id} className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm truncate">{b.horse.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[b.status] || ""}`}>
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {b.rider.fullName || b.rider.email} · {fmt(b.startTime)}, {fmtTime(b.startTime)}–{fmtTime(b.endTime)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold">{netEarning(b).toLocaleString()} EGP</p>
                            <p className="text-[10px] text-muted-foreground">Your earnings</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════ REVENUE ═══════════════ */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                {/* Period filter */}
                <div className="flex gap-2">
                  {(["day", "week", "month", "all"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                        period === p
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {p === "day" ? "Today" : p === "all" ? "All Time" : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                    </button>
                  ))}
                </div>

                {/* Revenue cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Net Earnings</p>
                    <p className="text-3xl font-bold text-green-600">{totalRevenue.toLocaleString()} EGP</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Completed Rides</p>
                    <p className="text-3xl font-bold">{completedBookings.length}</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Avg Per Ride</p>
                    <p className="text-3xl font-bold">
                      {completedBookings.length > 0
                        ? Math.round(totalRevenue / completedBookings.length).toLocaleString()
                        : 0}{" "}
                      EGP
                    </p>
                  </Card>
                </div>

                {/* Per-horse table */}
                {revenueByHorse.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4 text-sm">Performance by Horse</h3>
                    {/* Inline CSS bar chart */}
                    <div className="space-y-2 mb-4">
                      {revenueByHorse.map((h, i) => {
                        const maxRev = Math.max(...revenueByHorse.map((x) => x.revenue), 1);
                        const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4"];
                        return (
                          <div key={h.name} className="flex items-center gap-2">
                            <span className="w-20 text-xs truncate text-muted-foreground">{h.name}</span>
                            <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 flex items-center px-2"
                                style={{ width: `${(h.revenue / maxRev) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                              />
                            </div>
                            <span className="text-xs font-bold w-20 text-right">{h.revenue.toLocaleString()} EGP</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="divide-y divide-border">
                      {revenueByHorse.map((h) => (
                        <div key={h.name} className="flex items-center justify-between py-2.5 text-sm">
                          <span className="font-medium">{h.name}</span>
                          <div className="flex items-center gap-6 text-right">
                            <span className="text-xs text-muted-foreground">{h.count} rides</span>
                            <span className="font-bold">{h.revenue.toLocaleString()} EGP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Button onClick={exportCSV} variant="outline" className="w-full">
                  Export CSV
                </Button>
              </div>
            )}

            {/* ═══════════════ MARKETING ═══════════════ */}
            {activeTab === "marketing" && (
              <div className="space-y-6">
                {/* Announcement Banner */}
                <Card className="p-5">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <Megaphone className="h-4 w-4" /> Announcement Banner
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    This text appears at the top of your stable page for all visitors.
                  </p>
                  <textarea
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    maxLength={300}
                    rows={3}
                    placeholder='e.g. "We are fully open! Book your ride now 🐎"'
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{banner.length}/300</span>
                    <button
                      onClick={saveBanner}
                      disabled={bannerSaving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold px-5 py-2 disabled:opacity-60"
                    >
                      {bannerSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : bannerSaved ? <CheckCheck className="h-3.5 w-3.5" /> : null}
                      {bannerSaved ? "Saved!" : "Save Banner"}
                    </button>
                  </div>
                </Card>

                {/* Share Link */}
                <Card className="p-5">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Your Share Link
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Share this link on Instagram, WhatsApp, or anywhere. Riders land directly on your stable page — no distractions.
                  </p>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5">
                    <span className="text-sm flex-1 truncate text-muted-foreground">
                      pyrarides.com/{stable?.slug || `s/${stableId}`}
                    </span>
                    <button
                      onClick={copyShareLink}
                      className="shrink-0 flex items-center gap-1.5 rounded-full bg-foreground text-background text-xs font-bold px-3 py-1.5"
                    >
                      {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <Link
                    href={`/${stable?.slug || `s/${stableId}`}`}
                    target="_blank"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Preview your share page
                  </Link>
                </Card>
              </div>
            )}

            {/* ═══════════════ HORSES ═══════════════ */}
            {activeTab === "horses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Your Horses ({stable?.horses.length || 0})</h2>
                  <Link href="/dashboard/stable/horses">
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-muted">
                      <Plus className="h-3.5 w-3.5" /> Add Horse
                    </button>
                  </Link>
                </div>

                {(stable?.horses || []).map((horse) => (
                  <Card key={horse.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{horse.name}</span>
                        {horse.adminTier && (
                          <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                            horse.adminTier === "Advanced" ? "bg-red-500" :
                            horse.adminTier === "Intermediate" ? "bg-amber-500" : "bg-emerald-500"
                          }`}>
                            {horse.adminTier}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Toggle availability */}
                        <button
                          onClick={() => toggleHorseAvailability(horse)}
                          disabled={horseSaving === horse.id}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                            horse.isTemporarilyUnavailable
                              ? "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                              : "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20"
                          }`}
                        >
                          {horseSaving === horse.id ? <Loader2 className="h-3 w-3 animate-spin" /> : horse.isTemporarilyUnavailable ? "Unavailable" : "Available"}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(horse.id)}
                          className="h-7 w-7 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-red-600 hover:border-red-500/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Owner Notes */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                        Private Notes (only you see this)
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={horseNotes[horse.id] || ""}
                          onChange={(e) => setHorseNotes((n) => ({ ...n, [horse.id]: e.target.value }))}
                          placeholder="Health notes, behavior, trainer tips..."
                          rows={2}
                          className="flex-1 text-sm rounded-xl border border-border bg-muted/50 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() => saveHorseNotes(horse.id)}
                          disabled={horseSaving === horse.id}
                          className="shrink-0 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center self-end"
                        >
                          {horseSaving === horse.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirm */}
                    {deleteConfirm === horse.id && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          Delete {horse.name}? This cannot be undone.
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border">Cancel</button>
                          <button onClick={() => deleteHorse(horse.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-600 text-white">Delete</button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* ═══════════════ CRM ═══════════════ */}
            {activeTab === "crm" && (
              <div className="space-y-4">
                <h2 className="font-bold">Your Riders ({riders.length})</h2>
                {riders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-muted-foreground">No riders yet.</p>
                  </Card>
                ) : (
                  riders.map((rider) => (
                    <Card key={rider.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                            {(rider.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{rider.name}</p>
                            <p className="text-xs text-muted-foreground">{rider.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{rider.totalSpent.toLocaleString()} EGP</p>
                          <p className="text-xs text-muted-foreground">{rider.bookings.length} bookings</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Last ride: {fmt(rider.lastRide)}</span>
                        <span>·</span>
                        <span>
                          Horses: {[...new Set(rider.bookings.map((b) => b.horse.name))].join(", ")}
                        </span>
                        {rider.bookings.length >= 3 && (
                          <span className="ml-auto flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="h-3 w-3 fill-amber-400" /> Loyal
                          </span>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* ═══════════════ ANALYTICS ═══════════════ */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Rides", value: bookings.length },
                    { label: "Unique Riders", value: riders.length },
                    { label: "Cancellation Rate", value: `${cancellationRate}%` },
                    { label: "Repeat Riders", value: riders.filter((r) => r.bookings.length >= 2).length },
                  ].map((s) => (
                    <Card key={s.label} className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <p className="text-2xl font-bold">{s.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Peak hours */}
                {peakHoursData.length > 0 && (
                  <Card className="p-5">
                    <h3 className="font-semibold mb-4 text-sm">Peak Booking Hours</h3>
                    <div className="flex items-end gap-1 h-36">
                      {peakHoursData.map((d) => {
                        const maxCount = Math.max(...peakHoursData.map((x) => x.count), 1);
                        return (
                          <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-primary/80 rounded-t transition-all duration-500"
                              style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                            />
                            <span className="text-[9px] text-muted-foreground">{d.hour.replace(":00", "")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Most popular horses */}
                {revenueByHorse.length > 0 && (
                  <Card className="p-5">
                    <h3 className="font-semibold mb-3 text-sm">Most Popular Horses</h3>
                    <div className="space-y-2">
                      {[...revenueByHorse]
                        .sort((a, b) => b.count - a.count)
                        .map((h, i) => (
                          <div key={h.name} className="flex items-center gap-3">
                            <span className="w-5 text-xs text-muted-foreground text-right">{i + 1}.</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-0.5">
                                <span className="text-sm font-medium">{h.name}</span>
                                <span className="text-xs text-muted-foreground">{h.count} rides</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{
                                    width: `${revenueByHorse.length > 0 && Math.max(...revenueByHorse.map((x) => x.count)) > 0
                                      ? (h.count / Math.max(...revenueByHorse.map((x) => x.count))) * 100
                                      : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
