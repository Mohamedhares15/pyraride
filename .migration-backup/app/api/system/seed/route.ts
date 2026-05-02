import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const leagues = ["wood", "bronze", "silver", "gold", "platinum", "elite", "champion"];
        const now = new Date();
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 21); // 3 weeks

        const results = [];

        for (const name of leagues) {
            const existing = await prisma.league.findFirst({
                where: {
                    name: name as any,
                    status: "active",
                    startDate: { lte: now },
                    endDate: { gte: now },
                },
            });

            if (!existing) {
                const newLeague = await prisma.league.create({
                    data: {
                        name: name as any,
                        startDate,
                        endDate,
                        status: "active",
                    },
                });
                results.push(`Created ${name}`);
            } else {
                results.push(`Existing ${name}`);
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
