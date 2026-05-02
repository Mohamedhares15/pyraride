import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { content } = await req.json();
        const conversationId = params.id;

        if (!content) {
            return new NextResponse("Missing content", { status: 400 });
        }

        // Verify participation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });

        if (!conversation || !conversation.participants.some(p => p.id === session.user.id)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                conversationId,
                senderId: session.user.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        // Update conversation updatedAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        // Send Push Notification to other participants
        const otherParticipants = conversation.participants.filter(p => p.id !== session.user.id);

        // Import dynamically to avoid circular deps or server/client issues if any
        const { sendPushNotification } = await import("@/lib/firebase-admin");

        for (const participant of otherParticipants) {
            // We need to fetch the user's pushToken. 
            // Since 'participants' in conversation include might not have pushToken if not selected,
            // we should fetch it or update the include above.
            // Let's fetch it specifically to be safe and get the latest.
            const recipient = await prisma.user.findUnique({
                where: { id: participant.id },
                select: { pushToken: true }
            });

            if (recipient?.pushToken) {
                await sendPushNotification(
                    recipient.pushToken,
                    session.user.name || "New Message",
                    content.substring(0, 100), // Truncate body
                    {
                        type: "chat",
                        conversationId,
                        senderId: session.user.id
                    }
                );
            }
        }

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
