import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const conversationId = params.id;

        // Verify participation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });

        if (!conversation || !conversation.participants.some(p => p.id === session.user.id)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Mark all messages from other participants as READ
        // We update messages where senderId != currentUserId and status != READ
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                status: { not: "READ" },
            },
            data: {
                status: "READ",
                read: true, // Legacy support
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
