"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Check, X, AlertCircle, DollarSign, FileText, Images } from "lucide-react";

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
      owner: {
        email: string;
        fullName: string | null;
      };
    };
  };
  reviewer: {
    email: string;
    fullName: string | null;
  } | null;
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

    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchChangeRequests();
  }, [session, status, router]);

  async function fetchChangeRequests() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/horse-changes?status=pending");
      if (!response.ok) {
        throw new Error("Failed to fetch change requests");
      }
      const data = await response.json();
      setChangeRequests(data.changeRequests || []);
    } catch (err) {
      console.error("Error fetching change requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load change requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/horse-changes/${requestId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve change request");
      }

      // Remove approved request from list
      setChangeRequests((prev) => prev.filter((req) => req.id !== requestId));
      alert("Change request approved successfully!");
    } catch (err) {
      console.error("Error approving change request:", err);
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

      // Remove rejected request from list
      setChangeRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id));
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
      alert("Change request rejected successfully!");
    } catch (err) {
      console.error("Error rejecting change request:", err);
      alert(err instanceof Error ? err.message : "Failed to reject change request");
    } finally {
      setIsProcessing(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
            Horse Change Requests
          </h1>
          <p className="text-muted-foreground">
            Review and approve or reject changes to horse prices and descriptions
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {changeRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Check className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Pending Requests</h3>
              <p className="text-muted-foreground">
                All horse change requests have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {changeRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">
                          {request.horse.name} - {request.horse.stable.name}
                        </CardTitle>
                        <CardDescription>
                          Requested by {request.horse.stable.owner.fullName || request.horse.stable.owner.email}
                        </CardDescription>
                        <CardDescription>
                          Requested on {formatDate(request.requestedAt)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        Pending Approval
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current vs Proposed Changes */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Current Values */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-muted-foreground">Current Values</h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Price per Hour</Label>
                            <p className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4" />
                              {request.horse.pricePerHour ? `$${Number(request.horse.pricePerHour).toFixed(2)}` : "Not set"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs">Description</Label>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {request.horse.description}
                            </p>
                          </div>
                          {request.horse.imageUrls.length > 0 && (
                            <div>
                              <Label className="text-xs">Current Images</Label>
                              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Images className="h-4 w-4" />
                                {request.horse.imageUrls.length} image(s)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Proposed Changes */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-primary">Proposed Changes</h3>
                        <div className="space-y-3">
                          {request.proposedPricePerHour !== null && (
                            <div>
                              <Label className="text-xs">New Price per Hour</Label>
                              <p className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="h-4 w-4" />
                                ${Number(request.proposedPricePerHour).toFixed(2)}
                              </p>
                            </div>
                          )}
                          {request.proposedDescription && (
                            <div>
                              <Label className="text-xs">New Description</Label>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {request.proposedDescription}
                              </p>
                            </div>
                          )}
                          {request.proposedImageUrls.length > 0 && (
                            <div>
                              <Label className="text-xs">New Images</Label>
                              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Images className="h-4 w-4" />
                                {request.proposedImageUrls.length} image(s)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 border-t pt-4">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setRejectDialogOpen(true);
                        }}
                        disabled={isProcessing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Change Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this change request. This will be visible to the stable owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

