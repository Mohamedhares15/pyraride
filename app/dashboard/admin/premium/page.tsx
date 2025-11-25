"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Loader2,
  ShieldCheck,
  ShieldX,
  Crown,
  Clock3,
  Search,
  RefreshCw,
} from "lucide-react";

interface StableOwner {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  hasPremiumAI: boolean;
  premiumAIExpiresAt?: string | null;
  createdAt: string;
  stable?: {
    id: string;
    name: string;
    location: string;
    status: string;
  } | null;
}

export default function PremiumAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [owners, setOwners] = useState<StableOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [grantUserId, setGrantUserId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchOwners();
  }, [session, status, router]);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        "/api/admin/users?role=stable_owner&includeStable=true",
        { cache: "no-store" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load stable owners");
      }

      const data = await response.json();
      setOwners(data.users || []);
    } catch (err: any) {
      console.error("Error loading stable owners:", err);
      setError(err.message || "Failed to load stable owners");
    } finally {
      setIsLoading(false);
    }
  };

  const premiumOwners = useMemo(
    () => owners.filter((owner) => owner.hasPremiumAI),
    [owners]
  );

  const expiringSoonCount = useMemo(() => {
    const now = new Date();
    const threshold = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return premiumOwners.filter((owner) => {
      if (!owner.premiumAIExpiresAt) return false;
      const expiry = new Date(owner.premiumAIExpiresAt);
      return expiry > now && expiry <= threshold;
    }).length;
  }, [premiumOwners]);

  const filteredOwners = useMemo(() => {
    if (!search) return owners;
    const term = search.toLowerCase();
    return owners.filter((owner) => {
      return (
        owner.email.toLowerCase().includes(term) ||
        owner.fullName?.toLowerCase().includes(term) ||
        owner.stable?.name?.toLowerCase().includes(term)
      );
    });
  }, [owners, search]);

  const handleGrantPremium = async () => {
    if (!grantUserId) {
      alert("Please select a stable owner");
      return;
    }

    setIsGranting(true);
    try {
      const body: Record<string, string> = { userId: grantUserId };
      if (expiresAt) {
        const isoDate = new Date(expiresAt).toISOString();
        body.expiresAt = isoDate;
      }

      const response = await fetch("/api/admin/premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to grant premium access");
      }

      setGrantUserId("");
      setExpiresAt("");
      await fetchOwners();
    } catch (err: any) {
      console.error("Error granting premium:", err);
      alert(err.message || "Failed to grant premium access");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokePremium = async (userId: string) => {
    setActionUserId(userId);
    try {
      const response = await fetch(`/api/admin/premium?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to revoke premium access");
      }

      await fetchOwners();
    } catch (err: any) {
      console.error("Error revoking premium:", err);
      alert(err.message || "Failed to revoke premium access");
    } finally {
      setActionUserId(null);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "No expiration";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/40 py-10 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            <h1 className="font-display text-4xl font-bold">Premium AI Access</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/analytics">Back to Analytics</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOwners}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stable Owners</p>
                <p className="text-3xl font-bold">{owners.length}</p>
              </div>
              <Crown className="h-10 w-10 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Premium</p>
                <p className="text-3xl font-bold">{premiumOwners.length}</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-3xl font-bold">{expiringSoonCount}</p>
              </div>
              <Clock3 className="h-10 w-10 text-yellow-500" />
            </div>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_2fr]">
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold">
              Grant Premium Access
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Select a stable owner, optionally set an expiration date, and grant
              full access to the premium AI suite.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerSelect">Stable Owner</Label>
                <select
                  id="ownerSelect"
                  value={grantUserId}
                  onChange={(event) => setGrantUserId(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Select a stable owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.fullName || "Unnamed Owner"} — {owner.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </div>

              <Button
                onClick={handleGrantPremium}
                disabled={isGranting || !grantUserId}
                className="w-full"
              >
                {isGranting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grant Premium Access
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Stable Owners
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage premium subscriptions, expiration dates, and revocations.
                </p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or stable"
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredOwners.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No stable owners found matching your search.
                </p>
              )}

              {filteredOwners.map((owner) => {
                const isPremium = owner.hasPremiumAI;
                const isExpiringSoon =
                  owner.premiumAIExpiresAt &&
                  new Date(owner.premiumAIExpiresAt) <
                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={owner.id}
                    className="rounded-2xl border border-border/60 bg-card/60 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">
                          {owner.fullName || "Unnamed Owner"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {owner.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {owner.stable
                            ? `${owner.stable.name} • ${owner.stable.location}`
                            : "No stable listed yet"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {isPremium ? (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <ShieldX className="h-4 w-4 text-destructive" />
                          )}
                          <span>
                            {isPremium ? "Premium Enabled" : "Premium Disabled"}
                          </span>
                        </div>
                        <span>
                          Expiration:{" "}
                          <strong>
                            {isPremium ? formatDate(owner.premiumAIExpiresAt) : "—"}
                          </strong>
                        </span>
                        {isPremium && isExpiringSoon && (
                          <span className="text-xs text-yellow-500">
                            Expiring within 14 days
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 md:w-48">
                        {isPremium ? (
                          <Button
                            variant="destructive"
                            onClick={() => handleRevokePremium(owner.id)}
                            disabled={actionUserId === owner.id}
                          >
                            {actionUserId === owner.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Revoke Premium
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGrantUserId(owner.id);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Grant Premium
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

