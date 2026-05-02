import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/stables/[id]/commission
 * Admin-only endpoint to update commission rate for a stable
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    // Only admins can access this endpoint
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { commissionRate } = body;

    // Validate commission rate (must be between 0 and 1, e.g., 0.15 = 15%)
    if (commissionRate === undefined || commissionRate === null) {
      return NextResponse.json(
        { error: "Commission rate is required" },
        { status: 400 }
      );
    }

    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return NextResponse.json(
        { error: "Commission rate must be between 0 and 1 (e.g., 0.15 for 15%)" },
        { status: 400 }
      );
    }

    // Update stable commission rate
    const updatedStable = await prisma.stable.update({
      where: { id: params.id },
      data: { commissionRate: rate },
      select: {
        id: true,
        name: true,
        commissionRate: true,
      },
    });

    return NextResponse.json({
      success: true,
      stable: updatedStable,
      message: `Commission rate updated to ${(rate * 100).toFixed(1)}%`,
    });
  } catch (error: any) {
    console.error("Error updating commission rate:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Stable not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update commission rate" },
      { status: 500 }
    );
  }
}

