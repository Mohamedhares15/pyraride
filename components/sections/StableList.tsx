"use client";

import { motion } from "framer-motion";
import StableCard from "./StableCard";
import { Loader2, Star } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type StableMode = "stable" | "horse";

interface StableListProps {
  results: Array<
    | {
        type: "stable";
        id: string;
        name: string;
        location: string;
        address: string;
        description: string;
        rating: number;
        totalBookings: number;
        totalReviews?: number;
        imageUrl?: string;
        createdAt: string;
        distanceKm?: number;
      }
    | {
        type: "horse";
        id: string;
        name: string;
        pricePerHour: number;
        stableId: string;
        stableName: string;
        stableLocation: string;
        imageUrl?: string;
        imageUrls?: string[];
        media?: Array<{ url: string; type: string }>;
        rating: number;
        reviewCount: number;
        totalBookings: number;
        distanceKm?: number;
      }
  >;
  mode: StableMode;
  isLoading?: boolean;
}

export default function StableList({ results, mode, isLoading }: StableListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading stables...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center"
      >
        <div className="mb-4 text-6xl">🐴</div>
        <h3 className="mb-2 font-display text-2xl font-bold">
          {mode === "horse" ? "No Horses Found" : "No Stables Found"}
        </h3>
        <p className="max-w-md text-muted-foreground">
          We couldn&apos;t find any stables matching your search criteria.
          Try adjusting your filters or search terms.
        </p>
      </motion.div>
    );
  }

  if (mode === "horse") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => {
          if (item.type !== "horse") return null;
          
          // Use the same image selection logic as stable detail page
          const portfolioItems = (item as any).media?.filter(
            (m: any) => m && typeof m.url === "string"
          ) ?? [];
          const heroImage = 
            portfolioItems.find((m: any) => m.type === "image")?.url || 
            (item.imageUrls && item.imageUrls[0]) ||
            item.imageUrl || 
            "/hero-bg.webp";
          
          const priceLabel = `$${item.pricePerHour.toFixed(0)}/hour`;
          const ratingLabel =
            typeof item.rating === "number" && item.rating > 0
              ? item.rating.toFixed(1)
              : "New";
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <Link href={`/stables/${item.stableId}#horse-${item.id}`} className="block h-full">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Image
                      src={heroImage}
                      alt={item.name}
                      fill
                      className="object-cover"
                      draggable={false}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    />
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary whitespace-nowrap">
                        {priceLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.stableName} · {item.stableLocation}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{ratingLabel}</span>
                      {item.reviewCount > 0 && (
                        <span className="text-muted-foreground">
                          ({item.reviewCount})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tap to view this horse&apos;s full portfolio and availability.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {results.map((item, index) => {
        if (item.type !== "stable") return null;
        return (
          <StableCard
            key={item.id}
            stable={{
              id: item.id,
              name: item.name,
              location: item.location,
              imageUrl: item.imageUrl || "/hero-bg.webp",
              description: item.description,
              rating: item.rating,
              totalBookings: item.totalBookings,
              totalReviews: item.totalReviews ?? 0,
            }}
            index={index}
          />
        );
      })}
    </div>
  );
}
