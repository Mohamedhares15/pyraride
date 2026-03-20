"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Users, Clock, CalendarDays, Percent } from "lucide-react";
import Image from "next/image";

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  packageType: string;
  minPeople: number;
  maxPeople: number;
  duration: number;
  availableDays: string[];
  startTime: string | null;
  hasHorseRide: boolean;
  hasFood: boolean;
  hasDancingShow: boolean;
  hasParty: boolean;
  hasTransportation: boolean;
  transportationType: string | null;
  included: string[];
  highlights: string[];
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export default function AdminPackagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    packageType: "PRIVATE",
    duration: "",
    minPeople: "1",
    maxPeople: "",
    availableDays: "Everyday",
    startTime: "",
    hasHorseRide: true,
    hasFood: false,
    hasDancingShow: false,
    hasParty: false,
    hasTransportation: false,
    transportationType: "HOME_PICKUP",
    included: "", 
    highlights: "", 
    imageUrl: "",
    isActive: true,
    isFeatured: false,
    sortOrder: "0",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    } else {
      fetchPackages();
    }
  }, [session, status]);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error("Failed to fetch packages", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        availableDays: formData.availableDays.split(",").map(d => d.trim()).filter(Boolean),
        included: formData.included.split(",").map(i => i.trim()).filter(Boolean),
        highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
      };

      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchPackages();
        setIsDialogOpen(false);
        resetForm();
      } else {
        alert("Failed to create package");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        availableDays: formData.availableDays.split(",").map(d => d.trim()).filter(Boolean),
        included: formData.included.split(",").map(i => i.trim()).filter(Boolean),
        highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/packages/${editingPackage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchPackages();
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        alert("Failed to update package");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete "${pkg.title}"?`)) return;
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, { method: "DELETE" });
      if (res.ok) {
        setPackages(p => p.filter(x => x.id !== pkg.id));
      } else {
        alert("Failed to delete package");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      originalPrice: "",
      packageType: "PRIVATE",
      duration: "",
      minPeople: "1",
      maxPeople: "",
      availableDays: "Everyday",
      startTime: "",
      hasHorseRide: true,
      hasFood: false,
      hasDancingShow: false,
      hasParty: false,
      hasTransportation: false,
      transportationType: "HOME_PICKUP",
      included: "",
      highlights: "",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
      sortOrder: "0",
    });
    setEditingPackage(null);
  };

  const openEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice ? pkg.originalPrice.toString() : "",
      packageType: pkg.packageType,
      duration: pkg.duration.toString(),
      minPeople: pkg.minPeople.toString(),
      maxPeople: pkg.maxPeople.toString(),
      availableDays: pkg.availableDays.join(", "),
      startTime: pkg.startTime || "",
      hasHorseRide: pkg.hasHorseRide,
      hasFood: pkg.hasFood,
      hasDancingShow: pkg.hasDancingShow,
      hasParty: pkg.hasParty,
      hasTransportation: pkg.hasTransportation,
      transportationType: pkg.transportationType || "HOME_PICKUP",
      included: pkg.included.join(", "),
      highlights: pkg.highlights.join(", "),
      imageUrl: pkg.imageUrl,
      isActive: pkg.isActive,
      isFeatured: pkg.isFeatured,
      sortOrder: pkg.sortOrder.toString(),
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Manage Packages</h1>
          <p className="text-muted-foreground mt-2">Create and manage advanced luxury and group packages.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#D4AF37] hover:bg-[#B38728] text-black">
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <Card key={pkg.id} className="overflow-hidden flex flex-col border-white/10 relative group">
            <div className="relative h-56 w-full bg-muted">
              {pkg.imageUrl ? (
                <Image src={pkg.imageUrl} alt={pkg.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {pkg.packageType === "GROUP_EVENT" && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white py-1 rounded text-xs px-2 font-bold backdrop-blur-sm shadow-black/50 shadow-sm">
                  GROUP EVENT
                </div>
              )}
              {pkg.packageType === "PRIVATE" && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white py-1 rounded text-xs px-2 font-bold backdrop-blur-sm shadow-black/50 shadow-sm">
                  PRIVATE VIP
                </div>
              )}
              {!pkg.isActive && (
                <div className="absolute top-10 left-2 bg-destructive text-destructive-foreground py-1 rounded text-xs px-2 font-bold backdrop-blur-sm shadow-black/50 shadow-sm">
                  INACTIVE
                </div>
              )}
              {pkg.isFeatured && (
                <div className="absolute top-2 right-2 bg-[#D4AF37] text-black py-1 rounded text-xs px-2 font-bold shadow-black/50 shadow-sm text-shadow">
                  FEATURED
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-xl">{pkg.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{pkg.description}</p>
              
              <div className="mt-5 space-y-3 text-sm bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price:</span>
                  <div className="flex gap-2 items-center">
                    {pkg.originalPrice && <del className="text-red-400 font-medium">EGP {pkg.originalPrice}</del>}
                    <span className="font-bold text-[#D4AF37] text-lg">EGP {pkg.price}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4"/> Time/Duration:</span>
                  <span className="font-medium text-right">{pkg.startTime ? `${pkg.startTime} • ` : ''}{pkg.duration} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4"/> Capacity:</span>
                  <span className="font-medium">{pkg.minPeople} - {pkg.maxPeople}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-4 h-4"/> When:</span>
                  <span className="font-medium capitalize truncate max-w-[120px]" title={pkg.availableDays.join(", ")}>{pkg.availableDays.join(", ")}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-4">
                {pkg.hasHorseRide && <span className="text-[10px] bg-white/10 px-2 py-1 rounded">🐎 Ride</span>}
                {pkg.hasFood && <span className="text-[10px] bg-white/10 px-2 py-1 rounded">🍽️ Food</span>}
                {pkg.hasDancingShow && <span className="text-[10px] bg-white/10 px-2 py-1 rounded">💃 Show</span>}
                {pkg.hasTransportation && <span className="text-[10px] bg-white/10 px-2 py-1 rounded">🚗 Transport</span>}
              </div>

              <div className="flex gap-2 mt-auto pt-6">
                <Button variant="outline" className="flex-1 hover:bg-white/10" onClick={() => openEdit(pkg)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20" onClick={() => handleDelete(pkg)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {packages.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 border-2 border-dashed border-white/20 rounded-2xl text-muted-foreground bg-white/5">
            <h3 className="text-xl font-bold mb-2 text-white">No Packages Found</h3>
            <p>Create your first VIP or Group package to get started.</p>
          </div>
        )}
      </div>

      {/* Reusable Form Component inside Dialog */}
      <Dialog open={isDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-white">{isEditDialogOpen ? "Edit Package" : "Create Advanced Package"}</DialogTitle>
            <DialogDescription className="text-gray-400">Configure pricing, types, capacity, and amenities.</DialogDescription>
          </DialogHeader>

          <form onSubmit={isEditDialogOpen ? handleUpdate : handleCreate} className="space-y-8 mt-6">
            
            {/* 1. Core Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-[#D4AF37]">1. Core Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">Package Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Premium VIP Sunset Tour" required className="bg-white/5 text-white border-white/20" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={3} className="bg-white/5 text-white border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[#D4AF37]">Package Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    value={formData.packageType}
                    onChange={e => {
                      const type = e.target.value;
                      setFormData({
                        ...formData, 
                        packageType: type,
                        transportationType: type === "PRIVATE" ? "HOME_PICKUP" : "MEETING_POINT" 
                      });
                    }}
                  >
                    <option value="PRIVATE" className="bg-black text-white">Private (Standard/VIP - Per Booking)</option>
                    <option value="GROUP_EVENT" className="bg-black text-white">Group Event (Ticket Based)</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">Image URL</Label>
                  <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required className="bg-white/5 text-white border-white/20" />
                </div>
              </div>
            </div>

            {/* 2. Pricing & Capacity */}
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-[#D4AF37]">2. Pricing & Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Current Price (EGP)</Label>
                  <Input type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="bg-black/50 text-white border-white/20" />
                </div>
                <div className="space-y-2 relative">
                  <Label className="flex items-center gap-2 text-white">Original Price (EGP) <Percent className="w-3 h-3 text-red-400"/></Label>
                  <Input type="number" min="0" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} placeholder="Leave blank if no discount" className="bg-black/50 text-white border-white/20" />
                  <p className="text-[10px] mt-1 text-gray-400">If set, this creates a crossed-out discount effect.</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Min People <span className="text-gray-400 font-normal">{formData.packageType === "GROUP_EVENT" ? "(Min tickets to run)" : "(Usually 1)"}</span></Label>
                  <Input type="number" min="1" value={formData.minPeople} onChange={e => setFormData({...formData, minPeople: e.target.value})} required className="bg-black/50 text-white border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Max People <span className="text-gray-400 font-normal">{formData.packageType === "GROUP_EVENT" ? "(Max tickets)" : "(Exactly how many)"}</span></Label>
                  <Input type="number" min="1" value={formData.maxPeople} onChange={e => setFormData({...formData, maxPeople: e.target.value})} required className="bg-black/50 text-white border-white/20" />
                </div>
              </div>
            </div>

            {/* 3. Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-[#D4AF37]">3. Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Duration (Hours)</Label>
                  <Input type="number" step="0.5" min="0" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required className="bg-white/5 text-white border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Specific Start Time (Optional)</Label>
                  <Input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="bg-white/5 text-white border-white/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Available Days</Label>
                  <Input value={formData.availableDays} onChange={e => setFormData({...formData, availableDays: e.target.value})} placeholder="e.g. Everyday OR Friday, Saturday" className="bg-white/5 text-white border-white/20" required/>
                </div>
              </div>
            </div>

            {/* 4. Amenities Toggles */}
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-[#D4AF37]">4. Amenities & Included</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4">
                <div className="flex flex-col space-y-2 items-start">
                  <Label className="cursor-pointer text-sm font-medium text-white">Include Horse Ride?</Label>
                  <Switch checked={formData.hasHorseRide} onCheckedChange={c => setFormData({...formData, hasHorseRide: c})} />
                </div>
                <div className="flex flex-col space-y-2 items-start">
                  <Label className="cursor-pointer text-sm font-medium text-white">Include Food/Lunch?</Label>
                  <Switch checked={formData.hasFood} onCheckedChange={c => setFormData({...formData, hasFood: c})} />
                </div>
                <div className="flex flex-col space-y-2 items-start">
                  <Label className="cursor-pointer text-sm font-medium text-white">Include Dancing Show?</Label>
                  <Switch checked={formData.hasDancingShow} onCheckedChange={c => setFormData({...formData, hasDancingShow: c})} />
                </div>
                <div className="flex flex-col space-y-2 items-start">
                  <Label className="cursor-pointer text-sm font-medium text-white">Include Party?</Label>
                  <Switch checked={formData.hasParty} onCheckedChange={c => setFormData({...formData, hasParty: c})} />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch checked={formData.hasTransportation} onCheckedChange={c => setFormData({...formData, hasTransportation: c})} />
                  <Label className="cursor-pointer font-bold">Include Transportation?</Label>
                </div>
                
                {formData.hasTransportation && (
                  <div className="pl-12">
                    <Label className="text-muted-foreground mb-2 block">Transportation Mode:</Label>
                    <select 
                      className="h-10 w-full md:w-1/2 rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white focus-visible:outline-none"
                      value={formData.transportationType}
                      onChange={e => setFormData({...formData, transportationType: e.target.value})}
                    >
                      <option value="HOME_PICKUP" className="bg-black text-white">Direct Home Pickup & Return</option>
                      <option value="MEETING_POINT" className="bg-black text-white">Specific Meeting Point Selection</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <Label className="text-white">Other Included Items (comma separated)</Label>
                  <Textarea value={formData.included} onChange={e => setFormData({...formData, included: e.target.value})} placeholder="Helmet, Tour Guide, Water Bottle" rows={2} className="bg-black/50 text-white border-white/20"/>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Key Highlights (comma separated)</Label>
                  <Textarea value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} placeholder="Watch the sunset, Private access" rows={2} className="bg-black/50 text-white border-white/20" />
                </div>
              </div>
            </div>

            {/* 5. System */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2 text-[#D4AF37]">5. Publishing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 flex flex-col items-start bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                  <Label className="cursor-pointer font-bold text-green-400 mb-2">Active (Visible on site)</Label>
                  <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
                </div>
                <div className="space-y-2 flex flex-col items-start bg-[#D4AF37]/10 p-4 rounded-xl border border-[#D4AF37]/20">
                  <Label className="cursor-pointer font-bold text-[#D4AF37] mb-2">Featured (Homepage Show)</Label>
                  <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                </div>
                <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Label className="text-white">Display Sort Order</Label>
                  <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} required className="bg-black text-white border-white/20" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 gap-3 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#D4AF37] text-black hover:bg-[#B38728] px-8">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditDialogOpen ? "Save All Changes" : "Publish Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
