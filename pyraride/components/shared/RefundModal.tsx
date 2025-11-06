"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, DollarSign, AlertTriangle } from "lucide-react";

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  totalPrice: number;
  bookingStatus: string;
  refundStatus?: string | null;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function RefundModal({
  open,
  onOpenChange,
  bookingId,
  totalPrice,
  bookingStatus,
  refundStatus,
  isOwner,
  isAdmin,
}: RefundModalProps) {
  const [reason, setReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(totalPrice.toString());
  const [action, setAction] = useState<"request" | "reject" | "process">("request");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          refundAmount: action === "process" ? parseFloat(refundAmount) : undefined,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process refund");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which actions are available
  const canRequest = bookingStatus === "confirmed" || bookingStatus === "completed";
  const canProcess = (isOwner || isAdmin) && refundStatus === "requested";
  const canReject = (isOwner || isAdmin) && refundStatus === "requested";

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold">
              {action === "process"
                ? "Refund Processed!"
                : action === "request"
                  ? "Refund Requested!"
                  : "Refund Rejected"}
            </h3>
            <p className="text-muted-foreground">
              {action === "process"
                ? "The refund has been processed and will appear in the customer's account within 5-10 business days."
                : action === "request"
                  ? "Your refund request has been submitted and is being reviewed."
                  : "The refund request has been rejected."}
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {action === "request"
              ? "Request Refund"
              : action === "process"
                ? "Process Refund"
                : "Reject Refund Request"}
          </DialogTitle>
          <DialogDescription>
            {action === "request"
              ? "Request a refund for this booking"
              : action === "process"
                ? "Process the refund request and issue payment"
                : "Reject the refund request"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {/* Booking Info */}
          <Card className="p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-semibold">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-semibold capitalize">{bookingStatus}</span>
              </div>
              {refundStatus && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Status:</span>
                  <span className="font-semibold capitalize">{refundStatus}</span>
                </div>
              )}
            </div>
          </Card>

          {action === "request" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Refund *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please explain why you need this refund..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {!canRequest && (
                <div className="flex items-start gap-3 rounded-md bg-orange-500/10 p-3 text-sm text-orange-400">
                  <AlertTriangle className="mt-0.5 h-5 w-5" />
                  <p>
                    Refunds can only be requested for confirmed or completed bookings.
                  </p>
                </div>
              )}
            </>
          )}

          {action === "process" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="refundAmount">
                  Refund Amount (USD) *
                </Label>
                <Input
                  id="refundAmount"
                  type="number"
                  min="0"
                  max={totalPrice}
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max: $${totalPrice.toFixed(2)}`}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can issue a partial or full refund (max: ${totalPrice.toFixed(2)})
                </p>
              </div>

              {!canProcess && (
                <div className="flex items-start gap-3 rounded-md bg-orange-500/10 p-3 text-sm text-orange-400">
                  <AlertTriangle className="mt-0.5 h-5 w-5" />
                  <p>
                    Only owners and admins can process refund requests.
                  </p>
                </div>
              )}
            </>
          )}

          {action === "reject" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rejectReason">
                  Rejection Reason (Optional)
                </Label>
                <Textarea
                  id="rejectReason"
                  placeholder="Optionally explain why this refund request is being rejected..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {!canReject && (
                <div className="flex items-start gap-3 rounded-md bg-orange-500/10 p-3 text-sm text-orange-400">
                  <AlertTriangle className="mt-0.5 h-5 w-5" />
                  <p>
                    Only owners and admins can reject refund requests.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (action === "request" && !reason) ||
                (action === "process" && !refundAmount) ||
                (action === "request" && !canRequest) ||
                (action === "process" && !canProcess) ||
                (action === "reject" && !canReject)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === "request"
                    ? "Request Refund"
                    : action === "process"
                      ? "Process Refund"
                      : "Reject Request"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

