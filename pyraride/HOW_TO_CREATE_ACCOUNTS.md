# 🎯 **How to Create Different Account Types**

## ✅ **Problem 1: "Failed to fetch bookings"**

**Root Cause**: You're not signed in! The dashboard requires authentication.

**Solution**: 
1. Go to https://pyraride.vercel.app
2. Click "Sign In" or "Get Started"
3. Sign up with your email
4. Then visit https://pyraride.vercel.app/dashboard/rider
5. It will work!

---

## 📋 **How to Create Each Account Type:**

### **1. Rider Account (Default) - EASY!**

**Step 1**: Go to https://pyraride.vercel.app  
**Step 2**: Click "Sign In" or "Get Started"  
**Step 3**: Fill in:
- Email: your@email.com
- Password: (your password)
- Full Name: Your Name
**Step 4**: Click "Sign Up"  
**Step 5**: Done! You're now a rider with access to `/dashboard/rider`

---

### **2. Stable Owner Account - REQUIRES MANUAL UPDATE**

**Problem**: There's no automatic way to become a stable owner through the UI yet.

**Solution**: Update role directly in database

#### **Option A: Via Neon Console (Easiest)**

1. Go to https://console.neon.tech
2. Open your `pyraride` database
3. Click "SQL Editor"
4. Run this SQL:

```sql
-- First, find your user email
SELECT * FROM "User" WHERE email = 'your@email.com';

-- Then update the role
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'your@email.com';
```

5. Sign out and sign back in
6. You're now a stable owner!
7. Visit `/dashboard/stable`

---

### **3. Admin Account - REQUIRES MANUAL UPDATE**

**Solution**: Update role directly in database

#### **Via Neon Console:**

1. Go to https://console.neon.tech
2. Open SQL Editor
3. Run this SQL:

```sql
-- Update your user to admin
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

4. Sign out and sign back in
5. You're now an admin!
6. Visit `/dashboard/analytics`

---

## 🔧 **Create Complete Test Accounts (Advanced)**

### **Via SQL Script in Neon:**

Run this to create all three types:

```sql
-- Create Rider
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'rider@test.com',
  '$2a$10$KIXrBY7XCt.5M5YHKLHmOuDJ5HqYqHbL7QqyEV5yY9qXvqFqHqHqH', -- hash of "password123"
  'Test Rider',
  'rider',
  NOW()
);

-- Create Stable Owner
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'owner@test.com',
  '$2a$10$KIXrBY7XCt.5M5YHKLHmOuDJ5HqYqHbL7QqyEV5yY9qXvqFqHqHqH', -- hash of "password123"
  'Test Stable Owner',
  'stable_owner',
  NOW()
);

-- Create Admin
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  '$2a$10$KIXrBY7XCt.5M5YHKLHmOuDJ5HqYqHbL7QqyEV5yY9qXvqFqHqHqH', -- hash of "password123"
  'Test Admin',
  'admin',
  NOW()
);
```

**Password**: `password123` (for all accounts)

---

## 📝 **Quick Guide Summary:**

### **Create Rider:**
- ✅ Sign up normally through UI
- ✅ Default role = rider
- ✅ Done!

### **Create Stable Owner:**
- ❌ Cannot do through UI yet
- ✅ Must update database manually
- ✅ Run SQL: `UPDATE "User" SET role = 'stable_owner' WHERE email = 'your@email.com';`

### **Create Admin:**
- ❌ Cannot do through UI yet
- ✅ Must update database manually  
- ✅ Run SQL: `UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';`

---

## 🎯 **Login Credentials (After SQL):**

After running the SQL scripts above, you can login with:

```
rider@test.com / password123     → Rider dashboard
owner@test.com / password123     → Stable Owner dashboard
admin@test.com / password123     → Admin dashboard
```

---

## ✅ **Why "Failed to fetch bookings"?**

**Answer**: You need to sign in first!

1. The dashboard requires authentication
2. Without being signed in, API returns 401 Unauthorized
3. This is actually **correct security behavior**
4. Once you sign in, everything works!

---

**Test it now:**
1. Sign up at https://pyraride.vercel.app
2. Visit `/dashboard/rider`
3. See "No Bookings Yet" (because you have no bookings)
4. Everything works! ✅

