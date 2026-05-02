import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// In-memory cache keyed by stable ID — Fly.io has no CDN
// GPS coordinates never change, so 24 hour TTL is safe
const coordsCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Default coordinates for Giza and Saqqara (Pyramids area)
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  giza: { lat: 29.9792, lng: 31.1342 }, // Giza Pyramids
  saqqara: { lat: 29.8711, lng: 31.2164 }, // Saqqara
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const stableId = params.id;

  // Serve from memory cache if valid
  const cached = coordsCache.get(stableId);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const stable = await prisma.stable.findUnique({
      where: { id: stableId },
      select: {
        id: true,
        name: true,
        location: true,
        address: true,
      },
    });

    if (!stable) {
      return NextResponse.json(
        { error: "Stable not found" },
        { status: 404 }
      );
    }

    // Use default coordinates based on location, or geocode address if available
    const locationKey = stable.location.toLowerCase();
    const coordinates = DEFAULT_COORDINATES[locationKey] || DEFAULT_COORDINATES.giza;

    const result = {
      stableId: stable.id,
      stableName: stable.name,
      address: stable.address || stable.location,
      coordinates,
    };

    // Store in memory cache
    coordsCache.set(stableId, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error("Error fetching stable coordinates:", error);
    return NextResponse.json(
      { error: "Failed to fetch coordinates" },
      { status: 500 }
    );
  }
}
