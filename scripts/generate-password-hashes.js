/**
 * Generate bcrypt password hashes for test accounts
 * Run: node scripts/generate-password-hashes.js
 */

const bcrypt = require('bcryptjs');

async function generateHashes() {
  const password = "Test123!";
  
  console.log("Generating bcrypt hashes for password: Test123!");
  console.log("\nHashes (use these in SQL):\n");
  
  // Generate 5 hashes (one for each stable owner)
  for (let i = 0; i < 5; i++) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Hash ${i + 1}: ${hash}`);
  }
  
  console.log("\n✅ All hashes generated!");
  console.log("\nNote: Each hash is different (that's normal - bcrypt uses random salts)");
  console.log("But they all verify to the same password: Test123!");
}

generateHashes();

