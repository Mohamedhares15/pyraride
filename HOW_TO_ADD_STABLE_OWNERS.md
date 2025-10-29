# 🏢 **Complete Guide: How to Add Stable Owners to PyraRide**

## 📋 **Two Methods to Add Stable Owners:**

---

## **Method 1: Via Website Registration + Database Update (RECOMMENDED)**

### **Step 1: Create User Account via Website**
1. Go to: https://pyraride.vercel.app
2. Click "Sign In" or "Get Started"
3. Click "Sign Up"
4. Fill in:
   - Email: `owner@giza-pyramids.com` (or any email)
   - Password: `YourPassword123`
   - Full Name: `Ahmed Stable Owner`
5. Click "Sign Up"
6. ✅ Account created as **RIDER** (default)

### **Step 2: Update Role to Stable Owner**

#### **Option A: Via Neon Console (Easiest)**
1. Go to: https://console.neon.tech
2. Open your `pyraride` database
3. Click "SQL Editor" → "New Query"
4. Run this SQL:

```sql
-- Find the user
SELECT id, email, role, "fullName" FROM "User" WHERE email = 'owner@giza-pyramids.com';

-- Update to stable_owner
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'owner@giza-pyramids.com';
```

5. Sign out and sign back in
6. ✅ You're now a **STABLE OWNER**!

#### **Option B: Via API (If you have API access)**
```bash
# Update role via API (requires admin access)
curl -X POST https://pyraride.vercel.app/api/admin/users/update-role \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@giza-pyramids.com", "role": "stable_owner"}'
```

---

## **Method 2: Create Complete Test Data via SQL Script**

I'll create a script that adds:
- ✅ Stable owner users
- ✅ Their stables
- ✅ Horses
- ✅ Sample bookings

See `CREATE_TEST_STABLE_OWNERS.sql` below!

---

## **Step 3: Create Your Stable (As Stable Owner)**

### **Via API (After Signing In)**

1. Sign in as stable owner
2. Make API call to create stable:

```bash
curl -X POST https://pyraride.vercel.app/api/stables \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "Giza Pyramid Stables",
    "description": "Professional horse riding tours at the Giza Pyramids. Vetted and certified operators with beautiful Arabian horses.",
    "location": "Giza",
    "address": "Pyramid Road, Giza, Egypt"
  }'
```

### **Via Dashboard (Future Feature)**

Currently, you need to use API. Dashboard UI will be added later.

---

## **Step 4: Admin Approval (Required)**

Stables are created with `status: "pending_approval"`. Admin must approve:

### **Via Neon Console:**
```sql
-- Approve stable
UPDATE "Stable" 
SET status = 'approved' 
WHERE name = 'Giza Pyramid Stables';
```

---

## 🧪 **Test Data Script**

Use `CREATE_TEST_STABLE_OWNERS.sql` to create:
- 5 stable owners
- 5 stables (2 in Giza, 3 in Saqqara)
- 15 horses (3 per stable)
- Sample bookings

**See the SQL file for complete test data!**

---

## 📊 **What Stable Owners Can Do:**

1. ✅ Access `/dashboard/stable`
2. ✅ View their bookings calendar
3. ✅ Manage their stable profile
4. ✅ Add/edit horses
5. ✅ See analytics and earnings
6. ✅ Accept/reject bookings

---

## 🔒 **Security Notes:**

- ✅ Only users with `role = 'stable_owner'` can create stables
- ✅ Each user can own only ONE stable
- ✅ Stables require admin approval before going live
- ✅ Stable owners can't modify other owners' data

---

## ❓ **Troubleshooting:**

**Problem**: "Unauthorized" when creating stable
- **Solution**: Make sure your role is `stable_owner` in database

**Problem**: "You already have a stable"
- **Solution**: Each user can only have one stable. Delete existing one first.

**Problem**: Stable not showing on browse page
- **Solution**: Check if `status = 'approved'`. Pending stables don't show publicly.

---

## 🎯 **Quick Test:**

1. Create user → Update to stable_owner → Sign in
2. Create stable via API → Admin approves
3. Add horses via `/api/horses`
4. Stable appears on `/stables` page! ✅

