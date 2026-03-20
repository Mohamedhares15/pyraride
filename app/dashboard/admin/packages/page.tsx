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
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  maxPeople: number;
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
    duration: "",
    maxPeople: "",
    included: "", // comma separated
    highlights: "", // comma separated
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
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          included: formData.included.split(",").map(i => i.trim()).filter(Boolean),
          highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
        }),
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
      const res = await fetch(`/api/packages/${editingPackage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          included: formData.included.split(",").map(i => i.trim()).filter(Boolean),
          highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
        }),
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
      duration: "",
      maxPeople: "",
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
      duration: pkg.duration.toString(),
      maxPeople: pkg.maxPeople.toString(),
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
          <p className="text-muted-foreground mt-2">Create and manage luxury ride packages.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <Card key={pkg.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 w-full bg-muted">
              {pkg.imageUrl ? (
                <Image src={pkg.imageUrl} alt={pkg.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {!pkg.isActive && (
                <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground py-1 rounded text-xs px-2 font-bold backdrop-blur-sm shadow-black/50 shadow-sm">
                  INACTIVE
                </div>
              )}
              {pkg.isFeatured && (
                <div className="absolute top-2 right-2 bg-[#D4AF37] text-white py-1 rounded text-xs px-2 font-bold shadow-black/50 shadow-sm text-shadow">
                  FEATURED
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg">{pkg.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{pkg.description}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold">EGP {pkg.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{pkg.duration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max People:</span>
                  <span className="font-semibold">{pkg.maxPeople}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto pt-6">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(pkg)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(pkg)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {packages.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No packages created yet. Click "Add Package" to create your first package.
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Package" : "Create New Package"}</DialogTitle>
            <DialogDescription>Fill in the details for this luxury package.</DialogDescription>
          </DialogHeader>

          <form onSubmit={isEditDialogOpen ? handleUpdate : handleCreate} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Package Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={3}/>
              </div>
              <div className="space-y-2">
                <Label>Price (EGP)</Label>
                <Input type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Duration (Hours)</Label>
                <Input type="number" step="0.5" min="0" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Max People</Label>
                <Input type="number" min="1" value={formData.maxPeople} onChange={e => setFormData({...formData, maxPeople: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Image URL (Google Drive, Cloudinary, etc.)</Label>
                <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Included Amenities (comma separated)</Label>
                <Textarea value={formData.included} onChange={e => setFormData({...formData, included: e.target.value})} placeholder="Helmet, Tour Guide, Water Bottle" required rows={2} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Key Highlights (comma separated)</Label>
                <Textarea value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} placeholder="Watch the sunset, Private access" required rows={2} />
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={c => setFormData({...formData, isActive: c})}
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active Package</Label>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={c => setFormData({...formData, isFeatured: c})}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">Featured (Shows on Homepage)</Label>
              </div>
            </div>

            <div className="flex justify-end pt-6 gap-2 border-t">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditDialogOpen ? "Save Changes" : "Create Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
