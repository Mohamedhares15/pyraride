import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch all horses for admin (with adminTier field)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            );
        }

        const horses = await prisma.horse.findMany({
            select: {
                id: true,
                name: true,
                adminTier: true,
                firstTimeFriendly: true,
                stable: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                stable: {
                    name: "asc",
                },
            },
        });

        return NextResponse.json({ horses });
    } catch (error) {
        console.error("Error fetching horses:", error);
        return NextResponse.json(
            { error: "Failed to fetch horses" },
            { status: 500 }
        );
    }
}

