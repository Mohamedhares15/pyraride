"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SearchFilters from "@/components/sections/SearchFilters";
import StableList from "@/components/sections/StableList";
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
  createdAt: string;
}

function StablesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stables, setStables] = useState<Stable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "all");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "0");

  const fetchStables = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location !== "all") params.append("location", location);
      if (minRating !== "0") params.append("minRating", minRating);

      const response = await fetch(`/api/stables?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch stables");
      }

      const data = await response.json();
      setStables(data.stables);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [search, location, minRating]);

  useEffect(() => {
    fetchStables();
  }, [fetchStables]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    const params = new URLSearchParams(searchParams);
    if (value !== "all") {
      params.set("location", value);
    } else {
      params.delete("location");
    }
    router.push(`?${params.toString()}`);
  };

  const handleRatingChange = (value: string) => {
    setMinRating(value);
    const params = new URLSearchParams(searchParams);
    if (value !== "0") {
      params.set("minRating", value);
    } else {
      params.delete("minRating");
    }
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setLocation("all");
    setMinRating("0");
    router.push("/stables");
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 py-12 backdrop-blur-lg"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Discover Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Adventure
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our curated selection of trusted stables in Giza and Saqqara.
              Each stable is vetted for quality, safety, and unforgettable experiences.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="space-y-8">
          <SearchFilters
            search={search}
            location={location}
            minRating={minRating}
            onSearchChange={handleSearchChange}
            onLocationChange={handleLocationChange}
            onRatingChange={handleRatingChange}
            onClear={handleClear}
          />

          {error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">{error}</p>
              <button
                onClick={fetchStables}
                className="mt-4 text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    `${stables.length} Stable${stables.length !== 1 ? "s" : ""} Found`
                  )}
                </h2>
              </div>

              <StableList stables={stables} isLoading={isLoading} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StablesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <StablesPageContent />
    </Suspense>
  );
}
