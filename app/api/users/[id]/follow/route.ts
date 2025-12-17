import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followerId = session.user.id;
    const followingId = params.id;

    if (followerId === followingId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      return NextResponse.json({ isFollowing: false });
    } else {
      // Follow
      await prisma.userFollow.create({
        data: {
          followerId,
          followingId
        }
      });
      return NextResponse.json({ isFollowing: true });
    }

  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
