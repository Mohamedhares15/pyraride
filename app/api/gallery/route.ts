import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        // Only return ID and caption — NOT url (which can be a huge base64 string)
        // Images are served via /api/gallery/image/[id]
        select: {
          id: true,
          caption: true,
          createdAt: true,
        },
      }),
      prisma.galleryItem.count({ where: { status: "approved" } }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}
