import { prisma } from './lib/prisma';

async function main() {
    console.log("--- DEBUG DATA START ---");

    // Check Horse 'Panda'
    const horse = await prisma.horse.findFirst({
        where: { name: { contains: 'Panda' } },
        select: { id: true, name: true, skillLevel: true, adminTier: true }
    });
    console.log('HORSE:', JSON.stringify(horse, null, 2));

    // Check User 'test@test.com'
    const user = await prisma.user.findUnique({
        where: { email: 'test@test.com' },
        select: { id: true, email: true, rankPoints: true, rankId: true }
    });
    console.log('USER:', JSON.stringify(user, null, 2));

    console.log("--- DEBUG DATA END ---");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
