const bcrypt = require('bcryptjs');

const password = 'Mohamedhares15';
const hashInDatabase = '$2a$10$b02O8macpv/aeN7JeXkGaru5Uu.kX3G0uquFUv2SNa/oBAX332nSq6';

console.log('\n🔐 Testing Password Match...\n');
console.log('Password:', password);
console.log('Hash in DB:', hashInDatabase);

bcrypt.compare(password, hashInDatabase, (err, result) => {
    if (err) {
        console.error('\n❌ Error:', err);
        return;
    }

    console.log('\n' + (result ? '✅ PASSWORD MATCHES!' : '❌ PASSWORD DOES NOT MATCH!'));

    if (!result) {
        console.log('\n🔄 Generating correct hash for "Mohamedhares15"...\n');
        bcrypt.hash(password, 10, (err, newHash) => {
            if (err) {
                console.error('Error generating hash:', err);
                return;
            }
            console.log('New Hash:', newHash);
            console.log('\n📝 Run this SQL:\n');
            console.log(`UPDATE "User"`);
            console.log(`SET "passwordHash" = '${newHash}'`);
            console.log(`WHERE email = 'Mahmoud@pyrarides.com';\n`);
        });
    } else {
        console.log('\n✅ Login should work! If not, check the email case sensitivity.\n');
    }
});
