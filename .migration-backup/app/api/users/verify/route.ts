import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { email, identifier } = body;
        const searchEmail = email || identifier;

        if (!searchEmail) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: searchEmail },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user }, {
            headers: { "X-Version": "2.0.0" }
        });
    } catch (error) {
        console.error("Error verifying user:", error);
        return NextResponse.json(
            { error: "Failed to verify user" },
            { status: 500 }
        );
    }
}
