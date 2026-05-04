"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { logEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  color: string;
  skills: string[];
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onSortChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSkillsChange: (value: string[]) => void;
  onClear: () => void;
}

export default function SearchFilters({
  search,
  location,
  minRating,
  minPrice,
  maxPrice,
  sort,
  color,
  skills,
  onSearchChange,
  onLocationChange,
  onRatingChange,
  onPriceChange,
  onSortChange,
  onColorChange,
  onSkillsChange,
  onClear,
}: SearchFiltersProps) {
  const ALLOWED_COLORS = ["Adham", "Azra2", "Ashkar", "Ahmar", "Pure White", "Palomino", "Pinto"];
  const ALLOWED_SKILLS = ["Adab", "Levade", "Impulsion", "Mettle", "Bolt", "Nerve", "Impeccable Manners", "Beginner Friendly"];
  
  // Tourist-friendly display labels for complex equestrian terms
  const SKILL_LABELS: Record<string, string> = {
    "Adab": "Well-Mannered",
    "Levade": "Trained Dancer",
    "Impulsion": "Energetic",
    "Mettle": "Confident",
    "Bolt": "Fast Runner",
    "Nerve": "Fearless",
    "Impeccable Manners": "Gentle",
    "Beginner Friendly": "Beginner Friendly"
  };

  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  // Local slider value — update URL only on drag end to avoid constant re-fetches
  const [localMax, setLocalMax] = useState(maxPrice ? parseInt(maxPrice) : 5000);
  const isDragging = useRef(false);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("Failed to fetch locations:", err));
  }, []);

  // Keep local value in sync if parent changes externally
  useEffect(() => {
    setLocalMax(maxPrice ? parseInt(maxPrice) : 5000);
  }, [maxPrice]);

  const hasActiveFilters =
    search || location !== "all" || minRating !== "0" || minPrice || maxPrice || color !== "all" || skills.length > 0;

  const pct = (localMax / 5000) * 100;
  const displayLabel =
    localMax >= 5000 ? "Any Price" : `Up to EGP ${localMax.toLocaleString()}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-base tracking-tight">Search & Filter</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </Button>
        )}
      </div>

      <div className="p-6 space-y-6">


        {/* Filters Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Location */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Location</Label>
            <Select value={location} onValueChange={(val) => {
              logEvent({ action: "filter_changed", filter_type: "location", label: val });
              onLocationChange(val);
            }}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {(locations || []).map((loc) => (
                  <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Min Rating */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Min. Rating</Label>
            <Select value={minRating} onValueChange={(val) => {
              logEvent({ action: "filter_changed", filter_type: "rating", label: val });
              onRatingChange(val);
            }}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars ⭐⭐⭐</SelectItem>
                <SelectItem value="4">4+ Stars ⭐⭐⭐⭐</SelectItem>
                <SelectItem value="5">5 Stars ⭐⭐⭐⭐⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Second Row Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Horse Color</Label>
            <Select value={color} onValueChange={onColorChange}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50">
                <SelectValue placeholder="Any Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Color</SelectItem>
                {ALLOWED_COLORS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sort By</Label>
            <Select value={sort} onValueChange={(val) => {
              logEvent({ action: "filter_changed", filter_type: "sort", label: val });
              onSortChange(val);
            }}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50">
                <SelectValue placeholder="Recommended" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Skills (Select 1-4)
          </Label>
          <div className="flex flex-wrap gap-2">
            {ALLOWED_SKILLS.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => {
                    let newSkills;
                    if (isSelected) {
                      newSkills = skills.filter(s => s !== skill);
                    } else {
                      if (skills.length >= 4) {
                        alert("You can select maximum 4 skills for filtering.");
                        return;
                      }
                      newSkills = [...skills, skill];
                    }
                    onSkillsChange(newSkills);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  {SKILL_LABELS[skill] || skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LUXURY PRICE SLIDER ── */}
        <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Price Range
            </Label>
            <div className="flex flex-1 justify-end items-center gap-2">
              <span
                className={`text-sm font-bold tabular-nums transition-colors duration-200 hidden sm:inline-block ${
                  localMax >= 5000 ? "text-muted-foreground" : "text-primary"
                }`}
              >
                Up to
              </span>
              <Input
                type="number"
                min={0}
                max={5000}
                step={500}
                value={localMax}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setLocalMax(val);
                    onPriceChange("0", val >= 5000 ? "" : val.toString());
                  }
                }}
                className={`h-8 w-24 px-2 text-right text-sm font-bold bg-background transition-colors ${
                  localMax >= 5000 ? "text-muted-foreground border-border/40" : "text-primary border-primary/50 ring-1 ring-primary/20"
                }`}
                placeholder="5000"
              />
              <span className="text-xs text-muted-foreground font-semibold">EGP</span>
            </div>
          </div>

          {/* Track + Thumb */}
          <div className="relative pt-1 pb-1">
            {/* Background track */}
            <div className="h-1.5 w-full rounded-full bg-border/60" />

            {/* Filled track (active) */}
            <div
              className="absolute top-1 left-0 h-1.5 rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-75"
              style={{ width: `${pct}%` }}
            />

            {/* Actual range input, invisible but interactive on top */}
            <input
              type="range"
              min={0}
              max={5000}
              step={500}
              value={localMax}
              onMouseDown={() => { isDragging.current = true; }}
              onTouchStart={() => { isDragging.current = true; }}
              onChange={(e) => {
                e.stopPropagation();
                setLocalMax(parseInt(e.target.value));
              }}
              onMouseUp={(e) => {
                isDragging.current = false;
                const val = parseInt((e.target as HTMLInputElement).value);
                logEvent({ action: "filter_changed", filter_type: "price_slider", value: val });
                onPriceChange("0", val >= 5000 ? "" : val.toString());
              }}
              onTouchEnd={(e) => {
                isDragging.current = false;
                const val = parseInt((e.target as HTMLInputElement).value);
                logEvent({ action: "filter_changed", filter_type: "price_slider", value: val });
                onPriceChange("0", val >= 5000 ? "" : val.toString());
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              style={{ WebkitAppearance: "none", appearance: "none" }}
            />

            {/* Custom thumb bubble */}
            <div
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-75"
              style={{ left: `${pct}%` }}
            >
              <div className="relative flex items-center justify-center">
                <div className="h-5 w-5 rounded-full border-[3px] border-primary bg-background shadow-lg shadow-primary/30 ring-4 ring-primary/10" />
              </div>
            </div>
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-[10px] font-medium tracking-wide text-muted-foreground/60 uppercase">
            <span>EGP 0</span>
            <span>EGP 2,500</span>
            <span>EGP 5,000+</span>
          </div>

          {/* Quick Click Checkpoints */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
            {[500, 1000, 1500, 2000, 2500, 3000].map(val => (
              <button
                key={val}
                onClick={() => {
                  setLocalMax(val);
                  logEvent({ action: "filter_changed", filter_type: "price_checkpoint", value: val });
                  onPriceChange("0", val.toString());
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  localMax === val
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
                }`}
              >
                Up to EGP {val}
              </button>
            ))}
            <button
              onClick={() => {
                setLocalMax(5000);
                logEvent({ action: "filter_changed", filter_type: "price_checkpoint", value: 5000 });
                onPriceChange("0", "");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                localMax >= 5000
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
              }`}
            >
              Any Price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
