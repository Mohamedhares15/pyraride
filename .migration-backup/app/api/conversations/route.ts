import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get user's conversations
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: session.user.id },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                        role: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        content: true,
                        createdAt: true,
                        senderId: true,
                        read: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        // Format conversations
        const formattedConversations = conversations.map((conv) => {
            const otherParticipant = conv.participants.find(
                (p) => p.id !== session.user.id
            );
            const lastMessage = conv.messages[0];

            return {
                id: conv.id,
                otherUser: otherParticipant
                    ? {
                        id: otherParticipant.id,
                        fullName: otherParticipant.fullName,
                        profilePhoto:
                            otherParticipant.profilePhoto ||
                            otherParticipant.profileImageUrl,
                        role: otherParticipant.role,
                    }
                    : null,
                lastMessage: lastMessage
                    ? {
                        content: lastMessage.content,
                        createdAt: lastMessage.createdAt,
                        isOwn: lastMessage.senderId === session.user.id,
                        read: lastMessage.read,
                    }
                    : null,
                updatedAt: conv.updatedAt,
            };
        });

        return NextResponse.json({ conversations: formattedConversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversations" },
            { status: 500 }
        );
    }
}

// Create or get existing conversation
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot start conversation with yourself" },
                { status: 400 }
            );
        }

        // Check if users can message each other
        // Rule: Must be friends OR have a booking relationship
        const canMessage = await checkMessagingPermission(session.user.id, userId);
        if (!canMessage) {
            return NextResponse.json(
                { error: "You can only message friends or stables you've booked with" },
                { status: 403 }
            );
        }

        // Check if conversation already exists
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: session.user.id } } },
                    { participants: { some: { id: userId } } },
                ],
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        if (existingConversation) {
            return NextResponse.json({
                conversation: existingConversation,
                isNew: false,
            });
        }

        // Create new conversation
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: session.user.id }, { id: userId }],
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({
            conversation: newConversation,
            isNew: true,
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Failed to create conversation" },
            { status: 500 }
        );
    }
}

// Helper function to check if users can message each other
async function checkMessagingPermission(
    userId1: string,
    userId2: string
): Promise<boolean> {
    // Check if they are friends
    const friendship = await prisma.friend.findFirst({
        where: {
            OR: [
                { senderId: userId1, receiverId: userId2, status: "accepted" },
                { senderId: userId2, receiverId: userId1, status: "accepted" },
            ],
        },
    });

    if (friendship) return true;

    // Check if there's a booking relationship
    // Rider→Stable Owner who owns stable where rider booked
    const user1 = await prisma.user.findUnique({
        where: { id: userId1 },
        select: { role: true, stableId: true },
    });

    const user2 = await prisma.user.findUnique({
        where: { id: userId2 },
        select: { role: true, stableId: true },
    });

    if (!user1 || !user2) return false;

    // If one is a rider and one is a stable owner
    if (user1.role === "rider" && user2.role === "stable_owner") {
        // Check if rider booked at owner's stable
        const booking = await prisma.booking.findFirst({
            where: {
                riderId: userId1,
                stable: {
                    ownerId: userId2,
                },
            },
        });
        if (booking) return true;
    }

    if (user2.role === "rider" && user1.role === "stable_owner") {
        const booking = await prisma.booking.findFirst({
            where: {
                riderId: userId2,
                stable: {
                    ownerId: userId1,
                },
            },
        });
        if (booking) return true;
    }

    return false;
}
