import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST - Approve a horse change request
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

    // Get the change request
    const changeRequest = await prisma.horseChangeRequest.findUnique({
      where: { id: params.id },
      include: {
        horse: true,
      },
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

    // Update the horse with approved changes
    const updateData: any = {};
    
    if (changeRequest.proposedDescription) {
      updateData.description = changeRequest.proposedDescription;
    }
    
    if (changeRequest.proposedPricePerHour !== null && changeRequest.proposedPricePerHour !== undefined) {
      updateData.pricePerHour = changeRequest.proposedPricePerHour;
    }
    
    if (changeRequest.proposedImageUrls && changeRequest.proposedImageUrls.length > 0) {
      updateData.imageUrls = changeRequest.proposedImageUrls;
      
      // Update HorseMedia entries
      await prisma.horseMedia.deleteMany({
        where: { horseId: changeRequest.horseId },
      });

      const mediaPromises = changeRequest.proposedImageUrls.map((url: string, index: number) =>
        prisma.horseMedia.create({
          data: {
            horseId: changeRequest.horseId,
            type: "image",
            url: url,
            sortOrder: index + 1,
          },
        })
      );

      await Promise.all(mediaPromises);
    }

    // Update horse if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.horse.update({
        where: { id: changeRequest.horseId },
        data: updateData,
      });
    }

    // Mark change request as approved
    await prisma.horseChangeRequest.update({
      where: { id: params.id },
      data: {
        status: "approved",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Change request approved successfully",
      changeRequestId: params.id,
    });
  } catch (error) {
    console.error("Error approving change request:", error);
    return NextResponse.json(
      { error: "Failed to approve change request" },
      { status: 500 }
    );
  }
}

