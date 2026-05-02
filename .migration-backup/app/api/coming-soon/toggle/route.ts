import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Only admins can toggle coming soon mode
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { enabled } = await req.json();
    
    // Note: In a real implementation, you'd want to store this in a database
    // For now, we'll just return the environment variable state
    // To actually toggle, you'd need to set COMING_SOON environment variable
    
    return NextResponse.json({
      message: "Coming soon mode toggle requires environment variable change",
      current: process.env.COMING_SOON === "true",
      requested: enabled,
      note: "Set COMING_SOON=true in Vercel environment variables to enable",
    });
  } catch (error) {
    console.error("Error toggling coming soon:", error);
    return NextResponse.json(
      { error: "Failed to toggle coming soon mode" },
      { status: 500 }
    );
  }
}

