import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ users: [] });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { fullName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ],
                NOT: { id: session.user.id }, // Exclude self
            },
            select: {
                id: true,
                fullName: true,
                profileImageUrl: true,
                email: true,
            },
            take: 10,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
    }
}
