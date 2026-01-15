"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CldUploadButton } from "next-cloudinary";
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
import { Star, Loader2, CheckCircle, X, Camera } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  stableName: string;
  horseName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  open,
  onOpenChange,
  bookingId,
  stableName,
  horseName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const router = useRouter();
  const [stableRating, setStableRating] = useState(0);
  const [horseRating, setHorseRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!stableRating || !horseRating) {
      setError("Please rate both the stable and the horse");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          stableRating,
          horseRating,
          comment,
          photos,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Success! Show toast and auto-close
      setShowSuccessToast(true);

      setTimeout(() => {
        onOpenChange(false);
        onReviewSubmitted?.();
        router.refresh();

        // Reset form
        setStableRating(0);
        setHorseRating(0);
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
          <DialogTitle>Submit Your Review</DialogTitle>
          <DialogDescription>
            Help other riders by sharing your experience at {stableName}
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

          {/* Stable Rating */}
          <div className="space-y-3">
            <Label>How would you rate the stable? *</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{stableName}</span>
              </div>
              <StarRating
                rating={stableRating}
                onRatingChange={setStableRating}
              />
            </div>
          </div>

          {/* Horse Rating */}
          <div className="space-y-3">
            <Label>How would you rate {horseName}? *</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{horseName}</span>
              </div>
              <StarRating
                rating={horseRating}
                onRatingChange={setHorseRating}
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Experience (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with the stable and horse..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Photo Upload with Cloudinary */}
          <div className="space-y-3">
            <Label>Add Photos (Optional)</Label>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border group">
                  <img src={photo} alt="Review" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Cloudinary Upload Button (max 5 photos) */}
              {photos.length < 5 && (
                <CldUploadButton
                  uploadPreset="pyraride_reviews"
                  options={{
                    maxFiles: 5 - photos.length,
                    maxFileSize: 10000000, // 10MB
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
                    sources: ['local'], // ONLY gallery/file selection (no camera, no drag-drop)
                    multiple: true,
                  }}
                  onSuccess={(result: any) => {
                    if (result?.info?.secure_url) {
                      setPhotos([...photos, result.info.secure_url]);
                    }
                  }}
                  className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground text-center px-1">
                    {photos.length === 0 ? 'Add Photo' : 'Add More'}
                  </span>
                </CldUploadButton>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              📸 Max 5 photos • Up to 10MB each • JPG, PNG, WebP supported
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
              disabled={isSubmitting || !stableRating || !horseRating}
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
                Thank you for sharing your experience!
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

