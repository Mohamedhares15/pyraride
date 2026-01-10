import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { token } = await req.json();
        if (!token) {
            return new NextResponse("Missing token", { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { pushToken: token },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving push token:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
