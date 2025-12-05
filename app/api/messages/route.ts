import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get messages for a conversation
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return NextResponse.json(
                { error: "Conversation ID is required" },
                { status: 400 }
            );
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: { id: session.user.id },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Get messages
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                content: true,
                createdAt: true,
                read: true,
                senderId: true,
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                read: false,
            },
            data: { read: true },
        });

        return NextResponse.json({
            messages: messages.map((m) => ({
                id: m.id,
                content: m.content,
                createdAt: m.createdAt,
                read: m.read,
                isOwn: m.senderId === session.user.id,
                sender: {
                    id: m.sender.id,
                    fullName: m.sender.fullName,
                    profilePhoto: m.sender.profilePhoto || m.sender.profileImageUrl,
                },
            })),
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

// Send a message
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { conversationId, content } = body;

        if (!conversationId || !content) {
            return NextResponse.json(
                { error: "Conversation ID and content are required" },
                { status: 400 }
            );
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: { id: session.user.id },
                },
            },
            include: {
                participants: true,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                senderId: session.user.id,
                conversationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({
            message: {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                read: message.read,
                isOwn: true,
                sender: {
                    id: message.sender.id,
                    fullName: message.sender.fullName,
                    profilePhoto:
                        message.sender.profilePhoto || message.sender.profileImageUrl,
                },
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
