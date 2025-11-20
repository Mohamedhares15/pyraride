import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface HorseData {
  name: string;
  description: string;
  pricePerHour?: number;
  age?: number;
  skills?: string[];
  imageUrls: string[];
}

interface StableHorsesData {
  stableName: string;
  horses: HorseData[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    // Check if user is admin (you can also allow stable_owner)
    if (!session || (session.user.role !== "admin" && session.user.role !== "stable_owner")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or stable owner access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const stableHorsesData: StableHorsesData[] = body.stables || body;

    // Validate input
    if (!Array.isArray(stableHorsesData) || stableHorsesData.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array of stables with horses." },
        { status: 400 }
      );
    }

    // Get all stables
    const stables = await prisma.stable.findMany({
      where: { status: "approved" },
    });

    const stableMap = new Map<string, string>();
    stables.forEach((stable) => {
      stableMap.set(stable.name.toLowerCase().trim(), stable.id);
    });

    const results = {
      success: [] as Array<{ stable: string; horse: string; images: number }>,
      errors: [] as Array<{ stable: string; horse: string; error: string }>,
    };

    let totalHorses = 0;
    let totalImages = 0;

    for (const stableData of stableHorsesData) {
      const stableId = stableMap.get(stableData.stableName.toLowerCase().trim());

      if (!stableId) {
        results.errors.push({
          stable: stableData.stableName,
          horse: "N/A",
          error: `Stable "${stableData.stableName}" not found`,
        });
        continue;
      }

      // If user is stable_owner, verify they own this stable
      if (session.user.role === "stable_owner") {
        const stable = await prisma.stable.findUnique({
          where: { id: stableId },
        });
        if (!stable || stable.ownerId !== session.user.id) {
          results.errors.push({
            stable: stableData.stableName,
            horse: "N/A",
            error: `You don't own stable "${stableData.stableName}"`,
          });
          continue;
        }
      }

      for (const horseData of stableData.horses) {
        try {
          // Validate required fields
          if (!horseData.name || !horseData.description || !horseData.imageUrls || horseData.imageUrls.length === 0) {
            results.errors.push({
              stable: stableData.stableName,
              horse: horseData.name || "Unknown",
              error: "Missing required fields (name, description, or imageUrls)",
            });
            continue;
          }

          // Validate and clean image URLs
          const validImageUrls = horseData.imageUrls
            .filter((url: string) => url && typeof url === "string")
            .map((url: string) => {
              // Convert Google Drive share links to direct image URLs
              const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
              if (driveMatch) {
                return `https://drive.google.com/uc?id=${driveMatch[1]}`;
              }
              // If already in correct format, use as-is
              if (url.startsWith("http") || url.startsWith("/")) {
                return url;
              }
              return null;
            })
            .filter((url: string | null): url is string => url !== null);

          if (validImageUrls.length === 0) {
            results.errors.push({
              stable: stableData.stableName,
              horse: horseData.name,
              error: "No valid image URLs found",
            });
            continue;
          }

          // Create the horse
          const horse = await prisma.horse.create({
            data: {
              name: horseData.name.trim(),
              description: horseData.description.trim(),
              imageUrls: validImageUrls,
              stableId: stableId,
              pricePerHour: horseData.pricePerHour ? parseFloat(horseData.pricePerHour.toString()) : null,
              age: horseData.age ? parseInt(horseData.age.toString()) : null,
              skills: Array.isArray(horseData.skills) ? horseData.skills.map((s: string) => s.trim()) : [],
              isActive: true,
            },
          });

          // Create HorseMedia entries for each image
          const mediaPromises = validImageUrls.map((url: string, index: number) =>
            prisma.horseMedia.create({
              data: {
                horseId: horse.id,
                type: "image",
                url: url,
                sortOrder: index + 1,
              },
            })
          );

          await Promise.all(mediaPromises);

          totalHorses++;
          totalImages += validImageUrls.length;

          results.success.push({
            stable: stableData.stableName,
            horse: horseData.name,
            images: validImageUrls.length,
          });
        } catch (error: any) {
          results.errors.push({
            stable: stableData.stableName,
            horse: horseData.name || "Unknown",
            error: error.message || "Unknown error",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${totalHorses} horses with ${totalImages} images`,
      summary: {
        totalHorses,
        totalImages,
        successful: results.success.length,
        failed: results.errors.length,
      },
      results,
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload horses" },
      { status: 500 }
    );
  }
}

