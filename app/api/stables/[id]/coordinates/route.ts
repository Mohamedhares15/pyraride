import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Default coordinates for Giza and Saqqara (Pyramids area)
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  giza: { lat: 29.9792, lng: 31.1342 }, // Giza Pyramids
  saqqara: { lat: 29.8711, lng: 31.2164 }, // Saqqara
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stable = await prisma.stable.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({
      stableId: stable.id,
      stableName: stable.name,
      address: stable.address || stable.location,
      coordinates,
    });
  } catch (error) {
    console.error("Error fetching stable coordinates:", error);
    return NextResponse.json(
      { error: "Failed to fetch coordinates" },
      { status: 500 }
    );
  }
}

