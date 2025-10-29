# 🔧 **QUICK FIX: Stable Owner Login Issue**

## **Problem:**
- Stables are showing on browse page ✅
- But can't sign in - "Invalid email or password" ❌

## **Root Cause:**
The SQL script used placeholder password hashes instead of real bcrypt hashes.

---

## **✅ SOLUTION: Run This SQL**

Go to **Neon Console**: https://console.neon.tech

### **Step 1: Copy and Run `FIX_STABLE_OWNER_PASSWORDS.sql`**

This file contains the fix. It updates all 5 stable owner passwords with **real bcrypt hashes**.

### **Step 2: Try Signing In Again**

**Test Accounts:**

| Email | Password |
|-------|----------|
| ahmed@giza-pyramids.com | **Test123!** |
| mohamed@giza-desert.com | **Test123!** |
| fatima@saqqara-stables.com | **Test123!** |
| omar@royal-rides.com | **Test123!** |
| nour@ancient-paths.com | **Test123!** |

---

## **Alternative: Use the TypeScript Script**

If you have `.env` file with `DATABASE_URL`:

```bash
npx tsx scripts/create-test-stable-owners.ts
```

This creates users with **proper password hashes** automatically.

---

## **What Changed:**

- ❌ **Before**: Placeholder hash `$2a$10$rKQp...` (doesn't work)
- ✅ **After**: Real bcrypt hash `$2a$10$dfl7...` (works with "Test123!")

---

## **Verify It Works:**

1. Run the SQL fix
2. Go to: https://pyraride.vercel.app
3. Sign in with: `ahmed@giza-pyramids.com` / `Test123!`
4. ✅ Should work now!

---

**The fix file is ready: `FIX_STABLE_OWNER_PASSWORDS.sql`**

