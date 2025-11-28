import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { isActive } = await req.json();
        const location = await prisma.location.update({
            where: { id: params.id },
            data: { isActive },
        });

        return NextResponse.json(location);
    } catch (error) {
        console.error("Error updating location:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await prisma.location.delete({
            where: { id: params.id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting location:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
