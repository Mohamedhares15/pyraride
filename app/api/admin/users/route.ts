import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users
 * Admin-only endpoint to list all users (especially stable owners)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    // Only admins can access this endpoint
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role"); // Optional filter by role
    const includeStable = searchParams.get("includeStable") === "true";

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      include: includeStable
        ? {
            stable: {
              select: {
                id: true,
                name: true,
                location: true,
                status: true,
                isHidden: true,
                _count: {
                  select: {
                    horses: true,
                    bookings: true,
                  },
                },
              },
            },
          }
        : undefined,
      orderBy: {
        email: "asc",
      },
    });

    // Return user data without password hash for security
    const safeUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      hasPremiumAI: user.hasPremiumAI,
      premiumAIExpiresAt: user.premiumAIExpiresAt,
      createdAt: user.createdAt,
      stable: (user as any).stable || null,
      hasPassword: !!user.passwordHash, // Just indicate if password is set
    }));

    return NextResponse.json({
      users: safeUsers,
      total: safeUsers.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}


