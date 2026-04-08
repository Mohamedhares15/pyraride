import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/academies/price-changes — List all price change requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const requests = await prisma.academyPriceChangeRequest.findMany({
      include: {
        academy: { select: { name: true, location: true } },
        captain: { select: { fullName: true, email: true } },
        reviewer: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching price changes:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// PATCH /api/admin/academies/price-changes — Approve or reject a price change
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const changeRequest = await prisma.academyPriceChangeRequest.findUnique({
      where: { id: requestId },
      include: { academy: true },
    });

    if (!changeRequest || changeRequest.status !== "pending") {
      return NextResponse.json({ error: "Request not found or already processed" }, { status: 404 });
    }

    if (action === "approve") {
      await prisma.$transaction([
        // Update the price change request status
        prisma.academyPriceChangeRequest.update({
          where: { id: requestId },
          data: {
            status: "approved",
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
          },
        }),
        // Actually update the program price
        prisma.trainingProgram.update({
          where: { id: changeRequest.programId },
          data: { price: changeRequest.proposedPrice },
        }),
      ]);

      // Notify captain
      await prisma.notification.create({
        data: {
          userId: changeRequest.captainId,
          type: "price_change_approved",
          title: "Price Change Approved ✅",
          message: `Your price change request for ${changeRequest.academy.name} has been approved. New price: EGP ${changeRequest.proposedPrice}.`,
          data: { requestId },
        },
      });
    } else {
      await prisma.academyPriceChangeRequest.update({
        where: { id: requestId },
        data: {
          status: "rejected",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      });

      // Notify captain
      await prisma.notification.create({
        data: {
          userId: changeRequest.captainId,
          type: "price_change_rejected",
          title: "Price Change Rejected ❌",
          message: `Your price change request for ${changeRequest.academy.name} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
          data: { requestId },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing price change:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
