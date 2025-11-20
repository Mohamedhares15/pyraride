import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const stableId = searchParams.get("stableId");

    if (!stableId) {
      return NextResponse.json(
        { error: "stableId is required" },
        { status: 400 }
      );
    }

    const horses = await prisma.horse.findMany({
      where: {
        stableId,
        isActive: true,
      },
    });

    return NextResponse.json({ horses });
  } catch (error) {
    console.error("Error fetching horses:", error);
    return NextResponse.json(
      { error: "Failed to fetch horses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { stableId, name, description, imageUrls, pricePerHour, age, skills } = body;

    // Verify the stable belongs to this owner
    const stable = await prisma.stable.findUnique({
      where: { id: stableId },
    });

    if (!stable || stable.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized or stable not found" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !description || !stableId) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, stableId" },
        { status: 400 }
      );
    }

    // Require at least one image
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one horse image is required" },
        { status: 400 }
      );
    }

    // Validate image URLs are valid
    const validImageUrls = imageUrls.filter((url: string) => 
      url && (url.startsWith("http") || url.startsWith("/"))
    );

    if (validImageUrls.length === 0) {
      return NextResponse.json(
        { error: "Please provide valid image URLs" },
        { status: 400 }
      );
    }

    // Create horse
    const horse = await prisma.horse.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        imageUrls: validImageUrls,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour.toString()) : null,
        age: age ? parseInt(age.toString()) : null,
        skills: Array.isArray(skills) ? skills.map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
        stableId,
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

    return NextResponse.json({ horse }, { status: 201 });
  } catch (error) {
    console.error("Error creating horse:", error);
    return NextResponse.json(
      { error: "Failed to create horse" },
      { status: 500 }
    );
  }
}

