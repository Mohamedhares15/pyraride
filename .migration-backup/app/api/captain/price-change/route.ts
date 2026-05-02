import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/captain/price-change — Request a price change for a program (admin approval required)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const academy = await prisma.academy.findUnique({
      where: { captainId: session.user.id },
    });

    if (!academy) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { programId, proposedPrice, reason } = body;

    if (!programId || !proposedPrice) {
      return NextResponse.json(
        { error: "programId and proposedPrice are required" },
        { status: 400 }
      );
    }

    // Verify program belongs to captain's academy
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId },
    });

    if (!program || program.academyId !== academy.id) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Check for existing pending request
    const existingRequest = await prisma.academyPriceChangeRequest.findFirst({
      where: {
        programId,
        status: "pending",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending price change request already exists for this program" },
        { status: 409 }
      );
    }

    const changeRequest = await prisma.academyPriceChangeRequest.create({
      data: {
        academyId: academy.id,
        captainId: session.user.id,
        programId,
        currentPrice: program.price,
        proposedPrice,
        reason: reason || null,
      },
    });

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "price_change_request",
        title: "Price Change Request",
        message: `Captain requested price change for "${program.name}" at ${academy.name}: EGP ${program.price} → EGP ${proposedPrice}.`,
        data: {
          requestId: changeRequest.id,
          academyName: academy.name,
          programName: program.name,
          currentPrice: Number(program.price),
          proposedPrice: Number(proposedPrice),
        },
      })),
    });

    return NextResponse.json(changeRequest, { status: 201 });
  } catch (error) {
    console.error("Error submitting price change:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}

// GET /api/captain/price-change — Get all price change requests for captain's academy
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const academy = await prisma.academy.findUnique({
      where: { captainId: session.user.id },
    });

    if (!academy) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const requests = await prisma.academyPriceChangeRequest.findMany({
      where: { academyId: academy.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching price changes:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
