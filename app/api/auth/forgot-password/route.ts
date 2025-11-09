import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  isValidEmail,
  normalizePhoneNumber,
  isValidPhoneNumber,
} from "@/lib/auth-utils";
import { sendPasswordResetEmail } from "@/lib/email";
import { ensureAuthSchema } from "@/lib/ensure-auth-schema";

export async function POST(req: NextRequest) {
  try {
    await ensureAuthSchema();

    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Identifier is required" },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();
    let user = null;

    if (isValidEmail(trimmedIdentifier)) {
      user = await prisma.user.findUnique({
        where: { email: trimmedIdentifier.toLowerCase() },
      });
    } else if (isValidPhoneNumber(trimmedIdentifier)) {
      const normalized = normalizePhoneNumber(trimmedIdentifier);
      user = await prisma.user.findUnique({
        where: { phoneNumber: normalized },
      });
    } else {
      // Invalid format; respond success to avoid leaking info
      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive instructions to reset your password shortly.",
        },
        { status: 200 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive instructions to reset your password shortly.",
        },
        { status: 200 }
      );
    }

    // Remove existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        id: crypto.randomUUID(),
        token,
        userId: user.id,
        expiresAt,
      },
    });

    if (user.email) {
      await sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName || user.email,
        resetLink: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`,
      });
    }

    return NextResponse.json(
      {
        message:
          "If an account exists, you will receive instructions to reset your password shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        error: "Unable to process password reset request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


