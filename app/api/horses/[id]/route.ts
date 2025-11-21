import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the horse and verify ownership
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      include: {
        stable: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!horse) {
      return NextResponse.json(
        { error: "Horse not found" },
        { status: 404 }
      );
    }

    if (horse.stable.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - this horse does not belong to your stable" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, imageUrls, pricePerHour, age, skills, availabilityStatus } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Validate image URLs if provided
    if (imageUrls && imageUrls.length > 0) {
      const invalidUrls = imageUrls.filter(
        (url: string) => !url.startsWith("http://") && !url.startsWith("https://")
      );
      if (invalidUrls.length > 0) {
        return NextResponse.json(
          { error: "Please provide valid image URLs (must start with http:// or https://)" },
          { status: 400 }
        );
      }
    }

    // Update horse
    const updatedHorse = await prisma.horse.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description.trim(),
        imageUrls: imageUrls || horse.imageUrls,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour.toString()) : null,
        age: age ? parseInt(age.toString()) : null,
        skills: Array.isArray(skills) ? skills.map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
        availabilityStatus: availabilityStatus || horse.availabilityStatus || "available",
      },
    });

    // Update HorseMedia entries if images changed
    if (imageUrls && imageUrls.length > 0) {
      // Delete old media entries
      await prisma.horseMedia.deleteMany({
        where: { horseId: params.id },
      });

      // Create new media entries
      const mediaPromises = imageUrls.map((url: string, index: number) =>
        prisma.horseMedia.create({
          data: {
            horseId: params.id,
            type: "image",
            url: url,
            sortOrder: index + 1,
          },
        })
      );

      await Promise.all(mediaPromises);
    }

    return NextResponse.json({ horse: updatedHorse });
  } catch (error) {
    console.error("Error updating horse:", error);
    return NextResponse.json(
      { error: "Failed to update horse" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the horse and verify ownership
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      include: {
        stable: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!horse) {
      return NextResponse.json(
        { error: "Horse not found" },
        { status: 404 }
      );
    }

    if (horse.stable.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - this horse does not belong to your stable" },
        { status: 403 }
      );
    }

    // Delete the horse (cascade will delete related media and bookings)
    await prisma.horse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting horse:", error);
    return NextResponse.json(
      { error: "Failed to delete horse" },
      { status: 500 }
    );
  }
}
