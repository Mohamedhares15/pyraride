import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache — Fly.io has no CDN, so we cache in the Node process
// Locations rarely change, so 1 hour TTL is safe
let locationsCache: { data: any; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
    // Serve from memory cache if valid
    if (locationsCache && Date.now() < locationsCache.expiresAt) {
        return NextResponse.json(locationsCache.data, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'X-Cache': 'HIT',
            },
        });
    }

    try {
        const locations = await prisma.location.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });

        // Store in memory cache before returning
        locationsCache = { data: locations, expiresAt: Date.now() + CACHE_TTL_MS };

        return NextResponse.json(locations, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'X-Cache': 'MISS',
            },
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
