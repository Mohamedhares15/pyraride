
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicates() {
    console.log('Starting duplicate cleanup...');

    const slots = await prisma.availabilitySlot.findMany({
        select: {
            id: true,
            stableId: true,
            horseId: true,
            date: true,
            startTime: true,
            isBooked: true, // Prefer keeping booked slots if duplicates exist
            bookingId: true
        }
    });

    const map = new Map();
    const toDelete = [];

    for (const slot of slots) {
        const key = `${slot.horseId}-${slot.startTime.toISOString()}`;

        if (map.has(key)) {
            const existing = map.get(key);

            // Logic to decide which one to keep
            // If existing is booked, keep it. If current is booked, keep current (replace existing).
            // If neither booked, keep existing (delete current).

            if (existing.isBooked) {
                toDelete.push(slot.id);
            } else if (slot.isBooked) {
                // Current is booked, existing is not. Delete existing, keep current.
                toDelete.push(existing.id);
                map.set(key, slot);
            } else {
                // Neither booked, delete current
                toDelete.push(slot.id);
            }
        } else {
            map.set(key, slot);
        }
    }

    console.log(`Found ${toDelete.length} duplicates to delete.`);

    if (toDelete.length > 0) {
        // Delete in chunks to avoid too many parameters error
        const chunkSize = 1000;
        for (let i = 0; i < toDelete.length; i += chunkSize) {
            const chunk = toDelete.slice(i, i + chunkSize);
            await prisma.availabilitySlot.deleteMany({
                where: {
                    id: { in: chunk }
                }
            });
            console.log(`Deleted chunk ${i / chunkSize + 1}`);
        }
        console.log('Cleanup complete.');
    } else {
        console.log('No duplicates found.');
    }
}

cleanupDuplicates()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
