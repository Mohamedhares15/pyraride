import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get friends list and pending requests
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get all friends (accepted)
        const friends = await prisma.friend.findMany({
            where: {
                OR: [
                    { senderId: userId, status: "accepted" },
                    { receiverId: userId, status: "accepted" },
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                        role: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                        role: true,
                    },
                },
            },
        });

        // Get pending requests received
        const pendingReceived = await prisma.friend.findMany({
            where: {
                receiverId: userId,
                status: "pending",
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        // Get pending requests sent
        const pendingSent = await prisma.friend.findMany({
            where: {
                senderId: userId,
                status: "pending",
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profilePhoto: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        // Format friends list (get the other user from sender/receiver)
        const friendsList = friends.map((f) => {
            const friend = f.senderId === userId ? f.receiver : f.sender;
            return {
                id: f.id,
                friendId: friend.id,
                fullName: friend.fullName,
                email: friend.email,
                profilePhoto: friend.profilePhoto || friend.profileImageUrl,
                role: friend.role,
                createdAt: f.createdAt,
            };
        });

        return NextResponse.json({
            friends: friendsList,
            pendingReceived: pendingReceived.map((p) => ({
                id: p.id,
                senderId: p.sender.id,
                fullName: p.sender.fullName,
                email: p.sender.email,
                profilePhoto: p.sender.profilePhoto || p.sender.profileImageUrl,
                createdAt: p.createdAt,
            })),
            pendingSent: pendingSent.map((p) => ({
                id: p.id,
                receiverId: p.receiver.id,
                fullName: p.receiver.fullName,
                email: p.receiver.email,
                profilePhoto: p.receiver.profilePhoto || p.receiver.profileImageUrl,
                createdAt: p.createdAt,
            })),
        });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return NextResponse.json(
            { error: "Failed to fetch friends" },
            { status: 500 }
        );
    }
}

// Send friend request
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { receiverId } = body;

        if (!receiverId) {
            return NextResponse.json(
                { error: "Receiver ID is required" },
                { status: 400 }
            );
        }

        if (receiverId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot send friend request to yourself" },
                { status: 400 }
            );
        }

        // Check if friendship already exists
        const existingFriend = await prisma.friend.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId },
                    { senderId: receiverId, receiverId: session.user.id },
                ],
            },
        });

        if (existingFriend) {
            return NextResponse.json(
                { error: "Friendship already exists or pending" },
                { status: 400 }
            );
        }

        // Create friend request
        const friend = await prisma.friend.create({
            data: {
                senderId: session.user.id,
                receiverId,
                status: "pending",
            },
        });

        return NextResponse.json({ success: true, friend });
    } catch (error) {
        console.error("Error sending friend request:", error);
        return NextResponse.json(
            { error: "Failed to send friend request" },
            { status: 500 }
        );
    }
}
