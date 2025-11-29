import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const items = await prisma.galleryItem.findMany({
            where: { status: "approved" },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching gallery items:", error);
        return NextResponse.json(
            { error: "Failed to fetch gallery items" },
            { status: 500 }
        );
    }
}
