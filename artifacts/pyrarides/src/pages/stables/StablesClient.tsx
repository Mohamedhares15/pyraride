"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from '@/shims/next-navigation';
import { Link } from 'wouter';
import { motion } from "framer-motion";
import SearchFilters from "@/components/sections/SearchFilters";
import StableList from "@/components/sections/StableList";
import WeatherWidget from "@/components/shared/WeatherWidget";
import { Loader2, ArrowUpRight } from "lucide-react";
import { logEvent } from "@/lib/analytics";
import { Reveal } from "@/components/shared/Motion";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

      params.append("_t", Date.now().toString());
      const response = await fetch(`/api/stables?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch stables");
      }

      const data = await response.json();
      setMode((data.mode as StableMode) || "stable");
      const mappedResults = (data.stables || []).map((item: any) =>
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
        );

      setResults(mappedResults);

      if (mappedResults.length > 0) {
        logEvent({
          action: "view_item_list",
          item_list_id: search || location !== "all" ? "filtered_search" : "default_list",
          item_list_name: "Stables and Horses List",
          items: mappedResults.map((r: any, i: number) => ({
            item_id: r.id,
            item_name: r.name,
            index: i,
            price: r.type === "horse" ? r.pricePerHour : undefined
          }))
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [search, location, minRating, minPrice, maxPrice, sort, color, skills]);

  useEffect(() => {
    fetchStables();
  }, [fetchStables]);

  const updateUrl = (params: URLSearchParams) => {
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("search", value);
    else params.delete("search");
    updateUrl(params);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    const params = new URLSearchParams(window.location.search);
    if (value !== "all") params.set("location", value);
    else params.delete("location");
    updateUrl(params);
  };

  const handleRatingChange = (value: string) => {
    setMinRating(value);
    const params = new URLSearchParams(window.location.search);
    if (value !== "0") params.set("minRating", value);
    else params.delete("minRating");
    updateUrl(params);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    const params = new URLSearchParams(window.location.search);
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    updateUrl(params);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "recommended") params.set("sort", value);
    else params.delete("sort");
    updateUrl(params);
  };

  const handleColorChange = (value: string) => {
    setColor(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") params.set("color", value);
    else params.delete("color");
    updateUrl(params);
  };

  const handleSkillsChange = (value: string[]) => {
    setSkills(value);
    const params = new URLSearchParams(window.location.search);
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
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="border-b hairline bg-background/90 backdrop-blur-md pt-32 pb-12"
      >
        <div className="container">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">
              The Stables · Giza &amp; Saqqara
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance max-w-4xl">
              The finest estates, by horseback.
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-ink-soft text-pretty">
              Each stable is verified for horsemanship, safety, and quiet excellence.
              Compare at your leisure — every detail is in its proper place.
            </p>
          </Reveal>
        </div>
      </motion.div>

      <div className="container py-10 space-y-8">
        {/* Weather & packages promo */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1">
            <WeatherWidget location={location} />
          </div>
          <Link href="/packages" className="group flex-shrink-0 lg:self-stretch">
            <div className="h-full border hairline p-6 flex flex-col justify-between gap-6 hover:bg-surface transition-colors duration-500 lg:max-w-xs">
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">Signature journeys</p>
                <p className="font-display text-2xl leading-snug">Curated packages, never crowded.</p>
                <p className="mt-2 text-sm text-ink-soft text-pretty">
                  Private rides from sunrise to desert, arranged before you arrive.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted group-hover:text-foreground transition-colors">
                Explore packages <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile filter toggle */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full h-12 flex items-center justify-between px-5 border hairline bg-surface hover:bg-surface-elevated transition-colors text-[12px] tracking-[0.16em] uppercase"
          >
            <span>{showMobileFilters ? "Hide filters" : "Show filters"}</span>
            <span className="text-ink-muted text-xs">{showMobileFilters ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Filters */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
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
        </div>

        {/* Results */}
        {error ? (
          <div className="border hairline p-8 text-center">
            <p className="text-ink-muted font-display text-2xl mb-3">Something went wrong.</p>
            <p className="text-sm text-ink-muted mb-5">{error}</p>
            <button
              onClick={fetchStables}
              className="text-[12px] tracking-[0.18em] uppercase text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b hairline pb-4">
              {isLoading ? (
                <div className="flex items-center gap-2 text-ink-muted">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-[12px] tracking-[0.14em] uppercase">Searching…</span>
                </div>
              ) : (
                <p className="text-[12px] tracking-[0.14em] uppercase text-ink-muted">
                  {results.length} {mode === "horse" ? (results.length === 1 ? "horse" : "horses") : (results.length === 1 ? "estate" : "estates")} found
                </p>
              )}
            </div>

            <StableList results={results} mode={mode} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
