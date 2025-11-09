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
        rating: number;
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
        {results.map((item, index) => {
          if (item.type !== "horse") return null;
          return (
            <StableCard
              key={item.id}
              href={`/stables/${item.stableId}#horse-${item.id}`}
              stable={{
                id: item.stableId,
              name: `${item.name} · ${item.stableName}`,
                location: item.stableLocation,
                imageUrl: item.imageUrl || "/hero-bg.webp",
              description: `Belongs to ${item.stableName}. View full gallery and availability.`,
                rating: item.rating,
                totalBookings: item.totalBookings,
                pricePerHour: item.pricePerHour,
              }}
              index={index}
            />
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
            }}
            index={index}
          />
        );
      })}
    </div>
  );
}
