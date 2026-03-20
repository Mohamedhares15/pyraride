import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price !== undefined ? Number(data.price) : undefined,
        originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : undefined,
        packageType: data.packageType,
        duration: data.duration !== undefined ? Number(data.duration) : undefined,
        minPeople: data.minPeople !== undefined ? Number(data.minPeople) : undefined,
        maxPeople: data.maxPeople !== undefined ? Number(data.maxPeople) : undefined,
        availableDays: data.availableDays,
        startTime: data.startTime,
        hasHorseRide: data.hasHorseRide,
        hasFood: data.hasFood,
        hasDancingShow: data.hasDancingShow,
        hasParty: data.hasParty,
        hasTransportation: data.hasTransportation,
        transportationType: data.transportationType,
        included: data.included,
        highlights: data.highlights,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
      },
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error("Failed to update package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.package.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
