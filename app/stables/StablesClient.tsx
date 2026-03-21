"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SearchFilters from "@/components/sections/SearchFilters";
import StableList from "@/components/sections/StableList";
import WeatherWidget from "@/components/shared/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Loader2, Home, ArrowRight, Star } from "lucide-react";

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
  imageUrls?: string[];
  media?: Array<{ url: string; type: string }>;
  distanceKm?: number;
  adminTier?: string;
  color?: string | null;
  skills?: string[];
  description?: string;
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
    return value;
  };

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(normalizeLocationParam(searchParams.get("location")));
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "0");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "recommended");
  const [color, setColor] = useState(searchParams.get("color") || "all");
  const [skills, setSkills] = useState<string[]>(searchParams.get("skills") ? searchParams.get("skills")!.split(",") : []);

  const fetchStables = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location !== "all") params.append("location", location);
      if (minRating !== "0") params.append("minRating", minRating);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sort && sort !== "recommended") params.append("sort", sort);
      if (color && color !== "all") params.append("color", color);
      if (skills && skills.length > 0) params.append("skills", skills.join(","));

      const response = await fetch(`/api/stables?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch stables");
      }

      const data = await response.json();
      setMode((data.mode as StableMode) || "stable");
      setResults(
        (data.stables || []).map((item: any) =>
          sort === "price-asc" || sort === "price-desc" || minPrice || maxPrice || (color && color !== "all") || (skills && skills.length > 0) || data.mode === "horse"
            ? ({
              type: "horse",
              id: item.id,
              name: item.name,
              imageUrl: item.imageUrl || "/hero-bg.webp",
              imageUrls: item.imageUrls || [],
              media: item.media || [],
              rating: item.rating,
              reviewCount: item.reviewCount ?? 0,
              totalBookings: item.totalBookings,
              pricePerHour: Number(item.pricePerHour ?? 0),
              stableId: item.stableId,
              stableName: item.stableName,
              stableLocation: item.stableLocation,
              distanceKm: item.distanceKm,
              adminTier: item.adminTier,
              color: item.color,
              skills: item.skills,
              description: item.description,
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
              totalReviews: item.totalReviews ?? 0,
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
  }, [search, location, minRating, minPrice, maxPrice, sort, color, skills]);

  useEffect(() => {
    fetchStables();
  }, [fetchStables]);

  // KEY FIX: use router.replace with scroll: false to prevent page jump on every filter change
  const updateUrl = (params: URLSearchParams) => {
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    updateUrl(params);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    const params = new URLSearchParams(searchParams);
    if (value !== "all") params.set("location", value);
    else params.delete("location");
    updateUrl(params);
  };

  const handleRatingChange = (value: string) => {
    setMinRating(value);
    const params = new URLSearchParams(searchParams);
    if (value !== "0") params.set("minRating", value);
    else params.delete("minRating");
    updateUrl(params);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    const params = new URLSearchParams(searchParams);
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    updateUrl(params);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "recommended") params.set("sort", value);
    else params.delete("sort");
    updateUrl(params);
  };

  const handleColorChange = (value: string) => {
    setColor(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set("color", value);
    else params.delete("color");
    updateUrl(params);
  };

  const handleSkillsChange = (value: string[]) => {
    setSkills(value);
    const params = new URLSearchParams(searchParams);
    if (value && value.length > 0) params.set("skills", value.join(","));
    else params.delete("skills");
    updateUrl(params);
  };

  const handleClear = () => {
    setSearch("");
    setLocation("all");
    setMinRating("0");
    setMinPrice("");
    setMaxPrice("");
    setSort("recommended");
    setColor("all");
    setSkills([]);
    router.replace("/stables", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background safe-area-white">
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
              Book Horse Riding at Giza & Saqqara Pyramids
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground mb-4">
              <strong>PyraRides is Egypt's first online marketplace</strong> for booking horse riding experiences
              at the pyramids. Compare multiple verified stables, read authentic reviews, and book instantly
              with guaranteed best prices.
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              <strong>Why choose PyraRides?</strong> Unlike single-stable websites, we offer multiple stables
              in one platform, making it easy to compare prices, locations, and reviews. All stables are
              verified for safety and quality. Instant booking, secure payments, 24/7 support.
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

          {/* Packages Promo Block */}
          <Link href="/packages" className="block w-full">
            <div className="relative overflow-hidden rounded-2xl border border-[rgb(218,165,32)]/30 bg-gradient-to-r from-black via-[rgb(218,165,32)]/10 to-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group transition-all hover:border-[rgb(218,165,32)]/50 hover:shadow-[0_0_30px_rgba(218,165,32,0.15)]">
              {/* Decorative elements */}
              <div className="absolute -left-20 -top-20 w-40 h-40 bg-[rgb(218,165,32)]/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[rgb(218,165,32)]/20 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                <div className="hidden sm:flex shrink-0 h-16 w-16 rounded-full bg-[rgb(218,165,32)]/10 items-center justify-center border border-[rgb(218,165,32)]/30 group-hover:scale-110 transition-transform duration-500">
                  <Star className="h-8 w-8 text-[rgb(218,165,32)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[rgb(218,165,32)]">New Experience</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(218,165,32)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(218,165,32)]"></span>
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-medium text-white mb-2">
                    Discover Our Exclusive Riding Packages
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xl">
                    Upgrade your experience with our curated private VIP rides and group events at the Great Pyramids.
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button className="w-full md:w-auto bg-[rgb(218,165,32)] text-black hover:bg-[rgb(218,165,32)]/90 font-semibold gap-2 h-12 px-8 shadow-[0_0_15px_rgba(218,165,32,0.3)]">
                  Explore Packages <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Link>

          <SearchFilters
            search={search}
            location={location}
            minRating={minRating}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            color={color}
            skills={skills}
            onSearchChange={handleSearchChange}
            onLocationChange={handleLocationChange}
            onRatingChange={handleRatingChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onColorChange={handleColorChange}
            onSkillsChange={handleSkillsChange}
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
