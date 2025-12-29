"use client";

import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/StarRating";

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
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
        {/* Review Images */}
        {review.reviewMedias && review.reviewMedias.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {review.reviewMedias.map((media, idx) => (
              <div key={idx} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                <img
                  src={media.url}
                  alt={`Review image ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

