
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupFuzzyDuplicates() {
    console.log('Starting fuzzy duplicate cleanup...');

    const slots = await prisma.availabilitySlot.findMany({
        orderBy: {
            startTime: 'asc'
        }
    });

    const toDelete = [];
    const seen = new Map(); // Map<horseId, Slot[]>

    for (const slot of slots) {
        if (!slot.horseId) continue;

        const horseSlots = seen.get(slot.horseId) || [];
        const slotTime = new Date(slot.startTime).getTime();

        // Check for existing slot within 1 minute
        const duplicate = horseSlots.find(s => {
            const sTime = new Date(s.startTime).getTime();
            return Math.abs(sTime - slotTime) < 60000; // 1 minute tolerance
        });

        if (duplicate) {
            console.log(`Found duplicate for horse ${slot.horseId}: ${slot.startTime.toISOString()} vs ${duplicate.startTime.toISOString()}`);

            // Decide which to delete
            // Keep booked one
            if (duplicate.isBooked && !slot.isBooked) {
                toDelete.push(slot.id);
            } else if (!duplicate.isBooked && slot.isBooked) {
                toDelete.push(duplicate.id);
                // Replace in seen list
                const index = horseSlots.indexOf(duplicate);
                horseSlots[index] = slot;
            } else {
                // Neither booked (or both), keep the one with "cleaner" time (00 seconds)
                const sSeconds = new Date(slot.startTime).getSeconds();
                const dSeconds = new Date(duplicate.startTime).getSeconds();

                if (sSeconds === 0 && dSeconds !== 0) {
                    toDelete.push(duplicate.id);
                    const index = horseSlots.indexOf(duplicate);
                    horseSlots[index] = slot;
                } else {
                    toDelete.push(slot.id);
                }
            }
        } else {
            horseSlots.push(slot);
        }

        seen.set(slot.horseId, horseSlots);
    }

    console.log(`Found ${toDelete.length} fuzzy duplicates to delete.`);

    if (toDelete.length > 0) {
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

cleanupFuzzyDuplicates()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
