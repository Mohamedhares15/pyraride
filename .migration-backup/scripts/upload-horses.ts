import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface HorseData {
  name: string;
  description: string;
  pricePerHour?: number;
  age?: number;
  skills?: string[];
  imageUrls: string[];
}

interface StableHorsesData {
  stableName: string;
  horses: HorseData[];
}

async function main() {
  try {
    // Read the JSON file
    const dataPath = path.join(process.cwd(), "horses-data.json");
    
    if (!fs.existsSync(dataPath)) {
      console.error("❌ Error: horses-data.json not found!");
      console.log("📝 Please create horses-data.json with your horse data.");
      console.log("📖 See HORSE_UPLOAD_GUIDE.md for the structure.");
      process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const stableHorsesData: StableHorsesData[] = JSON.parse(rawData);

    console.log("🚀 Starting horse upload process...\n");

    // Get all stables
    const stables = await prisma.stable.findMany({
      where: { status: "approved" },
      include: { owner: true },
    });

    const stableMap = new Map<string, string>();
    stables.forEach((stable) => {
      stableMap.set(stable.name.toLowerCase(), stable.id);
    });

    let totalHorses = 0;
    let totalImages = 0;

    for (const stableData of stableHorsesData) {
      const stableId = stableMap.get(stableData.stableName.toLowerCase());

      if (!stableId) {
        console.error(
          `❌ Stable "${stableData.stableName}" not found!`
        );
        console.log("   Available stables:", stables.map((s) => s.name).join(", "));
        continue;
      }

      const stable = stables.find((s) => s.id === stableId);
      console.log(`\n📦 Processing stable: ${stableData.stableName}`);

      for (const horseData of stableData.horses) {
        try {
          // Validate required fields
          if (!horseData.name || !horseData.description || !horseData.imageUrls || horseData.imageUrls.length === 0) {
            console.error(
              `   ❌ Skipping horse "${horseData.name}": Missing required fields (name, description, or imageUrls)`
            );
            continue;
          }

          // Validate image URLs
          const validImageUrls = horseData.imageUrls.filter(
            (url) => url && (url.startsWith("http") || url.startsWith("/"))
          );

          if (validImageUrls.length === 0) {
            console.error(
              `   ❌ Skipping horse "${horseData.name}": No valid image URLs`
            );
            continue;
          }

          console.log(`   🐴 Creating horse: ${horseData.name}`);

          // Create the horse
          const horse = await prisma.horse.create({
            data: {
              name: horseData.name,
              description: horseData.description,
              imageUrls: validImageUrls,
              stableId: stableId,
              pricePerHour: horseData.pricePerHour ? parseFloat(horseData.pricePerHour.toString()) : null,
              age: horseData.age || null,
              skills: horseData.skills || [],
              isActive: true,
            },
          });

          // Create HorseMedia entries for each image
          const mediaPromises = validImageUrls.map((url, index) =>
            prisma.horseMedia.create({
              data: {
                horseId: horse.id,
                type: "image",
                url: url,
                sortOrder: index + 1,
              },
            })
          );

          await Promise.all(mediaPromises);

          totalHorses++;
          totalImages += validImageUrls.length;

          console.log(
            `   ✅ Created "${horseData.name}" with ${validImageUrls.length} image(s)`
          );
        } catch (error: any) {
          console.error(
            `   ❌ Error creating horse "${horseData.name}":`,
            error.message
          );
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Upload complete!");
    console.log(`   📊 Total horses created: ${totalHorses}`);
    console.log(`   📷 Total images uploaded: ${totalImages}`);
    console.log("=".repeat(50) + "\n");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

