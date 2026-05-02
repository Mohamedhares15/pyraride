import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

async function backfillSlugs() {
    console.log("Fetching stables with missing slugs...");
    const stables = await prisma.stable.findMany({
        where: { slug: null },
    });

    console.log(`Found ${stables.length} stables without a slug.`);

    for (const stable of stables) {
        let baseSlug = slugify(stable.name);
        if (!baseSlug) baseSlug = `stable-${stable.id.slice(0, 8)}`;
        let uniqueSlug = baseSlug;
        let counter = 1;

        // Ensure unique
        while (true) {
            const existing = await prisma.stable.findUnique({ where: { slug: uniqueSlug } });
            if (!existing) break;
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        await prisma.stable.update({
            where: { id: stable.id },
            data: { slug: uniqueSlug },
        });
        console.log(`Updated stable "${stable.name}" with slug => "${uniqueSlug}"`);
    }

    console.log("Backfill complete.");
    await prisma.$disconnect();
}

backfillSlugs().catch(e => {
    console.error(e);
    process.exit(1);
});
