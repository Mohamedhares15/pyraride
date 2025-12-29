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
            caption: true,
            _count: {
              select: { likes: true }
            },
            likes: {
              where: { userId: session?.user?.id || "0" }, // "0" to return empty if no session
              select: { userId: true }
            }
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { bio, location } = body;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        bio,
        // location is not in User model yet, we need to handle it or add it.
        // The previous code showed location in the interface but it was removed from select because it didn't exist.
        // For now, let's just update bio. If location is needed, we must add it to schema.
        // User requested "world class", so let's stick to what we have or add location if critical.
        // The interface had location, but the select removed it.
        // Let's check schema again. User model has `bio` (added recently).
        // It does NOT have `location`.
        // I will only update bio for now to avoid schema errors.
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
