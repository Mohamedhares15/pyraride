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
    const { stableId, name, description, imageUrls, pricePerHour, age, skills, availabilityStatus } = body;

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
        { error: "Missing required fields: name, description, and stable ID are required" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Horse name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters to help riders understand the horse better" },
        { status: 400 }
      );
    }

    // Require at least one image
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one horse image is required for riders to see the horse" },
        { status: 400 }
      );
    }

    // Validate image URLs are valid
    const validImageUrls = imageUrls.filter((url: string) =>
      url && typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))
    );

    if (validImageUrls.length === 0) {
      return NextResponse.json(
        { error: "Please provide valid image URLs (must start with http:// or https://)" },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (pricePerHour !== null && pricePerHour !== undefined) {
      const price = parseFloat(pricePerHour.toString());
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: "Price per hour must be a positive number" },
          { status: 400 }
        );
      }
    }

    // Validate age if provided
    if (age !== null && age !== undefined) {
      const horseAge = parseInt(age.toString());
      if (isNaN(horseAge) || horseAge < 1 || horseAge > 30) {
        return NextResponse.json(
          { error: "Age must be between 1 and 30 years" },
          { status: 400 }
        );
      }
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
        availabilityStatus: availabilityStatus || "available",
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

