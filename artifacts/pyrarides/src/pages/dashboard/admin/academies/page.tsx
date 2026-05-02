"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle, CheckCircle, XCircle, Plus, X, Camera, BookOpen } from "lucide-react";
import NextImage from "@/shims/next-image";

export default function AdminAcademiesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addProgramAcademyId, setAddProgramAcademyId] = useState<string | null>(null);

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
    } catch {
      alert("Error submitting request");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center gap-3 border border-red-200 bg-red-50">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Admin</p>
          <h1 className="font-display text-3xl font-light">Academy Management</h1>
          <p className="text-sm text-ink-soft mt-1">Oversee PyraRides training academies and approve price changes.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Academy
        </button>
      </div>

      {/* Price Change Requests */}
      <CardSection title="Pending Price Changes" count={data.pendingRequests?.length || 0}>
        {!data.pendingRequests || data.pendingRequests.length === 0 ? (
          <p className="text-ink-muted italic text-sm p-4">No pending requests.</p>
        ) : (
          <div className="divide-y divide-foreground/8">
            {data.pendingRequests.map((req: any) => (
              <div key={req.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">{req.academy.name}</span>
                    <span className="text-[10px] uppercase tracking-luxury text-ink-muted border hairline px-2 py-0.5">
                      Requested by {req.requestedBy.fullName}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">
                    Change <span className="font-medium">{req.program.name}</span> price
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-ink-muted line-through">EGP {req.oldPrice}</span>
                    <span className="font-display text-lg text-foreground">EGP {req.newPrice}</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-2 italic">"{req.reason}"</p>
                  <p className="text-[10px] text-ink-muted mt-1">{format(new Date(req.createdAt), "PPp")}</p>
                </div>
                <div className="flex gap-2 items-start">
                  <button
                    onClick={() => handlePriceChangeApproval(req.id, "approve")}
                    className="flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-xs uppercase tracking-luxury hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handlePriceChangeApproval(req.id, "reject")}
                    className="flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-xs uppercase tracking-luxury hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardSection>

      {/* Academies List */}
      <CardSection title="Active Academies" count={data.academies?.length || 0}>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
          {data.academies?.map((academy: any) => (
            <div key={academy.id} className="border hairline bg-surface overflow-hidden">
              <div className="relative h-32 w-full">
                <NextImage src={academy.imageUrl || "/hero-bg.webp"} alt={academy.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-display text-xl text-background">{academy.name}</h3>
                  <p className="text-xs text-background/70">{academy.location}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-ink-muted">Captain</p>
                    <p className="text-foreground text-sm">{academy.captain?.fullName || "Unassigned"}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-luxury px-2.5 py-1 border ${
                    academy.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-foreground/20 text-ink-muted"
                  }`}>
                    {academy.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t hairline pt-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-ink-muted">Programs</p>
                    <p className="font-display text-xl font-light">{academy._count.programs}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-ink-muted">Enrollments</p>
                    <p className="font-display text-xl font-light">{academy._count.enrollments}</p>
                  </div>
                </div>

                <button
                  onClick={() => setAddProgramAcademyId(academy.id)}
                  className="w-full border hairline text-foreground py-2.5 text-[11px] uppercase tracking-luxury hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Add Program
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardSection>

      {isCreateModalOpen && (
        <CreateAcademyModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => { setIsCreateModalOpen(false); fetchAdminAcademyData(); }}
        />
      )}

      {addProgramAcademyId && (
        <AddProgramModal
          academyId={addProgramAcademyId}
          onClose={() => setAddProgramAcademyId(null)}
          onSuccess={() => { setAddProgramAcademyId(null); fetchAdminAcademyData(); }}
        />
      )}
    </div>
  );
}

function CardSection({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="border hairline bg-surface">
      <div className="flex items-center gap-3 px-6 py-4 border-b hairline">
        <p className="text-[11px] uppercase tracking-luxury text-ink-muted">{title}</p>
        {count !== undefined && (
          <span className="border hairline bg-surface-elevated text-foreground px-2 py-0.5 text-xs">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function CreateAcademyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [formData, setFormData] = useState({
    name: "", description: "", location: "saqqara", address: "",
    captainId: "", imageUrl: "", googleMapsUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users ? data.users.filter((u: any) => u.role !== "admin") : []);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError(`${file.name} is too large (max 5MB)`); return; }
    setIsUploading(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        setIsUploading(false);
      };
      reader.onerror = () => { setError("Failed to process image."); setIsUploading(false); };
      reader.readAsDataURL(file);
    } catch { setError("Failed to upload image."); setIsUploading(false); }
    finally { e.target.value = ""; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const finalLocation = formData.location === "other" && customLocation.trim()
      ? customLocation.trim() : formData.location;
    try {
      const res = await fetch("/api/admin/academies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, location: finalLocation }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to create academy"); }
      onSuccess();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full bg-surface border hairline text-foreground p-3 focus:outline-none focus:ring-1 focus:ring-foreground text-sm";
  const labelCls = "text-[10px] uppercase tracking-luxury text-ink-muted block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-background border hairline w-full max-w-xl max-h-[90vh] overflow-y-auto relative p-8 my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-ink-muted hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-2">Admin</p>
        <h2 className="font-display text-2xl font-light mb-6">Add New Academy</h2>

        {error && <div className="p-3 mb-5 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Academy Name</label>
            <input required type="text" className={inputCls} placeholder="e.g PyraRides Academy - Saqqara"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea required className={`${inputCls} min-h-[80px]`} placeholder="Brief description of this academy..."
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Region / Location</label>
              <select required className={inputCls} value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
                <option value="saqqara">Saqqara</option>
                <option value="nazlet">Nazlet</option>
                <option value="abousir">Abousir</option>
                <option value="fayoum">Fayoum</option>
                <option value="newcairo">New Cairo</option>
                <option value="other">Other (Custom)</option>
              </select>
              {formData.location === "other" && (
                <input required type="text" className={`${inputCls} mt-2`} placeholder="Type custom location..."
                  value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} />
              )}
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input required type="text" className={inputCls} placeholder="Physical address"
                value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Google Maps Link (Optional)</label>
            <input type="url" className={inputCls} placeholder="https://maps.google.com/..."
              value={formData.googleMapsUrl} onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })} />
            <p className="text-[10px] text-ink-muted mt-1">Displays a clickable directions button on public pages.</p>
          </div>

          <div>
            <label className={labelCls}>Academy Image</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                  onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                <div className="h-20 w-20 flex flex-col items-center justify-center border hairline bg-surface hover:bg-surface-elevated transition-colors">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-foreground opacity-40" /> : (
                    <>
                      <Camera className="h-6 w-6 text-foreground opacity-30 mb-1" />
                      <span className="text-[10px] text-ink-muted">{formData.imageUrl ? "Change" : "Upload"}</span>
                    </>
                  )}
                </div>
              </label>
              {formData.imageUrl && (
                <div className="h-20 flex-1 relative border hairline overflow-hidden">
                  <img src={formData.imageUrl} alt="Academy preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>Assign Captain</label>
            <select required className={inputCls} value={formData.captainId}
              onChange={(e) => setFormData({ ...formData, captainId: e.target.value })}>
              <option value="" disabled>Select a user to assign as Captain</option>
              {loadingUsers ? <option value="" disabled>Loading users…</option> : users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email}) — {u.role}</option>
              ))}
            </select>
            <p className="text-[10px] text-ink-muted mt-1">This user will be promoted to the 'captain' role upon saving.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t hairline">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 border hairline text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Academy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddProgramModal({ academyId, onClose, onSuccess }: { academyId: string; onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", skillLevel: "BEGINNER", price: "",
    totalSessions: "", sessionDuration: "1", validityDays: "60",
    startTime: "10:00", availableDays: [] as string[],
  });

  const allDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.availableDays.length === 0) { setError("Please select at least one available day."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/academies/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, academyId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to create program"); }
      onSuccess();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full bg-surface border hairline text-foreground p-3 focus:outline-none focus:ring-1 focus:ring-foreground text-sm";
  const labelCls = "text-[10px] uppercase tracking-luxury text-ink-muted block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-background border hairline w-full max-w-xl max-h-[90vh] overflow-y-auto relative p-8 my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-ink-muted hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-2">Academy</p>
        <h2 className="font-display text-2xl font-light mb-6">Add Training Program</h2>

        {error && <div className="p-3 mb-5 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Program Name</label>
            <input required type="text" className={inputCls} placeholder="e.g. Beginner Foundations"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea required className={`${inputCls} min-h-[60px]`} placeholder="What trainees will learn..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Skill Level</label>
              <select className={inputCls} value={form.skillLevel}
                onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (EGP)</label>
              <input required type="number" min="1" className={inputCls} placeholder="e.g. 2500"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Total Sessions</label>
              <input required type="number" min="1" className={inputCls} placeholder="e.g. 8"
                value={form.totalSessions} onChange={(e) => setForm({ ...form, totalSessions: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Duration (hrs)</label>
              <input required type="number" min="0.5" step="0.5" className={inputCls} placeholder="1"
                value={form.sessionDuration} onChange={(e) => setForm({ ...form, sessionDuration: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Validity (days)</label>
              <input required type="number" min="7" className={inputCls} placeholder="60"
                value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Start Time</label>
            <input required type="time" className={inputCls}
              value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Available Days</label>
            <div className="flex flex-wrap gap-2">
              {allDays.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-luxury transition-colors ${
                    form.availableDays.includes(day)
                      ? "bg-foreground text-background"
                      : "border hairline text-ink-muted hover:text-foreground"
                  }`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t hairline">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 border hairline text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-[11px] uppercase tracking-luxury hover:bg-foreground/90 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
