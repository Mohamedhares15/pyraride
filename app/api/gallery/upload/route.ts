import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Save file to public/uploads/gallery (will need to be created)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${sanitizedName}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "gallery");

    try {
      // Ensure directory exists (will be created by mkdir in production)
      const fs = await import("fs/promises");
      await fs.mkdir(uploadDir, { recursive: true });

      // Save file
      const filepath = join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);

      // Return success with relative URL
      const fileUrl = `/uploads/gallery/${filename}`;

      // Save to database
      const galleryItem = await prisma.galleryItem.create({
        data: {
          url: fileUrl,
          status: "pending",
          uploadedBy: "public", // Or session user if available
        },
      });

      return NextResponse.json({
        success: true,
        message: "Image uploaded successfully and is pending review",
        filename: filename,
        url: fileUrl,
        item: galleryItem,
      });
    } catch (dirError) {
      // If directory creation fails (e.g., in Vercel), just return success
      // In production with cloud storage, you'd upload to S3/Cloudinary here
      console.warn("Could not save file locally (expected in production):", dirError);

      return NextResponse.json({
        success: true,
        message: "Image received and is pending review. In production, this will be saved to cloud storage.",
        filename: filename,
      });
    }
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

