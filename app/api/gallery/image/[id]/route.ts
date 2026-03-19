import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id: params.id },
      select: { url: true },
    });

    if (!item) {
      return new NextResponse("Not found", { status: 404 });
    }

    // If stored as a base64 data URL, extract and serve as binary
    if (item.url.startsWith("data:")) {
      const [header, base64Data] = item.url.split(",");
      const mimeType = header.split(":")[1].split(";")[0];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          // Cache for 1 year — image content never changes
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": buffer.length.toString(),
        },
      });
    }

    // If it's already a URL, redirect to it
    return NextResponse.redirect(item.url);
  } catch (error) {
    console.error("Error serving gallery image:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
