"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Search,
  Home,
  Building2,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Settings,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface Stable {
  id: string;
  name: string;
  location: string;
  address: string;
  status: "pending_approval" | "approved" | "rejected";
  isHidden: boolean;
  imageUrl?: string | null;
  commissionRate?: number; // Commission rate (0.15 = 15%)
  createdAt: string;
  owner: {
    id: string;
    fullName?: string | null;
    email: string;
  };
  _count?: {
    bookings: number;
    horses: number;
    reviews: number;
  };
  rating?: number;
}

export default function AdminStablesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stables, setStables] = useState<Stable[]>([]);
  const [filteredStables, setFilteredStables] = useState<Stable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState<{ [key: string]: number }>({});
  const [updatingCommission, setUpdatingCommission] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchStables();
  }, [session, status, router]);

  useEffect(() => {
    // Filter stables based on search and visibility filter
    let filtered = [...stables];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (stable) =>
          stable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stable.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stable.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply visibility filter
    if (filter === "visible") {
      filtered = filtered.filter((stable) => !stable.isHidden);
    } else if (filter === "hidden") {
      filtered = filtered.filter((stable) => stable.isHidden);
    }

    setFilteredStables(filtered);
  }, [stables, searchTerm, filter]);

  async function fetchStables() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/stables");
      if (!response.ok) {
        throw new Error("Failed to fetch stables");
      }
      const data = await response.json();
      setStables(data.stables || []);
    } catch (error) {
      console.error("Error fetching stables:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleVisibility(stableId: string, currentState: boolean) {
    try {
      setTogglingId(stableId);
      const response = await fetch(`/api/stables/${stableId}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHidden: !currentState }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update visibility");
      }

      // Update local state
      setStables((prev) =>
        prev.map((stable) =>
          stable.id === stableId
            ? { ...stable, isHidden: !currentState }
            : stable
        )
      );
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      alert(error.message || "Failed to update visibility");
    } finally {
      setTogglingId(null);
    }
  }

  async function updateCommission(stableId: string) {
    try {
      setUpdatingCommission(stableId);
      const rate = commissionRate[stableId];
      
      if (rate === undefined || rate < 0 || rate > 1) {
        alert("Commission rate must be between 0 and 1 (e.g., 0.15 for 15%)");
        return;
      }

      const response = await fetch(`/api/admin/stables/${stableId}/commission`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commissionRate: rate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update commission rate");
      }

      // Update local state
      setStables((prev) =>
        prev.map((stable) =>
          stable.id === stableId
            ? { ...stable, commissionRate: rate }
            : stable
        )
      );

      setEditingCommission(null);
      alert(`Commission rate updated to ${(rate * 100).toFixed(1)}%`);
    } catch (error: any) {
      console.error("Error updating commission:", error);
      alert(error.message || "Failed to update commission rate");
    } finally {
      setUpdatingCommission(null);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

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
                Manage Stables
              </h1>
              <p className="text-muted-foreground">
                Hide or show stables from public view
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchStables}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or owner email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Visibility Filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All ({stables.length})
              </Button>
              <Button
                variant={filter === "visible" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("visible")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Visible (
                {stables.filter((s) => !s.isHidden).length})
              </Button>
              <Button
                variant={filter === "hidden" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("hidden")}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Hidden ({stables.filter((s) => s.isHidden).length})
              </Button>
            </div>
          </div>
        </Card>

        {/* Stables List */}
        {filteredStables.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No stables found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filter !== "all"
                ? "Try adjusting your filters"
                : "No stables registered yet"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStables.map((stable) => (
              <motion.div
                key={stable.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  {/* Stable Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold">
                        {stable.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{stable.location}</span>
                      </div>
                    </div>
                    {stable.isHidden && (
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Stable Details */}
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium">
                        {stable.owner.fullName || stable.owner.email}
                      </span>
                    </div>
                    {stable._count && (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Bookings:
                          </span>
                          <span className="font-medium">
                            {stable._count.bookings}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Horses:</span>
                          <span className="font-medium">
                            {stable._count.horses}
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span
                        className={`font-medium ${
                          stable.status === "approved"
                            ? "text-green-600"
                            : stable.status === "pending_approval"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {stable.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Commission: </span>
                      <span className="font-medium">
                        {((stable.commissionRate ?? 0.15) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant={stable.isHidden ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleVisibility(stable.id, stable.isHidden)}
                        disabled={togglingId === stable.id}
                      >
                        {togglingId === stable.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : stable.isHidden ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Show
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Hide
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/stables/${stable.id}`}>View</Link>
                      </Button>
                    </div>
                    <Dialog open={editingCommission === stable.id} onOpenChange={(open) => {
                      if (!open) setEditingCommission(null);
                      else {
                        setEditingCommission(stable.id);
                        setCommissionRate(prev => ({
                          ...prev,
                          [stable.id]: stable.commissionRate ?? 0.15
                        }));
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Set Commission
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Set Commission Rate</DialogTitle>
                          <DialogDescription>
                            Set the commission rate for {stable.name}. This rate will be applied to all future bookings.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="commission">Commission Rate (%)</Label>
                            <Input
                              id="commission"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={((commissionRate[stable.id] ?? stable.commissionRate ?? 0.15) * 100).toFixed(1)}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) / 100;
                                setCommissionRate(prev => ({
                                  ...prev,
                                  [stable.id]: value
                                }));
                              }}
                              placeholder="15.0"
                            />
                            <p className="text-xs text-muted-foreground">
                              Enter as percentage (e.g., 15 for 15%). Current: {((stable.commissionRate ?? 0.15) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingCommission(null)}
                            disabled={updatingCommission === stable.id}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => updateCommission(stable.id)}
                            disabled={updatingCommission === stable.id}
                          >
                            {updatingCommission === stable.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

