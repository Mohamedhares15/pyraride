import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const horse = await prisma.horse.findUnique({
      where: {
        id: params.id,
      },
      include: {
        stable: true,
        media: true,
      },
    });

    if (!horse) {
      return NextResponse.json(
        { error: "Horse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(horse);
  } catch (error) {
    console.error("Error fetching horse:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    const { name, imageUrls, pricePerHour, discountPercent, color, skills, availabilityStatus } = body;

    const ALLOWED_COLORS = ["Adham", "Azra2", "Ashkar", "Ahmar", "Pure White", "Palomino", "Pinto"];
    const ALLOWED_SKILLS = ["Adab", "Levade", "Impulsion", "Mettle", "Bolt", "Nerve", "Impeccable Manners", "Beginner Friendly"];

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate image URLs if provided
    if (imageUrls && imageUrls.length > 0) {
      const invalidUrls = imageUrls.filter(
        (url: string) => !url?.startsWith("http://") && !url?.startsWith("https://")
      );
      if (invalidUrls.length > 0) {
        return NextResponse.json(
          { error: "Please provide valid image URLs (must start with http:// or https://)" },
          { status: 400 }
        );
      }
    }

    // Validate color if provided
    if (color && !ALLOWED_COLORS.includes(color)) {
      return NextResponse.json(
        { error: `Invalid color. Allowed colors: ${ALLOWED_COLORS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate skills strictly
    if (!skills || !Array.isArray(skills) || skills.length < 1 || skills.length > 4) {
      return NextResponse.json(
        { error: "1 to 4 skills are required." },
        { status: 400 }
      );
    }
    const invalidSkills = skills.filter((s: string) => !ALLOWED_SKILLS.includes(s));
    if (invalidSkills.length > 0) {
      return NextResponse.json(
        { error: `Invalid skills provided: ${invalidSkills.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if price changed (needs admin approval)
    const priceChanged = pricePerHour !== undefined &&
      (horse.pricePerHour === null ||
        Math.abs(Number(pricePerHour) - Number(horse.pricePerHour)) > 0.01);

    // If price changed, create a change request instead of direct update
    if (priceChanged) {
      // Close any existing pending change requests for this horse
      await prisma.horseChangeRequest.updateMany({
        where: {
          horseId: params.id,
          status: "pending",
        },
        data: {
          status: "rejected",
          rejectionReason: "Superseded by new change request",
        },
      });

      // Create new change request
      const changeRequest = await prisma.horseChangeRequest.create({
        data: {
          horseId: params.id,
          proposedPricePerHour: priceChanged && pricePerHour ? parseFloat(pricePerHour.toString()) : null,
          proposedImageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : [],
          status: "pending",
        },
      });

      // adminTier is admin-only - stable owners cannot change it
      // Only admins can update adminTier through /api/admin/horses/[id]/admin-tier

      // Update non-restricted fields immediately (name, age, skills, availability, images)
      const updatedHorse = await prisma.horse.update({
        where: { id: params.id },
        data: {
          name: name.trim(),
          color: color || null,
          skills: skills,
          availabilityStatus: availabilityStatus || horse.availabilityStatus || "available",
          imageUrls: imageUrls || horse.imageUrls,
        },
      });

      // Update HorseMedia entries if images changed
      if (imageUrls && imageUrls.length > 0) {
        // Delete old media entries
        await prisma.horseMedia.deleteMany({
          where: { horseId: params.id },
        });

        // Create new media entries
        const mediaPromises = (imageUrls || []).map((url: string, index: number) =>
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

      return NextResponse.json({
        horse: updatedHorse,
        changeRequestCreated: true,
        changeRequestId: changeRequest.id,
        message: "Horse updated. Price changes are pending admin approval."
      });
    }

    // No restricted fields changed - update directly
    const updatedHorse = await prisma.horse.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        imageUrls: imageUrls || horse.imageUrls,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour.toString()) : horse.pricePerHour,
        discountPercent: discountPercent !== undefined ? (discountPercent ? parseInt(discountPercent.toString()) : null) : horse.discountPercent,
        color: color || null,
        skills: skills,
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
      const mediaPromises = (imageUrls || []).map((url: string, index: number) =>
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
