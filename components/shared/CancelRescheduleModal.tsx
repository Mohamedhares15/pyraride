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
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Loader2, AlertTriangle } from "lucide-react";

interface CancelRescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    status: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    stable: { name: string };
    horse: { name: string };
  };
  mode: "cancel" | "reschedule";
}

export default function CancelRescheduleModal({
  open,
  onOpenChange,
  booking,
  mode,
}: CancelRescheduleModalProps) {
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const minDate = new Date().toISOString().split("T")[0];

  const handleCancel = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!newDate || !newStartTime || !newEndTime) {
      setError("Please select a new date and time");
      setIsSubmitting(false);
      return;
    }

    try {
      const newStartDateTime = new Date(`${newDate}T${newStartTime}`);
      const newEndDateTime = new Date(`${newDate}T${newEndTime}`);

      const response = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStartTime: newStartDateTime.toISOString(),
          newEndTime: newEndDateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reschedule booking");
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reschedule booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = mode === "cancel" ? handleCancel : handleReschedule;

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
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold">
              {mode === "cancel"
                ? "Booking Cancelled"
                : "Booking Rescheduled"}
            </h3>
            <p className="text-muted-foreground">
              {mode === "cancel"
                ? "Your booking has been cancelled successfully."
                : "Your booking has been rescheduled successfully."}
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
            {mode === "cancel" ? "Cancel Booking" : "Reschedule Booking"}
          </DialogTitle>
          <DialogDescription>
            {mode === "cancel"
              ? "Cancel your booking at " + booking.stable.name
              : "Change the date and time of your booking"}
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

          {/* Current Booking Info */}
          <Card className="p-4">
            <h4 className="mb-3 font-semibold">Current Booking Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(booking.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span>
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-muted-foreground">Horse: {booking.horse.name}</p>
                <p className="text-muted-foreground">
                  Stable: {booking.stable.name}
                </p>
              </div>
            </div>
          </Card>

          {mode === "cancel" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cancelReason">Reason for Cancellation (Optional)</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Why are you cancelling this booking?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {booking.status === "completed" && (
                <div className="flex items-start gap-3 rounded-md bg-orange-500/10 p-3 text-sm text-orange-400">
                  <AlertTriangle className="mt-0.5 h-5 w-5" />
                  <p>
                    This booking is already completed. Consider requesting a
                    refund instead.
                  </p>
                </div>
              )}
            </>
          )}

          {mode === "reschedule" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newDate">New Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="newDate"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={minDate}
                    className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newStartTime">New Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="newStartTime"
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newEndTime">New End Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="newEndTime"
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
              </div>

              {booking.status === "completed" && (
                <div className="flex items-start gap-3 rounded-md bg-orange-500/10 p-3 text-sm text-orange-400">
                  <AlertTriangle className="mt-0.5 h-5 w-5" />
                  <p>
                    Cannot reschedule a completed booking.
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
                (mode === "reschedule" &&
                  (!newDate || !newStartTime || !newEndTime))
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {mode === "cancel" ? "Confirm Cancellation" : "Confirm Reschedule"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

