import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: retrieve the current announcement banner
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const stable = await prisma.stable.findUnique({
    where: { id: params.id },
    select: { announcementBanner: true },
  });

  if (!stable) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ banner: stable.announcementBanner || "" });
}

// POST: set the announcement banner (owner or admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "admin";

  // Verify ownership
  if (!isAdmin) {
    const stable = await prisma.stable.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });
    if (!stable || stable.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json();
  const banner: string = (body.banner ?? "").slice(0, 300);

  const updated = await prisma.stable.update({
    where: { id: params.id },
    data: { announcementBanner: banner || null },
    select: { announcementBanner: true },
  });

  return NextResponse.json({ banner: updated.announcementBanner || "" });
}
