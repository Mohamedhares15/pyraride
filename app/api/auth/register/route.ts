import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  normalizePhoneNumber,
} from "@/lib/auth-utils";
import { ensureAuthSchema } from "@/lib/ensure-auth-schema";

export async function POST(req: NextRequest) {
  try {
    await ensureAuthSchema();

    const body = await req.json();
    const { email, password, fullName, phoneNumber, role, gender, initialTier } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Please provide a valid phone number" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const existingPhoneUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (existingPhoneUser) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Calculate initial rank points based on selected tier
    // Only for riders, stable_owners and admins default to 1400
    let initialRankPoints = 1400;
    if ((role || "rider") === "rider" && initialTier) {
      switch (initialTier.toLowerCase()) {
        case "beginner":
          initialRankPoints = 650; // Middle of 0-1300 range
          break;
        case "intermediate":
          initialRankPoints = 1500; // Middle of 1301-1700 range
          break;
        case "advanced":
          initialRankPoints = 1850; // Above 1701 threshold
          break;
        default:
          initialRankPoints = 1400;
      }
    }

    // Set initial league to "wood" for new riders
    let woodLeague = null;
    if ((role || "rider") === "rider") {
      // Find or create the current "wood" league
      const now = new Date();
      woodLeague = await prisma.league.findFirst({
        where: {
          name: "wood",
          status: "active",
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      // If no active wood league exists, create one (2 weeks duration)
      if (!woodLeague) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 14); // 2 weeks

        woodLeague = await prisma.league.create({
          data: {
            name: "wood" as any, // LeagueName enum
            startDate,
            endDate,
            status: "active" as any, // LeagueStatus enum
          },
        });
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: normalizedPhone,
        passwordHash,
        fullName,
        role: role || "rider",
        gender: gender || null,
        rankPoints: initialRankPoints,
        currentLeagueId: woodLeague?.id || null,
      },
    });

    // Return user data (without password hash)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Failed to register user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

