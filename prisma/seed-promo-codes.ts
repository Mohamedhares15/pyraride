import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding promo codes...");

    // Create test promo codes
    const promoCodes = [
        {
            code: "WELCOME10",
            discountPercent: 10.0,
            isActive: true,
            maxUsageCount: 100,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        {
            code: "SUMMER20",
            discountPercent: 20.0,
            isActive: true,
            maxUsageCount: 50,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        },
        {
            code: "EXPIRED",
            discountPercent: 15.0,
            isActive: true,
            maxUsageCount: null,
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
    ];

    for (const promo of promoCodes) {
        await prisma.promoCode.upsert({
            where: { code: promo.code },
            update: promo,
            create: promo,
        });
        console.log(`✓ Created/Updated promo code: ${promo.code}`);
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
