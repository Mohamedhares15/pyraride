"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from 'wouter';

interface Location {
  id: string;
  name: string;
  isActive: boolean;
  _count?: { stables: number };
}

export default function AdminLocationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchLocations();
  }, [session, status, router]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/admin/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLocationName }),
      });
      if (!response.ok) throw new Error("Failed to add location");
      await fetchLocations();
      setNewLocationName("");
      toast.success("Location added.");
    } catch (error) {
      toast.error("Failed to add location");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (!response.ok) throw new Error("Failed to update location");
      setLocations(locations.map(loc => loc.id === id ? { ...loc, isActive: !currentState } : loc));
      toast.success("Location updated.");
    } catch {
      toast.error("Failed to update location");
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete location");
      setLocations(locations.filter(loc => loc.id !== id));
      toast.success("Location deleted.");
    } catch {
      toast.error("Failed to delete location");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b hairline bg-surface py-12">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="mb-5">
            <Link href="/dashboard/analytics">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-luxury text-ink-muted hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </button>
            </Link>
          </div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Admin</p>
          <h1 className="font-display text-4xl font-light">Location Management</h1>
          <p className="text-ink-soft text-sm mt-2">
            Manage available locations for stables. Adding a location here makes it available for new stables.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 space-y-8">
        {/* Add New */}
        <div className="border hairline bg-surface p-6">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Add New Location</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="locationName" className="sr-only">Location Name</Label>
              <Input
                id="locationName"
                placeholder="e.g., Luxor, Aswan"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
                className="bg-surface border hairline text-foreground h-11 rounded-none focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>
            <button
              onClick={handleAddLocation}
              disabled={isSaving || !newLocationName.trim()}
              className="flex items-center gap-2 bg-foreground text-background px-6 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        </div>

        {/* Location List */}
        <div className="divide-y divide-foreground/8 border hairline bg-surface">
          {locations.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center border hairline bg-surface-elevated mx-auto mb-4">
                <MapPin className="h-5 w-5 text-foreground opacity-20" />
              </div>
              <p className="text-ink-muted text-sm">No locations found. Add one above.</p>
            </div>
          ) : (
            locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center border hairline bg-surface-elevated shrink-0">
                    <MapPin className="h-4 w-4 text-foreground opacity-40" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{location.name}</p>
                    <p className="text-xs text-ink-muted">{location.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${location.id}`} className="text-xs text-ink-muted">Active</Label>
                    <Switch
                      id={`active-${location.id}`}
                      checked={location.isActive}
                      onCheckedChange={() => handleToggleActive(location.id, location.isActive)}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(location.id)}
                    className="flex h-9 w-9 items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
