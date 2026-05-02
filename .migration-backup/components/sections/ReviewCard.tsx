"use client";

import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/StarRating";
import ImageViewer from "@/components/shared/ImageViewer";
import { useState } from "react";

interface ReviewCardProps {
  review: {
    id: string;
    stableRating: number;
    horseRating: number;
    comment: string;
    createdAt: string;
    rider: {
      fullName: string | null;
      email: string;
    };
    reviewMedias?: {
      url: string;
    }[];
  };
  index: number;
}

export default function ReviewCard({ review, index }: ReviewCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter out broken/invalid URLs
  const validMedias = review.reviewMedias?.filter((media, originalIdx) => {
    // Check if URL is valid (not UUID, not blob, has proper format)
    const isValidUrl = media.url &&
      media.url.startsWith('http') &&
      !media.url.includes('blob:') &&
      !brokenImages.has(originalIdx);
    return isValidUrl;
  }) || [];

  const imageUrls = validMedias.map((media) => media.url);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const handleImageError = (originalIdx: number) => {
    setBrokenImages(prev => new Set(prev).add(originalIdx));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">
                  {review.rider.fullName || "Anonymous Rider"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>

          {/* Ratings */}
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Stable Rating
              </p>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={review.stableRating}
                  onRatingChange={() => { }} // Read-only
                  interactive={false}
                />
                <Badge variant="outline">{review.stableRating}/5</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Horse Rating
              </p>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={review.horseRating}
                  onRatingChange={() => { }} // Read-only
                  interactive={false}
                />
                <Badge variant="outline">{review.horseRating}/5</Badge>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm leading-relaxed text-foreground">
                {review.comment}
              </p>
            </div>
          )}

          {/* Review Images - Only show valid images */}
          {validMedias.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {review.reviewMedias?.map((media, originalIdx) => {
                if (brokenImages.has(originalIdx) || !media.url.startsWith('http') || media.url.includes('blob:')) {
                  return null; // Skip rendering broken or invalid images
                }
                const validMediaIndex = validMedias.findIndex(vm => vm.url === media.url);
                if (validMediaIndex === -1) return null; // Should not happen if validMedias is correctly filtered

                return (
                  <button
                    key={originalIdx} // Use originalIdx for key as it's stable
                    onClick={() => handleImageClick(validMediaIndex)} // Pass index within validMedias
                    className="group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 border-border transition-all duration-300 hover:border-primary hover:scale-105 hover:shadow-lg cursor-pointer"
                  >
                    <img
                      src={media.url}
                      alt={`Review image ${originalIdx + 1}`}
                      onError={() => handleImageError(originalIdx)} // Pass originalIdx to mark as broken
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                        View
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Glassmorphism Image Viewer - Only if valid images exist */}
      {imageUrls.length > 0 && (
        <ImageViewer
          images={imageUrls}
          initialIndex={selectedImageIndex}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
}
