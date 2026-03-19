# 🔐 **Complete User Guide - Sign In, Sign Up & Account Types**

## ✅ **PART 1: SIGN IN TO FIX THE BOOKING ERROR**

### **The Problem:**
You're seeing "Failed to fetch bookings" because **you're not signed in!**

The `/api/bookings` route requires authentication. Without being logged in, it returns 401 Unauthorized.

### **The Solution:**

#### **Step 1: Sign Up (Create Account)**
1. Go to: https://pyrarides.vercel.app
2. Click "Get Started" button (top right)
3. Fill in:
   - Email: your-email@example.com
   - Password: (create a strong password)
   - Full Name: Your Name
4. Click "Sign Up"
5. ✅ You're now logged in!

#### **Step 2: Access Dashboard**
1. After signing up, you're automatically logged in
2. Click "Dashboard" in the navbar
3. You'll be redirected to `/dashboard/rider`
4. ✅ Should now work without errors!

#### **Step 3: View Bookings**
- If you have bookings, they'll display
- If no bookings, you'll see "No Bookings Yet" with option to browse stables

---

## 🎭 **PART 2: ACCOUNT TYPES EXPLAINED**

### **👤 DEFAULT: RIDER ACCOUNT** (You Create This)
- **How to create**: Click "Get Started" → Sign up
- **What you get**: Regular user account
- **Dashboard**: `/dashboard/rider`
- **Can do**: Browse stables, book rides, view your bookings

### **🏢 STABLE OWNER ACCOUNT** (Must Be Upgraded)
- **How to create**: Currently requires database change
- **Two ways to do this:**

#### **Option A: Database Update (Recommended)**
You need to manually change the user's role in the database:

1. **Go to Neon Console**: https://console.neon.tech
2. **Open SQL Editor**
3. **Run this SQL** (replace email with your email):
```sql
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'your-email@example.com';
```
4. ✅ User is now a stable owner!

#### **Option B: Create New Stable Owner Account**
1. Sign up with a different email as stable owner
2. Go to Neon Console → SQL Editor
3. Run:
```sql
-- First update the role
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'stable-owner@example.com';

-- Then create their stable (replace ownerId with the user's actual ID from database)
INSERT INTO "Stable" (id, "ownerId", name, description, location, address, status)
VALUES (gen_random_uuid(), 'USER_ID_HERE', 'My Stable', 'A great stable', 'Giza', 'Pyramids Road', 'approved');
```
4. ✅ Stable owner account created!

### **👑 ADMIN ACCOUNT** (Platform Manager)
- **How to create**: Database update only
- **Steps:**
1. Go to Neon Console → SQL Editor
2. Run this SQL:
```sql
-- Update existing user to admin
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- OR create new admin account
INSERT INTO "User" (id, email, "passwordHash", "role")
VALUES (gen_random_uuid(), 'admin@example.com', 'hashed_password_here', 'admin');
```
3. ✅ Admin account created!

---

## 📋 **QUICK REFERENCE: ROLES**

| Role | How to Create | Dashboard | Can Do |
|------|---------------|-----------|--------|
| **Rider** | Sign up normally | `/dashboard/rider` | Book rides, view bookings |
| **Stable Owner** | Update role in DB | `/dashboard/stable` | Manage stable, view bookings to their stable |
| **Admin** | Update role in DB | `/dashboard/analytics` | Manage platform, approve stables |

---

## 🔧 **PART 3: HOW TO FIX YOUR CURRENT ISSUE**

### **To Fix "Failed to fetch bookings":**

1. **Go to**: https://pyrarides.vercel.app
2. **Click**: "Get Started"
3. **Sign up** with your email and password
4. **After signup**, you'll be redirected to dashboard
5. ✅ Should now work!

### **To Make Yourself a Stable Owner:**

#### **Method 1: Through Neon Console** (Fastest)
1. Sign up on the website first
2. Go to https://console.neon.tech
3. Open SQL Editor
4. Run:
```sql
-- Find your user ID first
SELECT id, email, role FROM "User";

-- Then update your role
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'YOUR_EMAIL_HERE';
```
5. Sign out and sign in again
6. ✅ You're now a stable owner!

#### **Method 2: I Can Do It For You**
Tell me your email and I'll create the SQL update for you!

---

## 🎯 **SUMMARY:**

### **Fix Booking Error:**
- ✅ Sign up on the website
- ✅ Sign in
- ✅ Access dashboard

### **Create Stable Owner:**
- ✅ Sign up first
- ✅ Update role in database to `stable_owner`
- ✅ Sign out/in again

### **Create Admin:**
- ✅ Update role in database to `admin`
- ✅ Sign out/in again

---

## 📝 **NEXT STEPS:**

1. **Immediate**: Sign up on the website to fix the booking error
2. **To become Stable Owner**: Tell me your email and I'll provide the exact SQL
3. **To become Admin**: Same as above

**The booking error is just because you need to sign in!** Once you create an account, everything works! 🚀

