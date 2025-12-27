"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  search: string;
  location: string;
  minRating: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchFilters({
  search,
  location,
  minRating,
  minPrice,
  maxPrice,
  sort,
  onSearchChange,
  onLocationChange,
  onRatingChange,
  onPriceChange,
  onSortChange,
  onClear,
}: SearchFiltersProps) {
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("Failed to fetch locations:", err));
  }, []);

  const hasActiveFilters =
    search || location !== "all" || minRating !== "0" || minPrice || maxPrice;

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Search Stables</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search">Search by name or description</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search for stables..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Location Filter */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.name}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Max Price Filter (Single thumb, right-to-left) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Price Range (EGP)</Label>
            <span className="text-sm font-medium text-primary">
              {!maxPrice || parseInt(maxPrice) >= 5000
                ? "Any Price"
                : `Up to EGP ${maxPrice}`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={maxPrice ? parseInt(maxPrice) : 5000}
            onChange={(e) => {
              e.stopPropagation();
              const val = parseInt(e.target.value);
              // Always set minPrice to 0, only adjust maxPrice
              onPriceChange("0", val >= 5000 ? "" : val.toString());
            }}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${((maxPrice ? parseInt(maxPrice) : 5000) / 5000) * 100}%, hsl(var(--muted)) ${((maxPrice ? parseInt(maxPrice) : 5000) / 5000) * 100}%)`
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>EGP 0</span>
            <span>EGP 2,500</span>
            <span>EGP 5,000+</span>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label htmlFor="rating">Minimum Rating</Label>
          <Select value={minRating} onValueChange={onRatingChange}>
            <SelectTrigger id="rating">
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Recommended" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Rating: High to Low</SelectItem>
              <SelectItem value="distance">Distance: Nearest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
          Showing filtered results
        </div>
      )}
    </div>
  );
}

