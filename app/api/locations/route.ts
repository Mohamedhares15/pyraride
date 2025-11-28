import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
            },
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
