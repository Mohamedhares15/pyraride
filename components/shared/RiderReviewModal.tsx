"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trophy } from "lucide-react";
import { toast } from "sonner";

interface RiderReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    rider: {
      id: string;
      fullName: string | null;
      email: string;
    };
    horse: {
      name: string;
    };
  };
  onSuccess: () => void;
}

export default function RiderReviewModal({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: RiderReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillLevel, setSkillLevel] = useState("5");
  const [behaviorRating, setBehaviorRating] = useState("5");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/rider-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          riderId: booking.rider.id,
          ridingSkillLevel: parseInt(skillLevel),
          behaviorRating: parseInt(behaviorRating),
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Review Rider</DialogTitle>
          <DialogDescription className="text-white/60">
            Rate {booking.rider.fullName || booking.rider.email}'s performance on {booking.horse.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-white">Riding Skill Level (1-10)</Label>
            <div className="flex items-center gap-4">
              <Trophy className="h-5 w-5 text-amber-400" />
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} - {i < 3 ? "Beginner" : i < 7 ? "Intermediate" : "Advanced"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-white/50">
              This affects the rider's leaderboard ranking.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Behavior Rating (1-5)</Label>
            <div className="flex items-center gap-4">
              <Star className="h-5 w-5 text-yellow-400" />
              <Select value={behaviorRating} onValueChange={setBehaviorRating}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                  {[...Array(5)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} Stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Comments (Optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional feedback..."
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
