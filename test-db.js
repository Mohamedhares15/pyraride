const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('⏳ Attempting to connect to DB...');
    const count = await prisma.stable.count();
    console.log(`✅ Success! Found ${count} stables in DB.`);
  } catch (e) {
    console.error('❌ Database Connection Failed:');
    console.error(e.message);
    if (e.message.includes('sslmode')) {
      console.log('💡 Tip: Neon requires ?sslmode=require in the URL.');
    }
  } finally {
    await prisma.$disconnect();
  }
}
main();
