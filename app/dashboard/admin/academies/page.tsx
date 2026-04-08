"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, XCircle, Plus, X, Camera } from "lucide-react";
import Image from "next/image";

export default function AdminAcademiesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchAdminAcademyData();
  }, []);

  const fetchAdminAcademyData = async () => {
    try {
      const res = await fetch("/api/admin/academies");
      if (!res.ok) throw new Error("Failed to fetch admin academy data");
      const d = await res.json();
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChangeApproval = async (requestId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this price change?`)) return;

    try {
      const res = await fetch(`/api/admin/academies/price-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchAdminAcademyData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to process request");
      }
    } catch (err) {
      alert("Error submitting request");
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Academy Management</h1>
          <p className="text-neutral-400">Oversee PyraRides training academies and approve price changes.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#D4AF37] text-black hover:bg-[#C49A2F] active:scale-95 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Academy
        </button>
      </div>

      {/* Price Change Requests (Pending) */}
      <CardSection title="Pending Price Changes" count={data.pendingRequests?.length || 0}>
        {!data.pendingRequests || data.pendingRequests.length === 0 ? (
          <p className="text-neutral-500 italic p-4 text-sm">No pending requests.</p>
        ) : (
          <div className="grid gap-4">
            {data.pendingRequests.map((req: any) => (
              <div key={req.id} className="p-5 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#D4AF37] font-semibold">{req.academy.name}</span>
                    <Badge variant="outline" className="text-xs uppercase tracking-widest text-neutral-400 border-white/10">Requested by {req.requestedBy.fullName}</Badge>
                  </div>
                  <p className="text-white mb-2">Change <span className="font-semibold">{req.program.name}</span> price</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-neutral-500 line-through">EGP {req.oldPrice}</span>
                    <span className="text-[#D4AF37] font-bold">EGP {req.newPrice}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">"{req.reason}"</p>
                  <p className="text-[10px] text-neutral-600 mt-1">{format(new Date(req.createdAt), 'PPp')}</p>
                </div>
                <div className="flex gap-2 items-start">
                   <button 
                     onClick={() => handlePriceChangeApproval(req.id, "approve")}
                     className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                   >
                     <CheckCircle className="w-4 h-4" /> Approve
                   </button>
                   <button 
                     onClick={() => handlePriceChangeApproval(req.id, "reject")}
                     className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                   >
                     <XCircle className="w-4 h-4" /> Reject
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardSection>

      {/* Academies List */}
      <CardSection title="Active Academies" count={data.academies?.length || 0}>
         <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
           {data.academies?.map((academy: any) => (
             <div key={academy.id} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
               <div className="relative h-32 w-full">
                 <Image src={academy.imageUrl || "/hero-bg.webp"} alt={academy.name} fill className="object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-4 left-4">
                   <h3 className="font-display text-xl text-white">{academy.name}</h3>
                   <p className="text-xs text-neutral-300">{academy.location}</p>
                 </div>
               </div>
               <div className="p-5">
                 <div className="flex justify-between items-center mb-4">
                   <div className="text-sm">
                     <p className="text-neutral-500 text-[10px] uppercase tracking-widest">Captain</p>
                     <p className="text-white">{academy.captain?.fullName || "Unassigned"}</p>
                   </div>
                   <Badge className={academy.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-neutral-800 text-neutral-400"}>
                     {academy.isActive ? "Active" : "Inactive"}
                   </Badge>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase tracking-widest">Programs</p>
                      <p className="text-white text-lg">{academy._count.programs}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase tracking-widest">Enrollments</p>
                      <p className="text-white text-lg">{academy._count.enrollments}</p>
                    </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
      </CardSection>

      {isCreateModalOpen && (
        <CreateAcademyModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchAdminAcademyData();
          }} 
        />
      )}
    </div>
  );
}

function CardSection({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-display text-white">{title}</h2>
        {count !== undefined && (
          <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function CreateAcademyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void; }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "saqqara",
    address: "",
    captainId: "",
    imageUrl: "",
    googleMapsUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users ? data.users.filter((u: any) => u.role !== "admin") : []);
        setLoadingUsers(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingUsers(false);
      });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(`${file.name} is too large (max 5MB)`);
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to process image.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      setIsUploading(false);
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Use custom location text if "other" is selected
    const finalLocation = formData.location === "other" && customLocation.trim() !== ""
      ? customLocation.trim()
      : formData.location;

    try {
      const res = await fetch("/api/admin/academies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, location: finalLocation }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create academy");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative p-6 my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-display text-white mb-6">Add New Academy</h2>
        
        {error && <div className="p-3 mb-6 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Academy Name</label>
            <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]" placeholder="e.g PyraRides Academy - Saqqara" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Description</label>
            <textarea required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] min-h-[80px]" placeholder="Brief description of this academy..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Region/Location</label>
              <select required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
                <option value="saqqara">Saqqara</option>
                <option value="nazlet">Nazlet</option>
                <option value="abousir">Abousir</option>
                <option value="fayoum">Fayoum</option>
                <option value="newcairo">New Cairo</option>
                <option value="other">Other (Custom)</option>
              </select>
              
              {formData.location === "other" && (
                <input required type="text" className="w-full bg-white/5 border border-[#D4AF37] rounded-lg p-3 text-white focus:outline-none mt-2 placeholder-neutral-500" placeholder="Type custom location..." value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} />
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Address</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]" placeholder="Physical address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Google Maps Link (Optional)</label>
            <input type="url" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]" placeholder="https://maps.google.com/..." value={formData.googleMapsUrl} onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })} />
            <p className="text-[10px] text-neutral-500 px-1 mt-1">This will display a clickable directions button on public pages and rider dashboards.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Academy Image</label>
            <div className="flex items-center gap-4">
              <label className="flex-shrink-0 cursor-pointer group">
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                <div className="h-20 w-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 group-hover:bg-white/10 group-hover:border-[#D4AF37] transition-all">
                  {isUploading ? <Loader2 className="h-6 w-6 text-[#D4AF37] animate-spin" /> : (
                    <>
                      <Camera className="h-6 w-6 text-neutral-400 group-hover:text-[#D4AF37] mb-1" />
                      <span className="text-[10px] text-neutral-400 group-hover:text-[#D4AF37]">{formData.imageUrl ? "Change" : "Upload"}</span>
                    </>
                  )}
                </div>
              </label>
              {formData.imageUrl && (
                <div className="h-20 flex-1 relative rounded-lg overflow-hidden border border-white/10">
                  <img src={formData.imageUrl} alt="Academy preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold px-1">Assign Captain</label>
            <select required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]" value={formData.captainId} onChange={(e) => setFormData({ ...formData, captainId: e.target.value })}>
              <option value="" disabled>Select a user to assign as Captain</option>
              {loadingUsers ? <option value="" disabled>Loading users...</option> : users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email}) - {u.role}</option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-500 px-1 mt-1">This user will automatically be promoted to the 'captain' role upon saving.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-[#D4AF37] px-6 py-2.5 rounded-lg text-black font-semibold disabled:opacity-50 hover:bg-[#C49A2F] transition-colors flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Academy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
