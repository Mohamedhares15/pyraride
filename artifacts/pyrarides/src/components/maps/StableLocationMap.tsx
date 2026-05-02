"use client";

import { useState, useEffect } from "react";
import LocationMap from "./LocationMap";
import { Loader2 } from "lucide-react";

interface StableLocationMapProps {
  stableId: string;
  stableName: string;
  stableLocation: string;
  stableAddress?: string | null;
}

export default function StableLocationMap({
  stableId,
  stableName,
  stableLocation,
  stableAddress,
}: StableLocationMapProps) {
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoordinates() {
      try {
        const response = await fetch(`/api/stables/${stableId}/coordinates`);
        if (!response.ok) throw new Error("Failed to fetch coordinates");

        const data = await response.json();
        setCoordinates(data.coordinates);
      } catch (err) {
        console.error("Error fetching coordinates:", err);
        setError("Could not load map");
        // Use default coordinates for Giza
        setCoordinates({ lat: 29.9792, lng: 31.1342 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoordinates();
  }, [stableId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        Map unavailable
      </div>
    );
  }

  return (
    <LocationMap
      stableLat={coordinates.lat}
      stableLng={coordinates.lng}
      stableName={stableName}
      stableAddress={stableAddress || stableLocation}
    />
  );
}

