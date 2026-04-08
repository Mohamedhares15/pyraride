"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function AdminAcademiesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <h1 className="text-3xl font-display text-white mb-2">Academy Management</h1>
        <p className="text-neutral-400">Oversee PyraRides training academies and approve price changes.</p>
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
