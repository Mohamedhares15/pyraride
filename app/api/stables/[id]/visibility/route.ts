import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/stables/[id]/visibility
 * Admin-only endpoint to toggle stable visibility
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    // Only admins can toggle visibility
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { isHidden } = body;

    // Validate input
    if (typeof isHidden !== "boolean") {
      return NextResponse.json(
        { error: "isHidden must be a boolean" },
        { status: 400 }
      );
    }

    // Update stable visibility
    const stable = await prisma.stable.update({
      where: { id: params.id },
      data: { isHidden },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      stable: {
        id: stable.id,
        name: stable.name,
        isHidden: stable.isHidden,
        status: stable.status,
        owner: stable.owner,
      },
      message: stable.isHidden
        ? "Stable is now hidden from public view"
        : "Stable is now visible to public",
    });
  } catch (error: any) {
    console.error("Error updating stable visibility:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Stable not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update stable visibility" },
      { status: 500 }
    );
  }
}

