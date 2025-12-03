import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { valid: false, message: "Promo code is required" },
                { status: 400 }
            );
        }

        // Temporary: Use hardcoded promo codes for testing until database connection is fixed
        const testPromoCodes = [
            {
                code: "WELCOME10",
                discountPercent: 10,
                isActive: true,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                currentUsageCount: 0,
                maxUsageCount: 100,
            },
            {
                code: "SUMMER20",
                discountPercent: 20,
                isActive: true,
                expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
                currentUsageCount: 0,
                maxUsageCount: 50,
            },
            {
                code: "EXPIRED",
                discountPercent: 15,
                isActive: true,
                expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                currentUsageCount: 0,
                maxUsageCount: null,
            },
        ];

        const promoCode = testPromoCodes.find(
            (p) => p.code === code.toUpperCase()
        );

        // TODO: Replace with database query once connection is fixed
        // const promoCode = await prisma.promoCode.findUnique({
        //   where: { code: code.toUpperCase() },
        // });

        // Code doesn't exist
        if (!promoCode) {
            return NextResponse.json(
                { valid: false, message: "Invalid promo code" },
                { status: 404 }
            );
        }

        // Code is inactive
        if (!promoCode.isActive) {
            return NextResponse.json(
                { valid: false, message: "This promo code is no longer active" },
                { status: 400 }
            );
        }

        // Code has expired
        if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
            return NextResponse.json(
                { valid: false, message: "This promo code has expired" },
                { status: 400 }
            );
        }

        // Code has reached max usage
        if (
            promoCode.maxUsageCount !== null &&
            promoCode.currentUsageCount >= promoCode.maxUsageCount
        ) {
            return NextResponse.json(
                {
                    valid: false,
                    message: "This promo code has reached its maximum usage limit",
                },
                { status: 400 }
            );
        }

        // Code is valid!
        return NextResponse.json({
            valid: true,
            discountPercent: promoCode.discountPercent,
            message: `Promo code applied! ${promoCode.discountPercent}% discount`,
        });
    } catch (error) {
        console.error("Promo code validation error:", error);
        return NextResponse.json(
            { valid: false, message: "Failed to validate promo code" },
            { status: 500 }
        );
    }
}
