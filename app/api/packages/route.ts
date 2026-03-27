import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get('featured') === 'true';

    const whereClause = featuredOnly ? { isActive: true, isFeatured: true } : { isActive: true };

    const packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: { sortOrder: 'asc' },
    });
    
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const newPackage = await prisma.package.create({
      data: {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        packageType: data.packageType || "PRIVATE",
        duration: Number(data.duration),
        minPeople: data.minPeople ? Number(data.minPeople) : 1,
        maxPeople: Number(data.maxPeople),
        availableDays: data.availableDays || [],
        startTime: data.startTime || null,
        hasHorseRide: data.hasHorseRide ?? true,
        hasFood: data.hasFood ?? false,
        hasDancingShow: data.hasDancingShow ?? false,
        hasParty: data.hasParty ?? false,
        hasTransportation: data.hasTransportation ?? false,
        transportationType: data.transportationType || null,
        included: data.included || [],
        highlights: data.highlights || [],
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        sortOrder: Number(data.sortOrder ?? 0),
        stableId: data.stableId || null,
        minLeadTimeHours: data.minLeadTimeHours !== undefined ? Number(data.minLeadTimeHours) : 8,
      },
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error("Failed to create package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
