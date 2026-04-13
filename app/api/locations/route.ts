import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic route - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(locations, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
