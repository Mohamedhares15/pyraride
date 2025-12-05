import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        const userId = params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true,
                profileImageUrl: true,
                role: true,
                rankPoints: true,
                createdAt: true,
                rank: {
                    select: {
                        name: true,
                        icon: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                        reviews: true,
                    },
                },
                // Get recent bookings for own profile or if admin
                bookings: session?.user?.id === userId || session?.user?.role === "admin" ? {
                    select: {
                        id: true,
                        startTime: true,
                        status: true,
                        horse: { select: { name: true } },
                        stable: { select: { name: true } },
                    },
                    orderBy: { startTime: "desc" },
                    take: 5,
                } : undefined,
                // Check if owns a stable
                ownedStables: {
                    select: {
                        id: true,
                        name: true,
                    },
                    take: 1,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check friendship status if logged in
        let friendshipStatus = null;
        if (session?.user?.id && session.user.id !== userId) {
            const friendship = await prisma.friend.findFirst({
                where: {
                    OR: [
                        { senderId: session.user.id, receiverId: userId },
                        { senderId: userId, receiverId: session.user.id },
                    ],
                },
            });

            if (friendship) {
                friendshipStatus = {
                    status: friendship.status,
                    isSender: friendship.senderId === session.user.id,
                };
            }
        }

        return NextResponse.json({
            user: {
                ...user,
                profilePhoto: user.profilePhoto || user.profileImageUrl,
            },
            friendshipStatus,
            isOwnProfile: session?.user?.id === userId,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch user profile" },
            { status: 500 }
        );
    }
}

// Update profile photo
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Can only update own profile
        if (session.user.id !== params.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { profilePhoto } = body;

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: { profilePhoto },
            select: {
                id: true,
                profilePhoto: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
