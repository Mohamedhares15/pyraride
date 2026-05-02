import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Accept or reject friend request
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action } = body; // "accept" or "reject"

        if (!action || !["accept", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
        }

        // Find the friend request (the id param is the other user's ID, not the friend record ID)
        const friendRequest = await prisma.friend.findFirst({
            where: {
                senderId: params.id,
                receiverId: session.user.id,
                status: "pending",
            },
        });

        if (!friendRequest) {
            return NextResponse.json(
                { error: "Friend request not found" },
                { status: 404 }
            );
        }

        // Update the friend request
        const updatedFriend = await prisma.friend.update({
            where: { id: friendRequest.id },
            data: {
                status: action === "accept" ? "accepted" : "rejected",
            },
        });

        return NextResponse.json({
            success: true,
            status: updatedFriend.status,
        });
    } catch (error) {
        console.error("Error handling friend request:", error);
        return NextResponse.json(
            { error: "Failed to handle friend request" },
            { status: 500 }
        );
    }
}

// Remove friend
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const friendUserId = params.id;

        // Find and delete the friendship
        const friendship = await prisma.friend.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: friendUserId },
                    { senderId: friendUserId, receiverId: session.user.id },
                ],
            },
        });

        if (!friendship) {
            return NextResponse.json(
                { error: "Friendship not found" },
                { status: 404 }
            );
        }

        await prisma.friend.delete({
            where: { id: friendship.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing friend:", error);
        return NextResponse.json(
            { error: "Failed to remove friend" },
            { status: 500 }
        );
    }
}
