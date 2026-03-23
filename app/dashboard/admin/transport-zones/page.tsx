"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    setFormData({
      name: "",
      price: "",
      isActive: true,
    });
    setEditingZone(null);
  };

  const openEdit = (zone: TransportZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      price: zone.price.toString(),
      isActive: zone.isActive,
    });
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

      toast.success("Transportation Zone created successfully!");
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

      toast.success("Zone updated successfully!");
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
    if (!confirm(`Are you sure you want to delete ${zone.name}? This will remove it from all checkout pages.`)) return;

    try {
      const res = await fetch(`/api/admin/transport-zones/${zone.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete zone");

      toast.success("Zone deleted successfully!");
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
      
      toast.success(`Zone ${checked ? 'activated' : 'deactivated'}.`);
      fetchZones();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Transportation Zones</h1>
          <p className="text-muted-foreground mt-2">Manage pickup cities, locations, and pricing for package addons.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#D4AF37] hover:bg-[#B38728] text-black">
          <Plus className="mr-2 h-4 w-4" /> Add Zone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map(zone => (
          <Card key={zone.id} className="overflow-hidden flex flex-col border-white/10 relative group bg-white/5">
            {!zone.isActive && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground py-1 rounded text-xs px-2 font-bold shadow-black/50 shadow-sm z-10">
                INACTIVE
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-[#D4AF37]/20 p-2 text-[#D4AF37]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{zone.name}</h3>
                  <div className="mt-2 text-2xl font-bold text-[#D4AF37]">
                    EGP {zone.price.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto pt-6">
                <div className="flex items-center space-x-2 flex-1 mr-4">
                  <Switch 
                    id={`active-${zone.id}`}
                    checked={zone.isActive}
                    onCheckedChange={(checked) => handleToggleActive(zone, checked)}
                  />
                  <Label htmlFor={`active-${zone.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
                <Button variant="outline" size="sm" className="hover:bg-white/10" onClick={() => openEdit(zone)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20" onClick={() => handleDelete(zone)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {zones.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 border-2 border-dashed border-white/20 rounded-2xl text-muted-foreground bg-white/5">
            <h3 className="text-xl font-bold mb-2 text-white">No Zones Configured</h3>
            <p>Add your first transportation zone (e.g., "Zone 1: Giza & Haram") to let customers select it during checkout.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-[#D4AF37]">{isEditDialogOpen ? "Edit Transport Zone" : "New Transport Zone"}</DialogTitle>
            <DialogDescription className="text-gray-400">Configure the exact cities and price for this pickup zone.</DialogDescription>
          </DialogHeader>

          <form onSubmit={isEditDialogOpen ? handleUpdate : handleCreate} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Zone Name & Included Cities</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Zone 1: Giza, Haram, Dokki" 
                  required 
                  className="bg-white/5 text-white border-white/20" 
                />
                <p className="text-xs text-muted-foreground">This is exactly what the customer will see in the checkout dropdown.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Total Price (EGP)</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  placeholder="e.g. 400" 
                  required 
                  className="bg-white/5 text-white border-white/20" 
                />
                <p className="text-xs text-[#D4AF37]">Tip: Use 0 for "Meet at location" options.</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="active-status" 
                  checked={formData.isActive}
                  onCheckedChange={checked => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="active-status" className="text-sm font-medium leading-none cursor-pointer">
                  Make Available Immediately
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={() => {
                setIsDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#D4AF37] hover:bg-[#B38728] text-black w-32">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditDialogOpen ? "Save Changes" : "Create Zone")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
