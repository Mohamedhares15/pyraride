"use client";

import { motion } from "framer-motion";
import StableCard from "./StableCard";
import { Loader2 } from "lucide-react";

interface Stable {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  rating: number;
  totalBookings: number;
  horseCount: number;
  imageUrl?: string;
  createdAt: string;
}

interface StableListProps {
  stables: Stable[];
  isLoading?: boolean;
}

export default function StableList({ stables, isLoading }: StableListProps) {
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

  if (stables.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center"
      >
        <div className="mb-4 text-6xl">🐴</div>
        <h3 className="mb-2 font-display text-2xl font-bold">
          No Stables Found
        </h3>
        <p className="max-w-md text-muted-foreground">
          We couldn&apos;t find any stables matching your search criteria.
          Try adjusting your filters or search terms.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stables.map((stable, index) => (
        <StableCard 
          key={stable.id} 
          stable={{
            id: stable.id,
            name: stable.name,
            location: stable.location,
            imageUrl: stable.imageUrl || "/hero-bg.webp",
            description: stable.description,
            rating: stable.rating,
            totalBookings: stable.totalBookings,
          }} 
          index={index} 
        />
      ))}
    </div>
  );
}
