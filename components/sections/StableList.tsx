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
      <div className="grid gap-6 md:grid-cols-1">
        {results.map((item, index) => {
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

          const priceLabel = `EGP ${item.pricePerHour.toFixed(0)}/hour`;

          // Generate mock slots for "Tomorrow"
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

          const morningSlots = ["07:00", "08:00", "09:00", "10:00"];
          const afternoonSlots = ["14:00", "15:00", "16:00"];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid gap-0 md:grid-cols-3">
                  {/* Horse Image - Clickable to Stable Page */}
                  <Link href={`/stables/${item.stableId}#horse-${item.id}`} className="md:col-span-1 relative h-64 md:h-auto group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                      {heroImage && heroImage !== "/hero-bg.webp" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={heroImage}
                          alt={`${item.name}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          draggable={false}
                          loading={index !== undefined && index >= 6 ? "lazy" : undefined}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="mx-auto mb-2 text-5xl">🐴</div>
                            <p className="text-sm text-muted-foreground">{item.name}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Details
                      </span>
                    </div>
                  </Link>

                  {/* Horse Info & Slots */}
                  <div className="md:col-span-2 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link href={`/stables/${item.stableId}#horse-${item.id}`} className="hover:underline">
                            <h3 className="font-display text-2xl font-bold text-foreground">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-1">
                            at <span className="font-medium text-foreground">{item.stableName}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-bold text-primary">{priceLabel}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {(item as any).description || "A wonderful horse ready for your adventure."}
                      </p>

                      {/* Skill Level Badge */}
                      {(item as any).skillLevel && (
                        <div className="mb-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${(item as any).skillLevel?.toLowerCase() === 'beginner'
                              ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                              : (item as any).skillLevel?.toLowerCase() === 'intermediate'
                                ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-600 border border-red-500/30'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${(item as any).skillLevel?.toLowerCase() === 'beginner'
                                ? 'bg-green-500'
                                : (item as any).skillLevel?.toLowerCase() === 'intermediate'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`} />
                            {(item as any).skillLevel} Level
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-6">
                        {/* Skills tags */}
                        {((item as any).skills || ["Beginner Friendly", "Tour Guide"]).slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Next Available Rides */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Next Available Rides</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20">Tomorrow Morning:</span>
                          <div className="flex flex-wrap gap-2">
                            {morningSlots.map((time) => (
                              <Link
                                key={time}
                                href={`/booking?stableId=${item.stableId}&horseId=${item.id}&date=${tomorrowDateStr}&startTime=${time}&endTime=${(parseInt(time) + 1).toString().padStart(2, '0')}:00`}
                              >
                                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">
                                  {time}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20">Tomorrow Afternoon:</span>
                          <div className="flex flex-wrap gap-2">
                            {afternoonSlots.map((time) => (
                              <Link
                                key={time}
                                href={`/booking?stableId=${item.stableId}&horseId=${item.id}&date=${tomorrowDateStr}&startTime=${time}&endTime=${(parseInt(time) + 1).toString().padStart(2, '0')}:00`}
                              >
                                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">
                                  {time}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
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
