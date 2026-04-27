import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH: update horse owner notes or temporary unavailability (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { horseId: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "admin";

  // Verify ownership through the stable
  if (!isAdmin) {
    const horse = await prisma.horse.findUnique({
      where: { id: params.horseId },
      include: { stable: { select: { ownerId: true } } },
    });
    if (!horse || horse.stable.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  if (typeof body.ownerNotes === "string") {
    updateData.ownerNotes = body.ownerNotes.slice(0, 500) || null;
  }
  if (typeof body.isTemporarilyUnavailable === "boolean") {
    updateData.isTemporarilyUnavailable = body.isTemporarilyUnavailable;
    // Also update isActive based on the flag
    updateData.isActive = !body.isTemporarilyUnavailable;
  }

  const updated = await prisma.horse.update({
    where: { id: params.horseId },
    data: updateData,
    select: { id: true, ownerNotes: true, isTemporarilyUnavailable: true, isActive: true },
  });

  return NextResponse.json(updated);
}
