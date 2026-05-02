import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST - Reject a horse change request
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { reason } = body;

    // Get the change request
    const changeRequest = await prisma.horseChangeRequest.findUnique({
      where: { id: params.id },
    });

    if (!changeRequest) {
      return NextResponse.json(
        { error: "Change request not found" },
        { status: 404 }
      );
    }

    if (changeRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Change request is not pending" },
        { status: 400 }
      );
    }

    // Mark change request as rejected
    await prisma.horseChangeRequest.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: reason || "Change request rejected by admin",
      },
    });

    return NextResponse.json({
      message: "Change request rejected successfully",
      changeRequestId: params.id,
    });
  } catch (error) {
    console.error("Error rejecting change request:", error);
    return NextResponse.json(
      { error: "Failed to reject change request" },
      { status: 500 }
    );
  }
}

