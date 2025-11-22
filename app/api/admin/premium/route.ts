import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Grant premium AI access to stable owners (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, expiresAt } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is a stable owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true, fullName: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Premium AI access can only be granted to stable owners" },
        { status: 400 }
      );
    }

    // Grant premium access
    const expirationDate = expiresAt ? new Date(expiresAt) : null;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasPremiumAI: true,
        premiumAIExpiresAt: expirationDate,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        hasPremiumAI: true,
        premiumAIExpiresAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Premium AI access granted to ${user.email}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error granting premium access:", error);
    return NextResponse.json(
      { error: "Failed to grant premium access" },
      { status: 500 }
    );
  }
}

// Revoke premium AI access (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasPremiumAI: false,
        premiumAIExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Premium AI access revoked from ${updatedUser.email}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error revoking premium access:", error);
    return NextResponse.json(
      { error: "Failed to revoke premium access" },
      { status: 500 }
    );
  }
}

// Get all premium subscribers (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const premiumUsers = await prisma.user.findMany({
      where: {
        hasPremiumAI: true,
        role: "stable_owner",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        hasPremiumAI: true,
        premiumAIExpiresAt: true,
        stable: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        premiumAIExpiresAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      premiumUsers,
      count: premiumUsers.length,
    });
  } catch (error) {
    console.error("Error fetching premium users:", error);
    return NextResponse.json(
      { error: "Failed to fetch premium users" },
      { status: 500 }
    );
  }
}

