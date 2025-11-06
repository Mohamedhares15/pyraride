const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with test data...\n');

  // Clean existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.horse.deleteMany();
  await prisma.stable.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // Create test users
  console.log('👥 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const rider1 = await prisma.user.create({
    data: {
      email: 'rider1@test.com',
      passwordHash: hashedPassword,
      fullName: 'Ahmed Hassan',
      role: 'rider',
    },
  });
  console.log('✅ Created rider1@test.com (password123)');

  const rider2 = await prisma.user.create({
    data: {
      email: 'rider2@test.com',
      passwordHash: hashedPassword,
      fullName: 'Sarah Johnson',
      role: 'rider',
    },
  });
  console.log('✅ Created rider2@test.com (password123)');

  const owner1 = await prisma.user.create({
    data: {
      email: 'owner1@test.com',
      passwordHash: hashedPassword,
      fullName: 'Mohamed Ali',
      role: 'stable_owner',
    },
  });
  console.log('✅ Created owner1@test.com (password123)');

  const owner2 = await prisma.user.create({
    data: {
      email: 'owner2@test.com',
      passwordHash: hashedPassword,
      fullName: 'Fatima El-Sayed',
      role: 'stable_owner',
    },
  });
  console.log('✅ Created owner2@test.com (password123)');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      fullName: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Created admin@test.com (password123)\n');

  // Create stables
  console.log('🏇 Creating stables...');
  const stable1 = await prisma.stable.create({
    data: {
      ownerId: owner1.id,
      name: 'Pyramid View Stables',
      description: 'Premium horse stables located at the heart of Giza with stunning views of the pyramids. We offer safe, professional riding experiences for all skill levels.',
      location: 'Giza',
      address: 'Al-Ahram Street, Giza, Egypt',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800',
    },
  });
  console.log(`✅ Created ${stable1.name}`);

  const stable2 = await prisma.stable.create({
    data: {
      ownerId: owner2.id,
      name: 'Desert Riders Saqqara',
      description: 'Experienced guides and well-trained horses for the ultimate pyramid riding adventure. Specializing in sunrise and sunset tours at Saqqara.',
      location: 'Saqqara',
      address: 'Saqqara Pyramid Road, Giza, Egypt',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1516725083369-0bcbe0d21ac8?w=800',
    },
  });
  console.log(`✅ Created ${stable2.name}`);

  const stable3 = await prisma.stable.create({
    data: {
      ownerId: owner1.id,
      name: 'Golden Hoof Adventures',
      description: 'Family-owned stable with 20+ years of experience. Our horses are gentle and perfect for beginners and families with children.',
      location: 'Giza',
      address: 'Pyramid Road, Giza, Egypt',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800',
    },
  });
  console.log(`✅ Created ${stable3.name}`);

  const stable4 = await prisma.stable.create({
    data: {
      ownerId: owner2.id,
      name: 'Ancient Path Stables',
      description: 'Authentic Egyptian horse riding experience. Our guides are knowledgeable about local history and provide informative tours.',
      location: 'Giza',
      address: 'Al-Haram Road, Giza, Egypt',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1598194887283-6a5b79f2b1b0?w=800',
    },
  });
  console.log(`✅ Created ${stable4.name}\n`);

  // Create horses
  console.log('🐴 Creating horses...');
  const horses1 = [
    {
      name: 'Desert Storm',
      description: 'Beautiful Arabian horse, very gentle and patient with beginners.',
      imageUrls: ['https://images.unsplash.com/photo-1508178446444-cced3ac18dd5?w=800'],
      isActive: true,
    },
    {
      name: 'Pharaoh\'s Pride',
      description: 'Strong and majestic, perfect for experienced riders.',
      imageUrls: ['https://images.unsplash.com/photo-1556912173-03ee23e744f9?w=800'],
      isActive: true,
    },
    {
      name: 'Nile Runner',
      description: 'Fast and friendly, loves to gallop.',
      imageUrls: ['https://images.unsplash.com/photo-1598194887283-6a5b79f2b1b0?w=800'],
      isActive: true,
    },
  ];

  for (const horse of horses1) {
    await prisma.horse.create({
      data: {
        stableId: stable1.id,
        ...horse,
      },
    });
    console.log(`✅ Created ${horse.name}`);
  }

  const horses2 = [
    {
      name: 'Pyramid Rider',
      description: 'Calm and steady, great for long tours.',
      imageUrls: ['https://images.unsplash.com/photo-1588943211346-0908a1e8a8cd?w=800'],
      isActive: true,
    },
    {
      name: 'Sahara Star',
      description: 'Energetic and playful, perfect for the adventure seeker.',
      imageUrls: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800'],
      isActive: true,
    },
  ];

  for (const horse of horses2) {
    await prisma.horse.create({
      data: {
        stableId: stable2.id,
        ...horse,
      },
    });
    console.log(`✅ Created ${horse.name}`);
  }
  console.log('✅ All horses created\n');

  // Create bookings
  console.log('📅 Creating sample bookings...');
  const allStables = await prisma.stable.findMany({ include: { horses: true } });

  const bookings = [
    {
      riderId: rider1.id,
      stableId: allStables[0].id,
      horseId: allStables[0].horses[0].id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      totalPrice: 500,
      commission: 100,
      status: 'confirmed',
    },
    {
      riderId: rider2.id,
      stableId: allStables[1].id,
      horseId: allStables[1].horses[0].id,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      totalPrice: 600,
      commission: 120,
      status: 'confirmed',
    },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({ data: booking });
    console.log(`✅ Created booking for ${booking.startTime.toLocaleDateString()}`);
  }
  console.log('✅ Sample bookings created\n');

  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📋 Test Accounts:');
  console.log('   Rider 1: rider1@test.com / password123');
  console.log('   Rider 2: rider2@test.com / password123');
  console.log('   Owner 1: owner1@test.com / password123');
  console.log('   Owner 2: owner2@test.com / password123');
  console.log('   Admin: admin@test.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

