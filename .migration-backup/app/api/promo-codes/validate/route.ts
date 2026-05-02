import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json(
                { error: "Promo code is required" },
                { status: 400 }
            );
        }

        const normalizedCode = code.toUpperCase().trim();

        // Find promo code
        const promoCode = await prisma.promoCode.findUnique({
            where: { code: normalizedCode },
        });

        if (!promoCode) {
            return NextResponse.json(
                { valid: false, error: "Invalid promo code" },
                { status: 404 }
            );
        }

        // Check if active
        if (!promoCode.isActive) {
            return NextResponse.json(
                { valid: false, error: "This promo code is no longer active" },
                { status: 400 }
            );
        }

        // Check expiration
        if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
            return NextResponse.json(
                { valid: false, error: "This promo code has expired" },
                { status: 400 }
            );
        }

        // Check usage limits
        if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
            return NextResponse.json(
                { valid: false, error: "This promo code has reached its usage limit" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            valid: true,
            id: promoCode.id,
            code: promoCode.code,
            discountType: promoCode.discountType,
            discountAmount: parseFloat(promoCode.discountAmount.toString()),
        });
    } catch (error) {
        console.error("Error validating promo code:", error);
        return NextResponse.json(
            { error: "Failed to validate promo code" },
            { status: 500 }
        );
    }
}
