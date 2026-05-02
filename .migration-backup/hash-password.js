const bcrypt = require('bcryptjs');

const password = 'Mohamedhares15';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }

    console.log('\n🔐 Password Hash Generated!\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\n📝 SQL Update Command:\n');
    console.log(`UPDATE "User"`);
    console.log(`SET "passwordHash" = '${hash}'`);
    console.log(`WHERE email = 'Mahmoud@pyrarides.com';`);
    console.log('\n✅ Copy the SQL command above and run it in your database!\n');
});
