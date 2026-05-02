import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const followers = await prisma.userFollow.findMany({
            where: { followingId: params.id },
            include: {
                follower: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({ followers });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 });
    }
}
