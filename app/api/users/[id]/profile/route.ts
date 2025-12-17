import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

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
        profileImageUrl: true,
        role: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            userPosts: true,
            bookings: { where: { status: "completed" } },
            reviews: true,
          }
        },
        userPosts: {
          orderBy: { createdAt: "desc" },
          take: 9,
          select: {
            id: true,
            imageUrl: true,
            caption: true
          }
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            stable: { select: { name: true } },
            reviewMedias: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user is following
    let isFollowing = false;
    if (session?.user?.id) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      });
      isFollowing = !!follow;
    }

    const userData = user as any;

    return NextResponse.json({
      user: {
        ...user,
        stats: {
          rides: userData._count.bookings,
          followers: userData._count.followers,
          following: userData._count.following,
          reviews: userData._count.reviews,
          posts: userData._count.userPosts
        },
        isFollowing
      }
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
