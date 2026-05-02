import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: session.user.id,
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { participantIds } = body;

        if (!participantIds || !Array.isArray(participantIds)) {
            return NextResponse.json(
                { error: "Invalid participantIds" },
                { status: 400 }
            );
        }

        // Add current user to participants if not present
        const allParticipantIds = Array.from(
            new Set([...participantIds, session.user.id])
        );

        if (allParticipantIds.length < 2) {
            return NextResponse.json(
                { error: "At least 2 participants required" },
                { status: 400 }
            );
        }

        // Check if direct conversation already exists (for 2 participants)
        if (allParticipantIds.length === 2) {
            const otherUserId = allParticipantIds.find((id) => id !== session.user.id);

            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: session.user.id } } },
                        { participants: { some: { id: otherUserId } } },
                        // Ensure no other participants (strict check is harder in Prisma, but this is a good approximation for now)
                    ],
                },
                include: {
                    participants: true
                }
            });

            // Filter to ensure exact match of 2 participants
            if (existingConversation && existingConversation.participants.length === 2) {
                return NextResponse.json({ conversation: existingConversation });
            }
        }

        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: allParticipantIds.map((id) => ({ id })),
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
