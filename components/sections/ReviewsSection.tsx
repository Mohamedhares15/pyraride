"use client";

import { motion } from "framer-motion";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReviewCard from "./ReviewCard";
import StarRating from "@/components/shared/StarRating";

interface Review {
  id: string;
  stableRating: number;
  horseRating: number;
  comment: string;
  createdAt: string;
  rider: {
    fullName: string | null;
    email: string;
  };
  reviewMedias: {
    url: string;
  }[];
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageStableRating: number;
  averageHorseRating: number;
  totalReviews: number;
}

export default function ReviewsSection({
  reviews,
  averageStableRating,
  averageHorseRating,
  totalReviews,
}: ReviewsSectionProps) {
  if (totalReviews === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <div className="mb-4 text-6xl">⭐</div>
        <h3 className="mb-2 font-display text-2xl font-bold">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          This stable doesn&apos;t have any reviews yet. Be the first to leave a review after your ride!
        </p>
      </div>
    );
  }

  // Calculate rating distribution
  const stableRatings = reviews.map((r) => r.stableRating);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: stableRatings.filter((rating) => rating === stars).length,
  }));

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Stable Rating</p>
              <p className="text-3xl font-bold">{averageStableRating.toFixed(1)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-6 w-6 text-primary fill-yellow-400" />
            </div>
          </div>
          <div className="mt-3">
            <StarRating
              rating={averageStableRating}
              onRatingChange={() => { }}
              interactive={false}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Horse Rating</p>
              <p className="text-3xl font-bold">{averageHorseRating.toFixed(1)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <MessageSquare className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <div className="mt-3">
            <StarRating
              rating={averageHorseRating}
              onRatingChange={() => { }}
              interactive={false}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-bold">{totalReviews}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="p-6">
        <h4 className="mb-4 font-semibold">Rating Distribution</h4>
        <div className="space-y-3">
          {distribution.map(({ stars, count }, index) => {
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex w-20 items-center gap-1">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-muted-foreground">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reviews List */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold">Recent Reviews</h3>
          <Badge variant="outline">{reviews.length} Review{reviews.length !== 1 ? "s" : ""}</Badge>
        </div>

        <div className="space-y-4">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

