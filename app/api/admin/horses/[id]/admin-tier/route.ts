import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update horse admin tier (admin only)
export async function PATCH(
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
        const { adminTier } = body;

        // Validate adminTier value
        if (adminTier !== null && adminTier !== undefined && adminTier !== "") {
            const validTiers = ["Beginner", "Intermediate", "Advanced"];
            if (!validTiers.includes(adminTier)) {
                return NextResponse.json(
                    { error: "Invalid admin tier. Must be Beginner, Intermediate, or Advanced" },
                    { status: 400 }
                );
            }
        }

        // Update horse admin tier
        const updatedHorse = await prisma.horse.update({
            where: { id: params.id },
            data: {
                adminTier: adminTier || null,
            },
            select: {
                id: true,
                name: true,
                adminTier: true,
            },
        });

        return NextResponse.json({
            success: true,
            horse: updatedHorse,
            message: "Admin tier updated successfully",
        });
    } catch (error) {
        console.error("Error updating admin tier:", error);
        return NextResponse.json(
            { error: "Failed to update admin tier" },
            { status: 500 }
        );
    }
}

