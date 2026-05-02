import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

// GET active transport zones (Public for checkout)
export async function GET() {
  try {
    const zones = await prisma.transportZone.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: "asc",
      },
    });

    return NextResponse.json(zones);
  } catch (error: any) {
    console.error("Error fetching transport zones", error);
    return NextResponse.json(
      { error: "Failed to fetch transport zones" },
      { status: 500 }
    );
  }
}

// POST new transport zone (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, price, isActive } = await req.json();

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const zone = await prisma.transportZone.create({
      data: {
        name,
        price: typeof price === 'string' ? parseFloat(price) : price,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(zone);
  } catch (error: any) {
    console.error("Error creating transport zone", error);
    return NextResponse.json(
      { error: "Failed to create transport zone" },
      { status: 500 }
    );
  }
}
