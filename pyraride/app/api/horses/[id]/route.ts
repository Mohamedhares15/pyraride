import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        { error: "Unauthorized: You don't own this horse" },
        { status: 403 }
      );
    }

    // Check if horse has upcoming bookings
    const upcomingBookings = await prisma.booking.count({
      where: {
        horseId: horse.id,
        status: "confirmed",
        startTime: {
          gte: new Date(),
        },
      },
    });

    if (upcomingBookings > 0) {
      // Soft delete - mark as inactive instead
      await prisma.horse.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: "Horse marked as inactive due to upcoming bookings",
      });
    }

    // Hard delete if no upcoming bookings
    await prisma.horse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Horse deleted successfully" });
  } catch (error) {
    console.error("Error deleting horse:", error);
    return NextResponse.json(
      { error: "Failed to delete horse" },
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
        { error: "Unauthorized: You don't own this horse" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      imageUrls,
      age,
      skills,
      pricePerHour,
      isActive,
    } = body;

    const updatedHorse = await prisma.horse.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrls && { imageUrls }),
        ...(age !== undefined && { age: age ? parseInt(age) : null }),
        ...(skills !== undefined && { skills }),
        ...(pricePerHour !== undefined && {
          pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ horse: updatedHorse });
  } catch (error) {
    console.error("Error updating horse:", error);
    return NextResponse.json(
      { error: "Failed to update horse" },
      { status: 500 }
    );
  }
}

