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
