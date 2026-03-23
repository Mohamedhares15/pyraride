import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = typeof body.price === 'string' ? parseFloat(body.price) : body.price;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const zone = await prisma.transportZone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(zone);
  } catch (error: any) {
    console.error("Error updating transport zone", error);
    return NextResponse.json(
      { error: "Failed to update transport zone" },
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

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    await prisma.transportZone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting transport zone", error);
    return NextResponse.json(
      { error: "Failed to delete transport zone" },
      { status: 500 }
    );
  }
}
