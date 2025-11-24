# View and Reset Stable Owner Passwords

## ⚠️ Important: Passwords Cannot Be Retrieved

Passwords are hashed with bcrypt and **cannot be retrieved** from the database. However, you can **reset** all stable owner passwords to a known password.

## Option 1: Use the Script (Recommended)

### Prerequisites

Make sure you have `DATABASE_URL` set in your environment:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="your-neon-database-url"
```

**Or create `.env` file in project root:**
```
DATABASE_URL="your-neon-database-url"
```

### Step 1: List All Stable Owners

```bash
node scripts/list-stable-owners.js
```

This will show you:
- All stable owner emails
- Their names
- Whether they have a stable registered
- Whether password is set

### Step 2: Reset All Passwords

```bash
# Reset to default password "PyraRide2024!"
node scripts/reset-stable-owner-passwords.js

# Or use a custom password
node scripts/reset-stable-owner-passwords.js "MyCustomPassword123!"
```

This will:
- Find all stable owners
- Reset their passwords to the specified password
- Show you all emails and the new password

### Step 3: Login and Upload Horses

Use the email from the list and the password you set!

---

## Option 2: Use Admin API

### List All Stable Owners

```bash
# Get all users (need to be logged in as admin)
curl http://localhost:3000/api/admin/users?role=stable_owner&includeStable=true \
  -H "Cookie: your-admin-session-cookie"
```

### Reset a Specific User's Password

```bash
# Reset password for a specific user
curl -X PATCH http://localhost:3000/api/admin/users/[USER_ID]/password \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-session-cookie" \
  -d '{"password": "PyraRide2024!"}'
```

---

## Option 3: Direct Database Query (Neon Console)

### List Stable Owners

```sql
SELECT 
  id,
  email,
  "fullName",
  role,
  CASE 
    WHEN "passwordHash" IS NOT NULL THEN 'Password set'
    ELSE 'No password'
  END as password_status,
  "createdAt"
FROM "User"
WHERE role = 'stable_owner'
ORDER BY email;
```

### Reset Password (via SQL - requires generating hash first)

1. Generate a bcrypt hash:
   ```bash
   node scripts/generate-password-hashes.js
   ```

2. Update in database:
   ```sql
   UPDATE "User" 
   SET "passwordHash" = '$2a$10$YOUR_GENERATED_HASH_HERE'
   WHERE email = 'owner@example.com';
   ```

**Note:** The script method is easier!

---

## Recommended Approach

**Use Option 1 (Script)** - it's the easiest:

```bash
# 1. See all stable owners
node scripts/list-stable-owners.js

# 2. Reset all passwords to "PyraRide2024!"
node scripts/reset-stable-owner-passwords.js "PyraRide2024!"

# 3. Login with any stable owner email and the password you set
```

---

## Security Notes

- ✅ Passwords are hashed with bcrypt (cannot be reversed)
- ✅ Script resets all stable owners to the same password (convenient for testing)
- ✅ In production, consider resetting passwords individually
- ✅ Users can change their password after logging in (if you implement password change feature)

---

## After Resetting Passwords

You'll be able to:
1. Log in with any stable owner email
2. Access `/dashboard/stable`
3. Upload horses via the dashboard or API

**Login URL:** Your site's login page  
**Email:** (from the list script)  
**Password:** (the one you set in reset script)

