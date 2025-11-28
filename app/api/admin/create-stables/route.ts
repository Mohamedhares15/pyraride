/**
 * Admin API route to create real stable owners
 * POST /api/admin/create-stables
 * This creates the 4 real stables provided by the owner
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Simple authentication check (you can enhance this)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.ADMIN_TOKEN || "PyraRide2024Secret";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stableOwners = [
      {
        email: "beitzeina@pyrarides.com",
        fullName: "Mohamed el bana",
        phoneNumber: "+201064059606",
        stable: {
          name: "Beit Zeina",
          description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
          location: "Saqqara",
          address: "https://maps.app.goo.gl/G9JbNGyzqJvwnRuQ9?g_st=ipc",
        },
      },
      {
        email: "hooves@pyrarides.com",
        fullName: "Arafa",
        phoneNumber: "+201070403443",
        stable: {
          name: "Hooves",
          description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
          location: "Saqqara",
          address: "https://maps.app.goo.gl/tHu8mNYAUB7tssFY7?g_st=ipc",
        },
      },
      {
        email: "aseel@pyrarides.com",
        fullName: "Ibrahim",
        phoneNumber: "+201553645745",
        stable: {
          name: "Aseel",
          description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
          location: "Saqqara",
          address: "https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc",
        },
      },
      {
        email: "alaa@pyrarides.com",
        fullName: "Alaa",
        phoneNumber: "+20100622105",
        stable: {
          name: "Alaa",
          description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
          location: "Saqqara",
          address: "https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc",
        },
      },
    ];

    // Generate a secure password for all owners
    const defaultPassword = await bcrypt.hash("PyraRide2024!", 10);

    const results = [];

    for (const ownerData of stableOwners) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: ownerData.email },
        });

        if (existingUser) {
          // Update user info
          const user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              fullName: ownerData.fullName,
              phoneNumber: ownerData.phoneNumber,
              role: "stable_owner",
            },
          });

          // Check if stable exists
          const existingStable = await prisma.stable.findFirst({
            where: { ownerId: user.id },
          });

          if (existingStable) {
            const updatedStable = await prisma.stable.update({
              where: { id: existingStable.id },
              data: {
                name: ownerData.stable.name,
                description: ownerData.stable.description,
                location: ownerData.stable.location,
                address: ownerData.stable.address,
                status: "approved",
              },
            });
            results.push({
              email: ownerData.email,
              action: "updated",
              stable: updatedStable.name,
            });
          } else {
            const newStable = await prisma.stable.create({
              data: {
                name: ownerData.stable.name,
                description: ownerData.stable.description,
                location: ownerData.stable.location,
                address: ownerData.stable.address,
                ownerId: user.id,
                status: "approved",
              },
            });
            results.push({
              email: ownerData.email,
              action: "created_stable",
              stable: newStable.name,
            });
          }
        } else {
          // Create new user
          const user = await prisma.user.create({
            data: {
              email: ownerData.email,
              passwordHash: defaultPassword,
              fullName: ownerData.fullName,
              phoneNumber: ownerData.phoneNumber,
              role: "stable_owner",
            },
          });

          // Create stable
          const stable = await prisma.stable.create({
            data: {
              name: ownerData.stable.name,
              description: ownerData.stable.description,
              location: ownerData.stable.location,
              address: ownerData.stable.address,
              ownerId: user.id,
              status: "approved",
            },
          });

          results.push({
            email: ownerData.email,
            action: "created",
            stable: stable.name,
          });
        }
      } catch (error) {
        results.push({
          email: ownerData.email,
          action: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Stable owners creation complete",
      results,
      credentials: {
        defaultPassword: "PyraRide2024!",
        note: "Owners should change this password on first login",
      },
    });
  } catch (error) {
    console.error("Error creating stables:", error);
    return NextResponse.json(
      {
        error: "Failed to create stables",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

