import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAuthSchema } from "@/lib/ensure-auth-schema";
import {
  isValidEmail,
  normalizePhoneNumber,
  isValidPhoneNumber,
} from "@/lib/auth-utils";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getProfileImageDataUrl(
  value: unknown
): { dataUrl: string | null; error?: string } {
  if (value === null) {
    return { dataUrl: null };
  }
  if (typeof value !== "string") {
    return { dataUrl: "", error: "Invalid image format" };
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return { dataUrl: null };
  }

  const match = trimmed.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) {
    return { dataUrl: "", error: "Unsupported image format. Use PNG, JPG, or WEBP." };
  }

  const base64Payload = match[2];
  const approximateSize = (base64Payload.length * 3) / 4;
  if (approximateSize > MAX_IMAGE_SIZE_BYTES) {
    return { dataUrl: "", error: "Profile image must be smaller than 10MB." };
  }

  return { dataUrl: trimmed };
}

export async function GET() {
  try {
    await ensureAuthSchema();
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profileImageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureAuthSchema();
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updates: {
      email?: string;
      fullName?: string | null;
      phoneNumber?: string | null;
      profileImageUrl?: string | null;
    } = {};

    const email = sanitizeString(body.email);
    if (email) {
      const normalizedEmail = email.toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      const existingEmailUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingEmailUser && existingEmailUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 409 }
        );
      }

      updates.email = normalizedEmail;
    }

    const fullName = sanitizeString(body.fullName);
    if (fullName !== undefined) {
      updates.fullName = fullName ?? null;
    }

    if ("phoneNumber" in body) {
      const phoneRaw = sanitizeString(body.phoneNumber);
      if (phoneRaw) {
        if (!isValidPhoneNumber(phoneRaw)) {
          return NextResponse.json(
            { error: "Invalid phone number format" },
            { status: 400 }
          );
        }
        updates.phoneNumber = normalizePhoneNumber(phoneRaw);
      } else {
        updates.phoneNumber = null;
      }
    }

    if ("profileImageDataUrl" in body) {
      const { dataUrl, error } = getProfileImageDataUrl(body.profileImageDataUrl);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
      updates.profileImageUrl = dataUrl ?? null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id as string },
      data: updates,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profileImageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}


