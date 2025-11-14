"use client";

import { useState } from "react";
import BottomSheet from "./BottomSheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterOptions {
  location: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  tags: string[];
}

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const locations = ["Giza", "Saqqara", "Siwa", "Dahab", "Hurghada"];
const tags = ["sunset", "sunrise", "family-friendly", "adventure", "historic"];

export default function FilterBottomSheet({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}: FilterBottomSheetProps) {
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      location: [],
      minPrice: 0,
      maxPrice: 200,
      minRating: 0,
      tags: [],
    }
  );

  const handleLocationToggle = (loc: string) => {
    setFilters((prev) => ({
      ...prev,
      location: prev.location.includes(loc)
        ? prev.location.filter((l) => l !== loc)
        : [...prev.location, loc],
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      location: [],
      minPrice: 0,
      maxPrice: 200,
      minRating: 0,
      tags: [],
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter Stables">
      <div className="space-y-6 pb-4">
        {/* Location */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Location</Label>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocationToggle(loc)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all min-h-[48px] ${
                  filters.location.includes(loc)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Price Range: ${filters.minPrice} - ${filters.maxPrice}/hour
          </Label>
          <div className="space-y-4">
            <input
              type="range"
              min={0}
              max={200}
              step={10}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Min $/hour</Label>
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: parseInt(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  max={filters.maxPrice}
                  className="h-12"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Max $/hour</Label>
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: parseInt(e.target.value) || 200,
                    }))
                  }
                  min={filters.minPrice}
                  max={200}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}+ Stars` : "Any"}
          </Label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    minRating: prev.minRating === rating ? 0 : rating,
                  }))
                }
                className={`flex-1 h-12 rounded-2xl text-sm font-medium transition-all ${
                  filters.minRating === rating
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating === 0 ? "Any" : `${rating}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all min-h-[48px] ${
                  filters.tags.includes(tag)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-12 rounded-2xl"
          >
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1 h-12 rounded-2xl">
            Apply Filters
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

