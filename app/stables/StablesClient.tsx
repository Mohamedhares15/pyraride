"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SearchFilters from "@/components/sections/SearchFilters";
import StableList from "@/components/sections/StableList";
import WeatherWidget from "@/components/shared/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Loader2, Home } from "lucide-react";

type StableMode = "stable" | "horse";

interface StableResult {
  type: "stable";
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  rating: number;
  totalBookings: number;
  totalReviews: number;
  imageUrl?: string;
  createdAt: string;
  distanceKm?: number;
}

interface HorseResult {
  type: "horse";
  id: string;
  name: string;
  stableId: string;
  stableName: string;
  stableLocation: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  pricePerHour: number;
  imageUrl?: string;
  distanceKm?: number;
}

type SearchResult = StableResult | HorseResult;

export default function StablesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [mode, setMode] = useState<StableMode>("stable");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeLocationParam = (value: string | null) => {
    if (!value) return "all";
    const lower = value.toLowerCase();
    if (lower === "giza") return "Giza";
    if (lower === "saqqara") return "Saqqara";
    return "all";
  };

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(normalizeLocationParam(searchParams.get("location")));
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "0");
  const [sort, setSort] = useState(searchParams.get("sort") || "recommended");

  const fetchStables = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location !== "all") params.append("location", location);
      if (minRating !== "0") params.append("minRating", minRating);
      if (sort && sort !== "recommended") params.append("sort", sort);

      const response = await fetch(`/api/stables?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch stables");
      }

      const data = await response.json();
      setMode((data.mode as StableMode) || "stable");
      setResults(
        (data.stables || []).map((item: any) =>
          sort === "price-asc" || sort === "price-desc"
            ? ({
                type: "horse",
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                rating: item.rating,
                reviewCount: item.reviewCount ?? 0,
                totalBookings: item.totalBookings,
                pricePerHour: Number(item.pricePerHour ?? 0),
                stableId: item.stableId,
                stableName: item.stableName,
                stableLocation: item.stableLocation,
                distanceKm: item.distanceKm,
              } as HorseResult)
            : ({
                type: "stable",
                id: item.id,
                name: item.name,
                location: item.location,
                address: item.address,
                description: item.description,
                rating: item.rating,
                totalBookings: item.totalBookings,
                imageUrl: item.imageUrl,
                createdAt: item.createdAt,
                distanceKm: item.distanceKm,
              } as StableResult)
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [search, location, minRating, sort]);

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
    const normalized = value === "all" ? "all" : normalizeLocationParam(value);
    setLocation(normalized);
    const params = new URLSearchParams(searchParams);
    if (normalized !== "all") {
      params.set("location", normalized);
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

  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "recommended") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setLocation("all");
    setMinRating("0");
    setSort("recommended");
    router.push("/stables");
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 py-12 backdrop-blur-lg"
      >
        <div className="mx-auto max-w-7xl px-3 md:px-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>
          <div className="max-w-3xl">
            <h1 className="mb-4 font-display text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Discover Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Adventure
              </span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground">
              Explore our curated selection of trusted stables in Giza and Saqqara.
              Each stable is vetted for quality, safety, and unforgettable experiences.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-3 py-4 md:py-8 md:px-8">
        <div className="space-y-6 md:space-y-8">
          {/* Weather Widget */}
          <div className="mb-4 md:mb-0">
          <WeatherWidget location={location} />
          </div>

          <SearchFilters
            search={search}
            location={location}
            minRating={minRating}
            sort={sort}
            onSearchChange={handleSearchChange}
            onLocationChange={handleLocationChange}
            onRatingChange={handleRatingChange}
            onSortChange={handleSortChange}
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
                <h2 className="font-display text-lg md:text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      <span className="text-sm md:text-base">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-sm md:text-base">
                      {results.length} {mode === "horse" ? "Horse" : "Stable"}
                      {results.length !== 1 ? "s" : ""} Found
                    </span>
                  )}
                </h2>
              </div>

              <StableList results={results} mode={mode} isLoading={isLoading} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

