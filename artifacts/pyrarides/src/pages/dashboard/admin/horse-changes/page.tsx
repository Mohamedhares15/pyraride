"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Check, X, AlertCircle, DollarSign, FileText, Images, ArrowLeft } from "lucide-react";
import { Link } from 'wouter';

interface ChangeRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  proposedName: string | null;
  proposedDescription: string | null;
  proposedPricePerHour: number | null;
  proposedImageUrls: string[];
  rejectionReason: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  horse: {
    id: string;
    name: string;
    description: string;
    pricePerHour: number | null;
    imageUrls: string[];
    stable: {
      id: string;
      name: string;
      owner: { email: string; fullName: string | null };
    };
  };
  reviewer: { email: string; fullName: string | null } | null;
}

export default function HorseChangesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchChangeRequests();
  }, [session, status, router]);

  async function fetchChangeRequests() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/horse-changes?status=pending");
      if (!response.ok) throw new Error("Failed to fetch change requests");
      const data = await response.json();
      setChangeRequests(data.changeRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load change requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/horse-changes/${requestId}/approve`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve change request");
      }
      setChangeRequests((prev) => prev.filter((req) => req.id !== requestId));
      alert("Change request approved successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve change request");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!selectedRequest) return;
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/horse-changes/${selectedRequest.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason || "Change request rejected by admin" }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject change request");
      }
      setChangeRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id));
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
      alert("Change request rejected successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject change request");
    } finally {
      setIsProcessing(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b hairline bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-5">
            <Link href="/dashboard/analytics">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-luxury text-ink-muted hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </button>
            </Link>
          </div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Admin</p>
          <h1 className="font-display text-4xl font-light">Horse Change Requests</h1>
          <p className="text-ink-soft text-sm mt-2">Review and approve or reject changes to horse prices and descriptions</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {changeRequests.length === 0 ? (
          <div className="border hairline bg-surface py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center border hairline bg-surface-elevated mx-auto mb-4">
              <Check className="h-6 w-6 text-foreground opacity-30" />
            </div>
            <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-2">All Clear</p>
            <p className="text-sm text-ink-soft">No pending horse change requests.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {changeRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="border hairline bg-surface overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between p-6 border-b hairline">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {request.horse.name} — {request.horse.stable.name}
                    </h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Requested by {request.horse.stable.owner?.fullName || request.horse.stable.owner?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-ink-muted">{formatDate(request.requestedAt)}</p>
                  </div>
                  <span className="border border-amber-300 bg-amber-50 text-amber-700 text-[10px] uppercase tracking-luxury px-2.5 py-1">
                    Pending
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Current vs Proposed */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="border hairline bg-surface-elevated p-5 space-y-4">
                      <p className="text-[10px] uppercase tracking-luxury text-ink-muted">Current Values</p>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-[10px] uppercase tracking-luxury text-ink-muted">Price per Hour</Label>
                          <p className="text-sm text-foreground mt-1 flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 opacity-40" />
                            {request.horse.pricePerHour ? `EGP ${Number(request.horse.pricePerHour).toFixed(2)}` : "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-luxury text-ink-muted">Description</Label>
                          <p className="text-sm text-ink-soft mt-1 line-clamp-3">{request.horse.description}</p>
                        </div>
                        {request.horse.imageUrls.length > 0 && (
                          <div>
                            <Label className="text-[10px] uppercase tracking-luxury text-ink-muted">Images</Label>
                            <p className="text-sm text-ink-soft mt-1 flex items-center gap-1.5">
                              <Images className="h-3.5 w-3.5" />
                              {request.horse.imageUrls.length} image(s)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border border-emerald-200 bg-emerald-50 p-5 space-y-4">
                      <p className="text-[10px] uppercase tracking-luxury text-emerald-700">Proposed Changes</p>
                      <div className="space-y-3">
                        {request.proposedPricePerHour !== null && (
                          <div>
                            <Label className="text-[10px] uppercase tracking-luxury text-emerald-600">New Price per Hour</Label>
                            <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                              EGP {Number(request.proposedPricePerHour).toFixed(2)}
                            </p>
                          </div>
                        )}
                        {request.proposedDescription && (
                          <div>
                            <Label className="text-[10px] uppercase tracking-luxury text-emerald-600">New Description</Label>
                            <p className="text-sm text-foreground mt-1 line-clamp-3">{request.proposedDescription}</p>
                          </div>
                        )}
                        {request.proposedImageUrls.length > 0 && (
                          <div>
                            <Label className="text-[10px] uppercase tracking-luxury text-emerald-600">New Images</Label>
                            <p className="text-sm text-foreground mt-1 flex items-center gap-1.5">
                              <Images className="h-3.5 w-3.5 text-emerald-600" />
                              {request.proposedImageUrls.length} image(s)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={isProcessing}
                      className="flex flex-1 items-center justify-center gap-2 bg-emerald-600 text-white py-3 text-[11px] uppercase tracking-luxury hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => { setSelectedRequest(request); setRejectDialogOpen(true); }}
                      disabled={isProcessing}
                      className="flex flex-1 items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 py-3 text-[11px] uppercase tracking-luxury hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-background border hairline text-foreground">
          <DialogHeader>
            <p className="text-[11px] uppercase tracking-luxury text-ink-muted mb-2">Action Required</p>
            <DialogTitle className="font-display text-2xl font-light">Reject Change Request</DialogTitle>
            <DialogDescription className="text-ink-soft text-sm mt-2">
              Provide a reason for rejecting this change. It will be visible to the stable owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-luxury text-ink-muted">Rejection Reason</Label>
              <Textarea
                placeholder="Enter reason for rejection…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="bg-surface border hairline text-foreground rounded-none focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4 border-t hairline">
            <button
              onClick={() => { setRejectDialogOpen(false); setRejectionReason(""); setSelectedRequest(null); }}
              className="px-6 py-2.5 border hairline text-[11px] uppercase tracking-luxury text-foreground hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 border border-red-200 bg-red-50 text-red-600 text-[11px] uppercase tracking-luxury hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject Request
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
