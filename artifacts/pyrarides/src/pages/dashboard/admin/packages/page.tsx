"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from 'wouter';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Users, Clock,
  CalendarDays, Percent, Camera
} from "lucide-react";
import NextImage from "@/shims/next-image";
import { convertGoogleDriveUrls } from "@/lib/google-drive-utils";

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
  stableId?: string | null;
  minLeadTimeHours: number;
}

interface Stable {
  id: string;
  name: string;
}

const defaultFormData = {
  title: "", description: "", price: "", originalPrice: "",
  packageType: "PRIVATE", duration: "", minPeople: "1", maxPeople: "",
  availableDays: "Everyday", startTime: "", hasHorseRide: true, hasFood: false,
  hasDancingShow: false, hasParty: false, hasTransportation: false,
  transportationType: "HOME_PICKUP", included: "", highlights: "",
  imageUrl: "", googleDriveUrl: "", isActive: true, isFeatured: false,
  sortOrder: "0", stableId: "", minLeadTimeHours: "8",
};

export default function AdminPackagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [stables, setStables] = useState<Stable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); }
    else if (session?.user?.role !== "admin") { router.push("/dashboard"); }
    else { fetchPackages(); fetchStables(); }
  }, [session, status]);

  const fetchStables = async () => {
    try {
      const res = await fetch("/api/stables");
      if (res.ok) {
        const data = await res.json();
        setStables(Array.isArray(data.stables) ? data.stables : Array.isArray(data) ? data : []);
      }
    } catch { setStables([]); }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(Array.isArray(data) ? data : []);
      } else { setPackages([]); }
    } catch { console.error("Failed to fetch packages"); }
    finally { setIsLoading(false); }
  };

  const processImageToUpload = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files[0].size > 20 * 1024 * 1024) { toast.error("File too large (max 20MB)"); return; }
    if (!["image/jpeg","image/jpg","image/png","image/webp","image/heic"].includes(files[0].type)) {
      toast.error("Unsupported format"); return;
    }
    setImageFiles(files);
  };

  const getFinalImageUrl = async (): Promise<string> => {
    if (formData.googleDriveUrl?.trim()) {
      const urls = convertGoogleDriveUrls(formData.googleDriveUrl);
      if (urls.length > 0) return urls[0];
    }
    if (imageFiles.length > 0) return await processImageToUpload(imageFiles[0]);
    return formData.imageUrl;
  };

  const buildPayload = async () => ({
    ...formData,
    imageUrl: await getFinalImageUrl(),
    originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
    availableDays: formData.availableDays.split(",").map(d => d.trim()).filter(Boolean),
    included: formData.included.split(",").map(i => i.trim()).filter(Boolean),
    highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = await buildPayload();
      if (!payload.imageUrl) { toast.error("An image is required!"); return; }
      const res = await fetch("/api/packages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchPackages(); setIsDialogOpen(false); resetForm(); }
      else { alert("Failed to create package"); }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setIsSubmitting(true);
    try {
      const payload = await buildPayload();
      const res = await fetch(`/api/packages/${editingPackage.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchPackages(); setIsEditDialogOpen(false); resetForm(); }
      else { alert("Failed to update package"); }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete "${pkg.title}"?`)) return;
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, { method: "DELETE" });
      if (res.ok) setPackages(p => p.filter(x => x.id !== pkg.id));
      else alert("Failed to delete package");
    } catch (err) { console.error(err); }
  };

  const resetForm = () => { setFormData(defaultFormData); setImageFiles([]); setEditingPackage(null); };

  const openEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title, description: pkg.description, price: pkg.price.toString(),
      originalPrice: pkg.originalPrice?.toString() ?? "", packageType: pkg.packageType,
      duration: pkg.duration.toString(), minPeople: pkg.minPeople.toString(),
      maxPeople: pkg.maxPeople.toString(), availableDays: pkg.availableDays.join(", "),
      startTime: pkg.startTime || "", hasHorseRide: pkg.hasHorseRide, hasFood: pkg.hasFood,
      hasDancingShow: pkg.hasDancingShow, hasParty: pkg.hasParty,
      hasTransportation: pkg.hasTransportation,
      transportationType: pkg.transportationType || "HOME_PICKUP",
      included: pkg.included.join(", "), highlights: pkg.highlights.join(", "),
      imageUrl: pkg.imageUrl,
      googleDriveUrl: pkg.imageUrl.includes("drive.google.com") ? pkg.imageUrl : "",
      isActive: pkg.isActive, isFeatured: pkg.isFeatured, sortOrder: pkg.sortOrder.toString(),
      stableId: pkg.stableId || "", minLeadTimeHours: (pkg.minLeadTimeHours ?? 8).toString(),
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  const inputCls = "w-full bg-surface border hairline text-foreground p-3 focus:outline-none focus:ring-1 focus:ring-foreground text-sm h-10";
  const labelCls = "text-[10px] uppercase tracking-luxury text-ink-muted block mb-1.5";

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
        <div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Admin</p>
          <h1 className="font-display text-3xl font-light">Manage Packages</h1>
          <p className="text-ink-soft text-sm mt-1">Create and manage luxury and group packages.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/packages/bookings">
            <button className="flex items-center gap-2 border hairline px-5 py-2.5 text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface transition-colors">
              <Users className="h-4 w-4" /> View Bookings
            </button>
          </Link>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Package
          </button>
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.isArray(packages) && packages.map(pkg => (
          <div key={pkg.id} className="border hairline bg-surface overflow-hidden flex flex-col">
            <div className="relative h-52 w-full bg-surface-elevated">
              {pkg.imageUrl ? (
                <NextImage src={pkg.imageUrl} alt={pkg.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-foreground opacity-20" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {pkg.packageType === "GROUP_EVENT" && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase tracking-luxury px-2 py-0.5">Group Event</span>
                )}
                {pkg.packageType === "PRIVATE" && (
                  <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[10px] uppercase tracking-luxury px-2 py-0.5">Private VIP</span>
                )}
                {!pkg.isActive && (
                  <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] uppercase tracking-luxury px-2 py-0.5">Inactive</span>
                )}
              </div>
              {pkg.isFeatured && (
                <span className="absolute top-2 right-2 bg-foreground text-background text-[10px] uppercase tracking-luxury px-2 py-0.5">Featured</span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-medium text-foreground">{pkg.title}</h3>
              <p className="text-xs text-ink-muted line-clamp-2 mt-1.5 leading-relaxed">{pkg.description}</p>

              <div className="mt-4 border hairline bg-surface-elevated p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted text-xs">Price</span>
                  <div className="flex gap-2 items-center">
                    {pkg.originalPrice && <del className="text-red-400 text-xs">EGP {pkg.originalPrice}</del>}
                    <span className="font-display text-base">EGP {pkg.price}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> Duration</span>
                  <span className="text-xs">{pkg.startTime ? `${pkg.startTime} · ` : ""}{pkg.duration} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted text-xs flex items-center gap-1"><Users className="w-3 h-3"/> Capacity</span>
                  <span className="text-xs">{pkg.minPeople}–{pkg.maxPeople}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3"/> When</span>
                  <span className="text-xs truncate max-w-[140px]" title={pkg.availableDays.join(", ")}>{pkg.availableDays.join(", ")}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {pkg.hasHorseRide && <span className="text-[10px] border hairline px-2 py-0.5 text-ink-soft">🐎 Ride</span>}
                {pkg.hasFood && <span className="text-[10px] border hairline px-2 py-0.5 text-ink-soft">🍽️ Food</span>}
                {pkg.hasDancingShow && <span className="text-[10px] border hairline px-2 py-0.5 text-ink-soft">💃 Show</span>}
                {pkg.hasTransportation && <span className="text-[10px] border hairline px-2 py-0.5 text-ink-soft">🚗 Transport</span>}
              </div>

              <div className="flex gap-2 mt-auto pt-5">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex flex-1 items-center justify-center gap-2 border hairline py-2.5 text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface-elevated transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg)}
                  className="flex items-center justify-center border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2.5 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!Array.isArray(packages) || packages.length === 0) && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 border hairline bg-surface text-center">
            <div className="flex h-14 w-14 items-center justify-center border hairline bg-surface-elevated mx-auto mb-4">
              <ImageIcon className="h-6 w-6 text-foreground opacity-20" />
            </div>
            <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-1">No Packages</p>
            <p className="text-sm text-ink-soft">Create your first VIP or Group package to get started.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) { setIsDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border hairline text-foreground">
          <DialogHeader>
            <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-1">Admin</p>
            <DialogTitle className="font-display text-2xl font-light">
              {isEditDialogOpen ? "Edit Package" : "Create Package"}
            </DialogTitle>
            <DialogDescription className="text-ink-soft text-sm">
              Configure pricing, types, capacity, and amenities.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={isEditDialogOpen ? handleUpdate : handleCreate} className="space-y-8 mt-4">

            {/* 1. Core Details */}
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted border-b hairline pb-2">1 — Core Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Package Title</label>
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Premium VIP Sunset Tour" required className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    required rows={3} className={`${inputCls} h-auto`} />
                </div>
                <div>
                  <label className={labelCls}>Package Type</label>
                  <select className={inputCls} value={formData.packageType}
                    onChange={e => setFormData({...formData, packageType: e.target.value,
                      transportationType: e.target.value === "PRIVATE" ? "HOME_PICKUP" : "MEETING_POINT"})}>
                    <option value="PRIVATE">Private (Standard/VIP — Per Booking)</option>
                    <option value="GROUP_EVENT">Group Event (Ticket Based)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Assigned Stable (Optional)</label>
                  <select className={inputCls} value={formData.stableId}
                    onChange={e => setFormData({ ...formData, stableId: e.target.value })}>
                    <option value="">None (Platform Package)</option>
                    {Array.isArray(stables) && stables.map(stable => (
                      <option key={stable.id} value={stable.id}>{stable.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image Sources */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className={labelCls}>Google Drive Image URL (Recommended)</label>
                    <textarea value={formData.googleDriveUrl}
                      onChange={(e) => setFormData({ ...formData, googleDriveUrl: e.target.value })}
                      rows={2} placeholder="Paste a Google Drive link here..."
                      className={`${inputCls} h-auto font-mono`} />
                    <p className="text-[10px] text-ink-muted mt-1">
                      Right-click image in Google Drive → "Get link" → Set to "Anyone with the link" → Copy & paste.
                    </p>
                  </div>

                  <div className="relative border-b hairline flex justify-center">
                    <span className="absolute -top-2.5 bg-background px-2 text-[10px] uppercase tracking-luxury text-ink-muted">or</span>
                  </div>

                  <div>
                    <label className={labelCls}>Upload Photo from Device</label>
                    <input type="file" id="imageFileOp" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <label htmlFor="imageFileOp"
                      className="flex justify-center border hairline px-6 py-8 hover:bg-surface transition-colors cursor-pointer">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-10 w-10 text-foreground opacity-20" />
                        <p className="text-sm text-ink-muted mt-3">
                          {imageFiles.length > 0 ? imageFiles[0].name : "Click to upload (PNG, JPG, WEBP up to 20MB)"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Pricing & Capacity */}
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted border-b hairline pb-2">2 — Pricing & Limits</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Current Price (EGP)</label>
                  <input type="number" min="0" value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})} required className={inputCls} />
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-1`}>
                    Original Price (EGP) <Percent className="w-3 h-3 text-red-400"/>
                    <span className="text-ink-muted normal-case font-normal">(shows discount)</span>
                  </label>
                  <input type="number" min="0" value={formData.originalPrice}
                    onChange={e => setFormData({...formData, originalPrice: e.target.value})}
                    placeholder="Leave blank if no discount" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>
                    Min People {formData.packageType === "GROUP_EVENT" ? "(Min tickets to run)" : "(Usually 1)"}
                  </label>
                  <input type="number" min="1" value={formData.minPeople}
                    onChange={e => setFormData({...formData, minPeople: e.target.value})} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>
                    Max People {formData.packageType === "GROUP_EVENT" ? "(Max tickets)" : "(Exactly how many)"}
                  </label>
                  <input type="number" min="1" value={formData.maxPeople}
                    onChange={e => setFormData({...formData, maxPeople: e.target.value})} required className={inputCls} />
                </div>
              </div>
            </section>

            {/* 3. Schedule */}
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted border-b hairline pb-2">3 — Schedule</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Duration (Hours)</label>
                  <input type="number" step="0.5" min="0" value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Specific Start Time (Optional)</label>
                  <input type="time" value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Available Days</label>
                  <input value={formData.availableDays}
                    onChange={e => setFormData({...formData, availableDays: e.target.value})}
                    placeholder="e.g. Everyday OR Friday, Saturday" required className={inputCls} />
                </div>
                <div className="border border-amber-200 bg-amber-50 p-4">
                  <label className="text-[10px] uppercase tracking-luxury text-amber-700 flex items-center gap-1 mb-1.5">
                    <Clock className="h-3.5 w-3.5" /> Min. Lead Time (Hours)
                  </label>
                  <input type="number" min="0" step="1" value={formData.minLeadTimeHours}
                    onChange={e => setFormData({...formData, minLeadTimeHours: e.target.value})}
                    className="w-full bg-white border border-amber-200 text-foreground p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm h-9" />
                  <p className="text-[10px] text-amber-600 mt-1">Min hours in advance a customer must book. Set to 0 for anytime.</p>
                </div>
              </div>
            </section>

            {/* 4. Amenities */}
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted border-b hairline pb-2">4 — Amenities & Included</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
                {[
                  { key: "hasHorseRide", label: "Horse Ride" },
                  { key: "hasFood", label: "Food / Lunch" },
                  { key: "hasDancingShow", label: "Dancing Show" },
                  { key: "hasParty", label: "Party" },
                ].map(({ key, label }) => (
                  <div key={key} className="border hairline bg-surface-elevated p-4 flex flex-col gap-3">
                    <label className={labelCls}>{label}</label>
                    <Switch checked={(formData as any)[key]}
                      onCheckedChange={c => setFormData({...formData, [key]: c})} />
                  </div>
                ))}
              </div>

              <div className="border hairline bg-surface-elevated p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Switch checked={formData.hasTransportation}
                    onCheckedChange={c => setFormData({...formData, hasTransportation: c})} />
                  <label className="text-sm font-medium text-foreground cursor-pointer">Include Transportation</label>
                </div>
                {formData.hasTransportation && (
                  <div className="pl-12">
                    <label className={labelCls}>Transportation Mode</label>
                    <select className={`${inputCls} md:w-1/2`} value={formData.transportationType}
                      onChange={e => setFormData({...formData, transportationType: e.target.value})}>
                      <option value="HOME_PICKUP">Direct Home Pickup & Return</option>
                      <option value="MEETING_POINT">Specific Meeting Point Selection</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Other Included Items (comma separated)</label>
                  <textarea value={formData.included} onChange={e => setFormData({...formData, included: e.target.value})}
                    placeholder="Helmet, Tour Guide, Water Bottle" rows={2} className={`${inputCls} h-auto`} />
                </div>
                <div>
                  <label className={labelCls}>Key Highlights (comma separated)</label>
                  <textarea value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})}
                    placeholder="Watch the sunset, Private access" rows={2} className={`${inputCls} h-auto`} />
                </div>
              </div>
            </section>

            {/* 5. Publishing */}
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-luxury text-ink-muted border-b hairline pb-2">5 — Publishing</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-emerald-200 bg-emerald-50 p-4 flex flex-col gap-3">
                  <label className="text-[10px] uppercase tracking-luxury text-emerald-700">Active (Visible on site)</label>
                  <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
                </div>
                <div className="border hairline bg-surface-elevated p-4 flex flex-col gap-3">
                  <label className={labelCls}>Featured (Homepage)</label>
                  <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                </div>
                <div className="border hairline bg-surface-elevated p-4">
                  <label className={labelCls}>Display Sort Order</label>
                  <input type="number" value={formData.sortOrder}
                    onChange={e => setFormData({...formData, sortOrder: e.target.value})}
                    required className={inputCls} />
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3 pt-6 border-t hairline">
              <button type="button" onClick={() => { setIsDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }}
                className="px-6 py-2.5 border hairline text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 bg-foreground text-background px-8 py-2.5 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors disabled:opacity-50">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditDialogOpen ? "Save Changes" : "Publish Package"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
