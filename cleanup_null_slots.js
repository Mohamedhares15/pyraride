
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupNullHorseSlots() {
    console.log('Starting cleanup of slots with null horseId...');

    const count = await prisma.availabilitySlot.count({
        where: {
            horseId: null
        }
    });

    console.log(`Found ${count} slots with null horseId.`);

    if (count > 0) {
        const deleted = await prisma.availabilitySlot.deleteMany({
            where: {
                horseId: null
            }
        });
        console.log(`Deleted ${deleted.count} slots.`);
    } else {
        console.log('No slots to delete.');
    }
}

cleanupNullHorseSlots()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
