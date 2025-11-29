import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "cx_media")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const items = await prisma.galleryItem.findMany({
            where: { status: "pending" },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching pending gallery items:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending items" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "cx_media")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id, status } = await req.json();

        if (!id || !["approved", "rejected"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        const updatedItem = await prisma.galleryItem.update({
            where: { id },
            data: {
                status,
                reviewedBy: session.user.id,
            },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("Error updating gallery item:", error);
        return NextResponse.json(
            { error: "Failed to update item" },
            { status: 500 }
        );
    }
}
