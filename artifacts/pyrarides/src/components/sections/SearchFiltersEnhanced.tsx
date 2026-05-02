"use client";

import { useState } from "react";
import { Search, Filter, MapPin, Star, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface SearchFiltersEnhancedProps {
  search: string;
  location: string;
  minRating: string;
  rideType: string;
  duration: string;
  priceRange: string;
  welfareBadge: boolean;
  pickupAvailable: boolean;
  instantBook: boolean;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onRideTypeChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onWelfareBadgeChange: (value: boolean) => void;
  onPickupChange: (value: boolean) => void;
  onInstantBookChange: (value: boolean) => void;
  onClear: () => void;
}

export default function SearchFiltersEnhanced({
  search,
  location,
  minRating,
  rideType,
  duration,
  priceRange,
  welfareBadge,
  pickupAvailable,
  instantBook,
  onSearchChange,
  onLocationChange,
  onRatingChange,
  onRideTypeChange,
  onDurationChange,
  onPriceRangeChange,
  onWelfareBadgeChange,
  onPickupChange,
  onInstantBookChange,
  onClear,
}: SearchFiltersEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Main Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search by name or description</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search for stables..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={location} onValueChange={onLocationChange}>
              <SelectTrigger>
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Giza">Giza</SelectItem>
                <SelectItem value="Saqqara">Saqqara</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select value={minRating} onValueChange={onRatingChange}>
              <SelectTrigger>
                <Star className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="4">4.0+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
                <SelectItem value="4.8">4.8+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ride Type</Label>
            <Select value={rideType} onValueChange={onRideTypeChange}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sunrise">Sunrise</SelectItem>
                <SelectItem value="sunset">Sunset</SelectItem>
                <SelectItem value="desert">Desert Loop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={onDurationChange}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Any Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="2h">2 Hours</SelectItem>
                <SelectItem value="half">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          {isExpanded ? "Hide" : "Show"} Advanced Filters
          <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </Button>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Price Range Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Max Price (EGP)</Label>
                  <span className="text-sm font-medium text-primary">
                    {priceRange === "all" || priceRange === "500"
                      ? "Any Price"
                      : `Up to ${priceRange} EGP`}
                  </span>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="25"
                    value={priceRange === "all" ? 500 : parseInt(priceRange) || 500}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onPriceRangeChange(val >= 500 ? "all" : val.toString());
                    }}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to left, hsl(var(--primary)) ${((parseInt(priceRange === "all" ? "500" : priceRange) || 500) / 500) * 100}%, hsl(var(--muted)) ${((parseInt(priceRange === "all" ? "500" : priceRange) || 500) / 500) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>125</span>
                    <span>250</span>
                    <span>375</span>
                    <span>500+</span>
                  </div>
                </div>
              </div>

              {/* Filter toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={welfareBadge}
                    onChange={(e) => onWelfareBadgeChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Animal Welfare Certified</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickupAvailable}
                    onChange={(e) => onPickupChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Hotel Pickup Available</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantBook}
                    onChange={(e) => onInstantBookChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Instant Booking</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onClear}>
            Clear All
          </Button>
          <div className="text-sm text-muted-foreground">
            Active filters will be applied in real-time
          </div>
        </div>
      </div>
    </Card>
  );
}

