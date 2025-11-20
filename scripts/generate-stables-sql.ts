/**
 * Script to generate SQL INSERT statements for real stables
 * Run with: npx tsx scripts/generate-stables-sql.ts
 * This will output SQL that can be run directly in the database
 */

import bcrypt from "bcryptjs";

async function main() {
  const stableOwners = [
    {
      email: "beitzeina@pyrarides.com",
      fullName: "Mohamed el bana",
      phoneNumber: "+201064059606",
      stable: {
        name: "Beit Zeina",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/G9JbNGyzqJvwnRuQ9?g_st=ipc",
      },
    },
    {
      email: "hooves@pyrarides.com",
      fullName: "Arafa",
      phoneNumber: "+201070403443",
      stable: {
        name: "Hooves",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/tHu8mNYAUB7tssFY7?g_st=ipc",
      },
    },
    {
      email: "aseel@pyrarides.com",
      fullName: "Ibrahim",
      phoneNumber: "+201553645745",
      stable: {
        name: "Aseel",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc",
      },
    },
    {
      email: "alaa@pyrarides.com",
      fullName: "Alaa",
      phoneNumber: "+20100622105",
      stable: {
        name: "Alaa",
        description: "Professional horse riding stable in Saqqara. Experience and description coming soon.",
        location: "Saqqara",
        address: "https://maps.app.goo.gl/h6zQgxb4XTLz5VNe8?g_st=ipc",
      },
    },
  ];

  // Generate password hash
  const passwordHash = await bcrypt.hash("PyraRide2024!", 10);

  console.log("-- SQL INSERT statements for PyraRide Stables\n");
  console.log("-- Password for all accounts: PyraRide2024!\n");
  console.log("-- Owners should change this password on first login\n");
  console.log("--\n");

  const sqlStatements: string[] = [];

  for (const ownerData of stableOwners) {
    const userId = `gen_random_uuid()`;
    const stableId = `gen_random_uuid()`;
    const now = `NOW()`;

    // Escape single quotes in strings for SQL
    const escapeSQL = (str: string) => str.replace(/'/g, "''");

    const userSQL = `INSERT INTO "User" (id, email, "phoneNumber", "passwordHash", "fullName", role, "createdAt")
VALUES (${userId}, '${escapeSQL(ownerData.email)}', '${escapeSQL(ownerData.phoneNumber)}', '${escapeSQL(passwordHash)}', '${escapeSQL(ownerData.fullName)}', 'stable_owner', ${now})
ON CONFLICT (email) DO UPDATE 
SET "phoneNumber" = EXCLUDED."phoneNumber",
    "fullName" = EXCLUDED."fullName",
    role = 'stable_owner'
RETURNING id;`;

    const stableSQL = `INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status, "createdAt")
VALUES (${stableId}, (SELECT id FROM "User" WHERE email = '${escapeSQL(ownerData.email)}'), '${escapeSQL(ownerData.stable.name)}', '${escapeSQL(ownerData.stable.description)}', '${escapeSQL(ownerData.stable.location)}', '${escapeSQL(ownerData.stable.address)}', 'approved', ${now})
ON CONFLICT ("ownerId") DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    status = 'approved';`;

    sqlStatements.push(`-- Creating stable owner: ${ownerData.fullName} (${ownerData.email})`);
    sqlStatements.push(userSQL);
    sqlStatements.push("");
    sqlStatements.push(`-- Creating stable: ${ownerData.stable.name}`);
    sqlStatements.push(stableSQL);
    sqlStatements.push("");
    sqlStatements.push("--");
    sqlStatements.push("");
  }

  console.log(sqlStatements.join("\n"));
  console.log("\n-- Done!");
}

main().catch(console.error);


