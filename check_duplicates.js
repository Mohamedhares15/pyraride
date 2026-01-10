
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
    console.log('Checking for duplicate slots...');

    const slots = await prisma.availabilitySlot.findMany({
        select: {
            id: true,
            stableId: true,
            horseId: true,
            date: true,
            startTime: true,
        }
    });

    const map = new Map();
    let duplicates = 0;

    for (const slot of slots) {
        const key = `${slot.horseId}-${slot.startTime.toISOString()}`;
        if (map.has(key)) {
            duplicates++;
            console.log(`Duplicate found: ${key} (IDs: ${map.get(key)}, ${slot.id})`);
        } else {
            map.set(key, slot.id);
        }
    }

    console.log(`Total slots: ${slots.length}`);
    console.log(`Total duplicates: ${duplicates}`);
}

checkDuplicates()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
