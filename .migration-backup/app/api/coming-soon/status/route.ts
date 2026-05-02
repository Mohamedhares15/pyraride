import { NextResponse } from "next/server";

export async function GET() {
  const isComingSoon = process.env.COMING_SOON === "true";
  
  return NextResponse.json({
    enabled: isComingSoon,
  });
}

