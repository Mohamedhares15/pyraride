import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const locations = await prisma.location.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { name } = await req.json();
        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const location = await prisma.location.create({
            data: { name },
        });

        return NextResponse.json(location);
    } catch (error) {
        console.error("Error creating location:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
