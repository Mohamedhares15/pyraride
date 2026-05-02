"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, MapPin } from "lucide-react";

interface TransportZone {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminTransportZonesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [zones, setZones] = useState<TransportZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<TransportZone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    } else {
      fetchZones();
    }
  }, [session, status]);

  const fetchZones = async () => {
    try {
      const res = await fetch("/api/transport-zones");
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (err) {
      console.error("Failed to fetch zones", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", isActive: true });
    setEditingZone(null);
  };

  const openEdit = (zone: TransportZone) => {
    setEditingZone(zone);
    setFormData({ name: zone.name, price: zone.price.toString(), isActive: zone.isActive });
    setIsEditDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transport-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create zone");
      toast.success("Transportation zone created.");
      setIsDialogOpen(false);
      resetForm();
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/transport-zones/${editingZone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update zone");
      toast.success("Zone updated.");
      setIsEditDialogOpen(false);
      resetForm();
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (zone: TransportZone) => {
    if (!confirm(`Delete "${zone.name}"? This will remove it from all checkout pages.`)) return;
    try {
      const res = await fetch(`/api/admin/transport-zones/${zone.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete zone");
      toast.success("Zone deleted.");
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.");
    }
  };

  const handleToggleActive = async (zone: TransportZone, checked: boolean) => {
    try {
      const res = await fetch(`/api/admin/transport-zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Zone ${checked ? "activated" : "deactivated"}.`);
      fetchZones();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  if (isLoading || status === "loading") {
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
      <div className="container mx-auto pt-24 md:pt-12 pb-12 px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-5">
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Admin</p>
            <h1 className="font-display text-3xl font-light">Transportation Zones</h1>
            <p className="text-ink-soft text-sm mt-2 max-w-xl">
              Manage pickup cities, locations, and pricing for package addons. These are dynamically available at customer checkout.
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add Zone
          </button>
        </div>

        {/* Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {zones.map(zone => (
            <div key={zone.id} className="border hairline bg-surface flex flex-col relative">
              {!zone.isActive && (
                <div className="absolute top-3 right-3 bg-red-100 text-red-700 border border-red-200 py-0.5 px-2 text-[10px] uppercase tracking-luxury font-semibold z-10">
                  Inactive
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center border hairline bg-surface-elevated shrink-0">
                    <MapPin className="h-4 w-4 text-foreground opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{zone.name}</h3>
                    <p className="font-display text-2xl font-light mt-1">EGP {zone.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-auto pt-5 border-t hairline">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      id={`active-${zone.id}`}
                      checked={zone.isActive}
                      onCheckedChange={(checked) => handleToggleActive(zone, checked)}
                    />
                    <Label htmlFor={`active-${zone.id}`} className="text-xs text-ink-muted cursor-pointer">
                      {zone.isActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                  <button
                    onClick={() => openEdit(zone)}
                    className="border hairline p-2 hover:bg-foreground hover:text-background transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(zone)}
                    className="border border-red-200 p-2 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {zones.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 border hairline bg-surface py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center border hairline bg-surface-elevated mx-auto mb-4">
                <MapPin className="h-6 w-6 text-foreground opacity-30" />
              </div>
              <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-2">No zones configured</p>
              <p className="text-sm text-ink-soft">Add your first zone (e.g., "Zone 1: Giza & Haram") to let customers select it during checkout.</p>
            </div>
          )}
        </div>

        {/* Create / Edit Dialog */}
        <Dialog open={isDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-lg bg-background border hairline text-foreground p-8">
            <DialogHeader className="mb-6">
              <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-2">
                {isEditDialogOpen ? "Edit" : "New"} Zone
              </p>
              <DialogTitle className="font-display text-2xl font-light">
                {isEditDialogOpen ? "Edit Transport Zone" : "New Transport Zone"}
              </DialogTitle>
              <DialogDescription className="text-ink-soft text-sm mt-2">
                Configure the exact cities and price for this pickup zone to be shown at checkout.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={isEditDialogOpen ? handleUpdate : handleCreate} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-luxury text-ink-muted">Zone Name & Included Cities</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Zone 1: Giza, Haram, Dokki"
                    required
                    className="bg-surface border hairline text-foreground h-11 rounded-none focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                  <p className="text-xs text-ink-muted italic">This is exactly what the customer will see in the checkout dropdown.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-luxury text-ink-muted">Total Price (EGP)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 400"
                    required
                    className="bg-surface border hairline text-foreground h-11 rounded-none focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                  <p className="text-xs text-ink-muted">Use 0 for "Meet at location" options.</p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    id="active-status"
                    checked={formData.isActive}
                    onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="active-status" className="text-sm cursor-pointer">Make Available Immediately</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t hairline">
                <button
                  type="button"
                  className="px-6 py-2.5 border hairline text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface transition-colors"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-foreground text-background text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditDialogOpen ? "Save Changes" : "Create Zone")}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
