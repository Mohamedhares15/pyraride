import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List all owners of the stable
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify user is an owner of this stable
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true, role: true },
        });

        if (!user || user.stableId !== params.id || user.role !== "stable_owner") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const owners = await prisma.user.findMany({
            where: {
                stableId: params.id,
                role: "stable_owner",
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                profileImageUrl: true,
            },
        });

        return NextResponse.json(owners);
    } catch (error) {
        console.error("Error fetching owners:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Add a new owner by email
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify requester is an owner
        const requester = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true, role: true },
        });

        if (!requester || requester.stableId !== params.id || requester.role !== "stable_owner") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { email } = await req.json();
        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        // Find user by email
        const userToAdd = await prisma.user.findUnique({
            where: { email },
        });

        if (!userToAdd) {
            return new NextResponse("User not found. They must register first.", { status: 404 });
        }

        if (userToAdd.stableId) {
            return new NextResponse("User is already assigned to a stable.", { status: 400 });
        }

        // Update user to be an owner of this stable
        const updatedUser = await prisma.user.update({
            where: { id: userToAdd.id },
            data: {
                stableId: params.id,
                role: "stable_owner",
            },
            select: {
                id: true,
                email: true,
                fullName: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error adding owner:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE: Remove an owner
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify requester is an owner
        const requester = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stableId: true, role: true },
        });

        if (!requester || requester.stableId !== params.id || requester.role !== "stable_owner") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const ownerIdToRemove = searchParams.get("ownerId");

        if (!ownerIdToRemove) {
            return new NextResponse("Owner ID is required", { status: 400 });
        }

        // Prevent removing oneself if it's the last owner (optional check, but good for safety)
        // For now, just prevent removing oneself to avoid lockout, unless there are others?
        // Let's just allow it, but maybe warn in UI.

        // Check if user to remove belongs to this stable
        const userToRemove = await prisma.user.findUnique({
            where: { id: ownerIdToRemove },
        });

        if (!userToRemove || userToRemove.stableId !== params.id) {
            return new NextResponse("User not found in this stable", { status: 404 });
        }

        // Remove stable association and downgrade role (or keep role? better to downgrade to rider)
        await prisma.user.update({
            where: { id: ownerIdToRemove },
            data: {
                stableId: null,
                role: "rider",
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error removing owner:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
