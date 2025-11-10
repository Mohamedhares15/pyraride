import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pyraride.com" },
    update: {},
    create: {
      email: "admin@pyraride.com",
      phoneNumber: "+201000000001",
      passwordHash: hashedPassword,
      fullName: "Admin User",
      role: "admin",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create stable owner
  const ownerPassword = await bcrypt.hash("Owner123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@giza-stables.com" },
    update: {},
    create: {
      email: "owner@giza-stables.com",
      phoneNumber: "+201000000002",
      passwordHash: ownerPassword,
      fullName: "Ahmed Stable Owner",
      role: "stable_owner",
    },
  });
  console.log("✅ Stable owner created:", owner.email);

  // Create test riders
  const rider1Password = await bcrypt.hash("Rider123", 10);
  const rider1 = await prisma.user.upsert({
    where: { email: "rider1@example.com" },
    update: {},
    create: {
      email: "rider1@example.com",
      phoneNumber: "+201000000003",
      passwordHash: rider1Password,
      fullName: "John Rider",
      role: "rider",
    },
  });
  console.log("✅ Rider 1 created:", rider1.email);

  const rider2Password = await bcrypt.hash("Rider123", 10);
  const rider2 = await prisma.user.upsert({
    where: { email: "rider2@example.com" },
    update: {},
    create: {
      email: "rider2@example.com",
      phoneNumber: "+201000000004",
      passwordHash: rider2Password,
      fullName: "Sarah Explorer",
      role: "rider",
    },
  });
  console.log("✅ Rider 2 created:", rider2.email);

  // Create stable
  const stable = await prisma.stable.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Pyramid View Stables",
      description:
        "Experience the ancient wonders of Giza on horseback. Our trusted horses have been serving tourists for over 20 years, offering safe and memorable rides around the pyramids. All our horses are well-trained and gentle, perfect for riders of all experience levels.",
      location: "Giza",
      address: "123 Pyramid Road, Giza, Egypt",
      status: "approved",
    },
  });
  console.log("✅ Stable created:", stable.name);

  // Create horses
  const horse1 = await prisma.horse.create({
    data: {
      stableId: stable.id,
      name: "Desert Wind",
      description:
        "A beautiful Arabian horse, gentle and experienced with tourists. Perfect for beginners and experts alike. Known for his calm demeanor and love of the desert.",
      imageUrls: [
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800",
        "https://images.unsplash.com/photo-1601758063433-0c3be2b9af1e?w=800",
      ],
      pricePerHour: 450,
      age: 8,
      skills: ["Beginner Friendly", "Calm Temperament", "Family Friendly"],
      isActive: true,
    },
  });
  console.log("✅ Horse 1 created:", horse1.name);

  await prisma.horseMedia.createMany({
    data: [
      {
        horseId: horse1.id,
        type: "image",
        url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200",
        sortOrder: 1,
      },
      {
        horseId: horse1.id,
        type: "image",
        url: "https://images.unsplash.com/photo-1601758063433-0c3be2b9af1e?w=1200",
        sortOrder: 2,
      },
      {
        horseId: horse1.id,
        type: "video",
        url: "https://cdn.coverr.co/videos/coverr-riding-horses-in-the-desert-8867/1080p.mp4",
        sortOrder: 3,
      },
    ],
  });

  const horse2 = await prisma.horse.create({
    data: {
      stableId: stable.id,
      name: "Sahara Queen",
      description:
        "An elegant mare with stunning brown coat. Expertly trained for pyramid tours. Very friendly and loves attention from riders.",
      imageUrls: [
        "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?w=800",
        "https://images.unsplash.com/photo-1523978591478-c753949ff840?w=800",
      ],
      pricePerHour: 520,
      age: 9,
      skills: ["Intermediate Riders", "Pyramid Tours", "Photo Ready"],
      isActive: true,
    },
  });
  console.log("✅ Horse 2 created:", horse2.name);

  await prisma.horseMedia.createMany({
    data: [
      {
        horseId: horse2.id,
        type: "image",
        url: "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?w=1200",
        sortOrder: 1,
      },
      {
        horseId: horse2.id,
        type: "image",
        url: "https://images.unsplash.com/photo-1523978591478-c753949ff840?w=1200",
        sortOrder: 2,
      },
      {
        horseId: horse2.id,
        type: "video",
        url: "https://cdn.coverr.co/videos/coverr-horse-walking-in-the-field-7282/1080p.mp4",
        sortOrder: 3,
      },
    ],
  });

  const horse3 = await prisma.horse.create({
    data: {
      stableId: stable.id,
      name: "Pharaoh's Pride",
      description:
        "A majestic stallion with years of experience on pyramid tours. His strong build and gentle nature make him perfect for longer rides around Giza.",
      imageUrls: [
        "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800",
        "https://images.unsplash.com/photo-1546712791-4d13e0c67f16?w=800",
      ],
      pricePerHour: 580,
      age: 10,
      skills: ["Advanced Riders", "Sunset Tours", "Desert Expert"],
      isActive: true,
    },
  });
  console.log("✅ Horse 3 created:", horse3.name);

  await prisma.horseMedia.createMany({
    data: [
      {
        horseId: horse3.id,
        type: "image",
        url: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=1200",
        sortOrder: 1,
      },
      {
        horseId: horse3.id,
        type: "image",
        url: "https://images.unsplash.com/photo-1546712791-4d13e0c67f16?w=1200",
        sortOrder: 2,
      },
      {
        horseId: horse3.id,
        type: "video",
        url: "https://cdn.coverr.co/videos/coverr-horseback-riding-at-sunset-8530/1080p.mp4",
        sortOrder: 3,
      },
    ],
  });

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      riderId: rider1.id,
      stableId: stable.id,
      horseId: horse1.id,
      startTime: new Date("2024-06-01T09:00:00Z"),
      endTime: new Date("2024-06-01T10:00:00Z"),
      totalPrice: 100.0,
      commission: 20.0,
      status: "completed",
    },
  });
  console.log("✅ Booking 1 created");

  const booking2 = await prisma.booking.create({
    data: {
      riderId: rider2.id,
      stableId: stable.id,
      horseId: horse2.id,
      startTime: new Date("2024-06-15T14:00:00Z"),
      endTime: new Date("2024-06-15T15:30:00Z"),
      totalPrice: 150.0,
      commission: 30.0,
      status: "completed",
    },
  });
  console.log("✅ Booking 2 created");

  // Create reviews
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      riderId: rider1.id,
      stableId: stable.id,
      horseId: horse1.id,
      stableRating: 5,
      horseRating: 5,
      comment:
        "Amazing experience! Desert Wind was the perfect companion for our pyramid tour. The stable owner was very professional and ensured our safety throughout. Highly recommend!",
    },
  });
  console.log("✅ Review 1 created");

  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      riderId: rider2.id,
      stableId: stable.id,
      horseId: horse2.id,
      stableRating: 5,
      horseRating: 5,
      comment:
        "Sahara Queen was absolutely wonderful! Such a gentle and well-trained horse. The views of the pyramids were incredible. This is a must-do experience in Egypt!",
    },
  });
  console.log("✅ Review 2 created");

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📝 Test Accounts:");
  console.log("Admin: admin@pyraride.com / Admin123");
  console.log("Owner: owner@giza-stables.com / Owner123");
  console.log("Rider: rider1@example.com / Rider123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

