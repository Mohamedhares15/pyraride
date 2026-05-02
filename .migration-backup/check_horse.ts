import { prisma } from './lib/prisma';

async function main() {
    const horse = await prisma.horse.findFirst({
        where: { name: 'Panda' },
        select: { id: true, name: true, skillLevel: true, adminTier: true }
    });
    console.log('HORSE_DATA:', JSON.stringify(horse, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
