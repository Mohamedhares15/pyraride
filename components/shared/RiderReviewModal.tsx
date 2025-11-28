"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import StarRating from "./StarRating";
import { Star, Loader2, CheckCircle, X, TrendingUp } from "lucide-react";

interface RiderReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  riderId: string;
  riderName: string;
  onReviewSubmitted?: () => void;
}

export default function RiderReviewModal({
  open,
  onOpenChange,
  bookingId,
  riderId,
  riderName,
  onReviewSubmitted,
}: RiderReviewModalProps) {
  const router = useRouter();
  const [ridingSkillLevel, setRidingSkillLevel] = useState(5);
  const [behaviorRating, setBehaviorRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!behaviorRating) {
      setError("Please rate the rider's behavior");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/rider-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          riderId,
          ridingSkillLevel,
          behaviorRating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Success! Show toast with leaderboard info if available
      if (data.leaderboard) {
        const { pointsChange, newRiderPoints, riderTier } = data.leaderboard;
        // Store leaderboard info for display
        (window as any).lastLeaderboardUpdate = {
          pointsChange,
          newRiderPoints,
          riderTier,
        };
      }
      setShowSuccessToast(true);
      
      setTimeout(() => {
        onOpenChange(false);
        onReviewSubmitted?.();
        router.refresh();
        
        // Reset form
        setRidingSkillLevel(5);
        setBehaviorRating(0);
        setComment("");
        setShowSuccessToast(false);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Rider</DialogTitle>
          <DialogDescription>
            Help us maintain quality by rating {riderName}'s riding skills and behavior
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {/* Riding Skill Level (1-10) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Riding Skill Level (1-10) *
            </Label>
            <p className="text-xs text-muted-foreground">
              Rate for future ranking system. 1 = Beginner, 10 = Expert
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={ridingSkillLevel}
                onChange={(e) => setRidingSkillLevel(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center justify-center w-16 h-10 rounded-md bg-primary text-primary-foreground font-bold text-lg">
                {ridingSkillLevel}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>

          {/* Behavior Rating (1-5 stars) */}
          <div className="space-y-3">
            <Label>Behavior & Conduct (1-5 stars) *</Label>
            <p className="text-xs text-muted-foreground">
              Rate kindness, respectfulness, and overall conduct
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{riderName}</span>
              </div>
              <StarRating
                rating={behaviorRating}
                onRatingChange={setBehaviorRating}
              />
            </div>
          </div>

          {/* Comment (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share any specific observations about this rider's behavior or riding skills..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This helps admins identify problematic riders or exceptional ones
            </p>
          </div>

          {/* Submit Buttons */}
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
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !behaviorRating}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-[10000] max-w-md w-full shadow-2xl rounded-lg border-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-4 flex items-start gap-4"
          >
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">
                Rider Review Submitted! ✅
              </h4>
              <p className="text-sm text-muted-foreground">
                Thank you for helping us maintain quality!
                {(window as any).lastLeaderboardUpdate && (
                  <span className="block mt-1 font-medium text-green-700 dark:text-green-300">
                    Leaderboard: {(window as any).lastLeaderboardUpdate.pointsChange > 0 ? "+" : ""}
                    {(window as any).lastLeaderboardUpdate.pointsChange} points
                    (Total: {(window as any).lastLeaderboardUpdate.newRiderPoints} - {(window as any).lastLeaderboardUpdate.riderTier})
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

