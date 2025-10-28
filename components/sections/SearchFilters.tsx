"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
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
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchFilters({
  search,
  location,
  minRating,
  onSearchChange,
  onLocationChange,
  onRatingChange,
  onClear,
}: SearchFiltersProps) {
  const hasActiveFilters =
    search || location !== "all" || minRating !== "0";

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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Location Filter */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="giza">Giza</SelectItem>
              <SelectItem value="saqqara">Saqqara</SelectItem>
            </SelectContent>
          </Select>
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

