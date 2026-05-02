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
import { Slider } from "@/components/ui/slider";
import StarRating from "./StarRating";
import { Loader2, CheckCircle, X, User, Trophy } from "lucide-react";

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
    const [ridingSkillLevel, setRidingSkillLevel] = useState([5]); // Default 5
    const [behaviorRating, setBehaviorRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [pointsEarned, setPointsEarned] = useState<number | null>(null);

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
                    ridingSkillLevel: ridingSkillLevel[0],
                    behaviorRating,
                    comment,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            // Success! Show toast and points
            setPointsEarned(data.leaderboard?.pointsChange || 0);
            setShowSuccessToast(true);

            setTimeout(() => {
                onOpenChange(false);
                onReviewSubmitted?.();
                router.refresh();

                // Reset form
                setRidingSkillLevel([5]);
                setBehaviorRating(0);
                setComment("");
                setShowSuccessToast(false);
                setPointsEarned(null);
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Review Rider: {riderName}</DialogTitle>
                    <DialogDescription>
                        Rate the rider's performance and behavior. This affects their leaderboard ranking.
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

                    {/* Riding Skill Level (Slider) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Riding Skill Level (1-10)</Label>
                            <span className="font-bold text-primary text-lg">{ridingSkillLevel[0]}</span>
                        </div>
                        <Slider
                            value={ridingSkillLevel}
                            onValueChange={setRidingSkillLevel}
                            min={1}
                            max={10}
                            step={1}
                            className="py-4"
                        />
                        <p className="text-xs text-muted-foreground">
                            1 = Beginner, 5 = Intermediate, 10 = Expert. This score updates their rank.
                        </p>
                    </div>

                    {/* Behavior Rating (Stars) */}
                    <div className="space-y-3">
                        <Label>Behavior Rating *</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{riderName}</span>
                            </div>
                            <StarRating
                                rating={behaviorRating}
                                onRatingChange={setBehaviorRating}
                            />
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comments (Optional)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Any specific feedback about this rider?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
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
                                Review Submitted! ⭐
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Rider updated successfully.
                            </p>
                            {pointsEarned !== null && (
                                <div className="mt-2 flex items-center gap-2 text-amber-500 font-bold">
                                    <Trophy className="h-4 w-4" />
                                    <span>{pointsEarned > 0 ? "+" : ""}{pointsEarned} Rank Points</span>
                                </div>
                            )}
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
