# 🎯 **PyraRide Role System Explained**

## 📊 **Three User Roles in PyraRide:**

### **1. 🐴 RIDER (Normal User)**
- **Who they are**: Regular customers who want to book horse riding experiences
- **Default role**: YES - All new users start as riders
- **What they can do**:
  - Browse stables
  - Book horse riding sessions
  - View their own bookings
  - Cancel/reschedule bookings
  - Leave reviews after completed rides
  - Manage their profile
- **Dashboard**: `/dashboard/rider`
- **Access**: Can see only their own bookings

### **2. 🏢 STABLE OWNER (Business Owner)**
- **Who they are**: People who own horse stables and want to list them
- **Default role**: NO - Must be assigned by admin
- **What they can do**:
  - Register their stable (requires admin approval)
  - Add horses to their stable
  - Manage stable information
  - View bookings made to their stable
  - See earnings from completed bookings
  - View analytics (total bookings, earnings)
- **Dashboard**: `/dashboard/stable`
- **Access**: Can see bookings for their stable only
- **Special**: Each user can own ONE stable

### **3. 👑 ADMIN (Platform Manager)**
- **Who they are**: Platform administrators who manage the marketplace
- **Default role**: NO - Must be manually assigned
- **What they can do**:
  - Approve/reject stable registrations
  - View all users, stables, and bookings
  - Access full analytics
  - Manage platform settings
  - Handle disputes
- **Dashboard**: `/dashboard/analytics` (or admin-specific dashboard)
- **Access**: Can see everything in the platform

---

## 🔄 **How Dashboard Routing Works:**

When a user goes to `/dashboard`, the system checks their role:

```typescript
if (role === "rider") → /dashboard/rider
if (role === "stable_owner") → /dashboard/stable  
if (role === "admin") → /dashboard/analytics
```

**This is automatic** - users can't access the wrong dashboard.

---

## ✅ **Current Implementation:**

### **Role-based Access:**
- ✅ Each role has different permissions
- ✅ Riders can only see their bookings
- ✅ Stable owners can only see their stable's bookings
- ✅ Admins can see everything

### **Separate Dashboards:**
- ✅ Rider Dashboard: Shows user's bookings
- ✅ Stable Dashboard: Shows stable's bookings + stats
- ✅ Analytics Dashboard: Shows platform-wide stats

### **Security:**
- ✅ API routes check user role
- ✅ Only authorized users can access their data
- ✅ Cross-role access is blocked

---

## 🤔 **Why This Distinction?**

### **Business Model:**
This is a **2-sided marketplace**:
- **Side 1**: Riders (customers) want to book rides
- **Side 2**: Stable Owners (businesses) want to offer rides
- **Side 3**: Admin manages the platform

### **Different Needs:**
- **Riders** need: Book rides, manage bookings, review stables
- **Owners** need: Manage stable, add horses, track earnings
- **Admins** need: Oversee platform, approve stables, view analytics

### **Security:**
Each role has **restricted access**:
- Riders can't see other riders' data
- Stable owners can't see other stables' data
- This protects user privacy

---

## 📝 **How to Create Each Role:**

### **Creating a Rider (Automatic):**
1. User signs up at `/auth/register`
2. Default role is automatically set to `rider`
3. They can immediately browse and book

### **Creating a Stable Owner:**
1. User signs up (starts as rider)
2. They apply to register a stable
3. Admin approves them
4. Their role changes to `stable_owner`
5. They can now access stable dashboard

### **Creating an Admin:**
1. Admin manually changes user's role in database
2. Or create special signup flow for admins

---

## 🎯 **Your Question Answered:**

> "Why is there no distinction between the owner of the stable, the normal user and the employer?"

**Actually, there IS full distinction!**

1. ✅ **Normal User (Rider)**: Can only book rides, see their bookings
2. ✅ **Stable Owner**: Can manage stable, see their stable's bookings
3. ✅ **Admin**: Can see everything, manage platform

Each has:
- ✅ Different dashboard (`/dashboard/rider` vs `/dashboard/stable` vs `/dashboard/analytics`)
- ✅ Different permissions (API route checks)
- ✅ Different data access (Can only see their own data)

---

## 🔧 **The Distinction is Enforced:**

### **At Database Level:**
```sql
role ENUM ('rider', 'stable_owner', 'admin')
```

### **At API Level:**
```typescript
// In API routes
if (session.user.role !== "rider") {
  return 403 // Forbidden
}
```

### **At UI Level:**
```typescript
// Dashboard routing
if (role === "rider") router.push("/dashboard/rider");
if (role === "stable_owner") router.push("/dashboard/stable");
if (role === "admin") router.push("/dashboard/analytics");
```

---

## ✅ **Summary:**

**YES, there is complete distinction between roles!**

- **Different permissions**
- **Different dashboards**
- **Different access levels**
- **Secure and separate**

Each user type has their own specific dashboard and can only access their own data!

