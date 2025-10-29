# ⚡ **DATABASE QUICK FIX - I Cannot Access Your Neon Account**

## 🎯 **The Problem:**

I tried to access Neon console but it requires you to be logged in with YOUR account. I cannot:
- Create databases in your name
- Access your Neon account
- Install browser extensions
- Login to websites as you

---

## ✅ **What I CAN DO For You:**

### **Option 1: Use Neon's Free Tier (Recommended)**

I'll guide you through opening a browser tab where you can create the database in 2 minutes.

**Steps:**
1. Open https://console.neon.tech in a NEW browser tab
2. Sign in or sign up (takes 30 seconds)
3. Click "Create Project"
4. Name it: `pyraride`
5. Click "Create Project"
6. Copy the connection string
7. I'll update it in Vercel for you

---

### **Option 2: I'll Set Everything Up For You Once You Give Me The Connection String**

1. You create the database at https://console.neon.tech (2 minutes)
2. Copy the connection string they give you
3. Tell me: "Here's my connection string: postgresql://..."
4. I'll update Vercel immediately

---

## 📋 **What You Need To Do:**

### **Step 1: Create Free Neon Account** (1 minute)
1. Go to: https://console.neon.tech
2. Click "Sign Up" or "Log In"
3. Sign up with GitHub or Email

### **Step 2: Create Database** (1 minute)
1. Click "Create Project" button
2. Name: `pyraride`
3. Database password: (they'll generate one)
4. Click "Create Project"

### **Step 3: Run SQL** (30 seconds)
1. In left sidebar, click "SQL Editor"
2. Click "New Query"
3. I'll provide you the SQL code below
4. Paste and click "Run"

### **Step 4: Get Connection String** (30 seconds)
1. Go to "Connection Details" in the project
2. Copy the connection string
3. It looks like: `postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require`

### **Step 5: Tell Me The Connection String**
Just paste it here like:
```
My connection string is: postgresql://...
```

**I'll update everything in Vercel for you!**

---

## 🎯 **OR - Fastest Method:**

**Tell me when you've created the Neon project and I'll guide you to copy the connection string, then I'll update Vercel immediately!**

---

## 🔧 **SQL Code For You (Copy This):**

Once you create the Neon project and open SQL Editor, paste this:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
CREATE TYPE "Role" AS ENUM ('rider', 'stable_owner', 'admin');
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'completed', 'cancelled');
CREATE TYPE "StableStatus" AS ENUM ('pending_approval', 'approved', 'rejected');

-- Create Users Table
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'rider',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_email_idx" ON "User"("email");

-- Create Stables Table
CREATE TABLE "Stable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "StableStatus" NOT NULL DEFAULT 'pending_approval',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Stable_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Horses Table
CREATE TABLE "Horse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stableId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrls" TEXT[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Horse_stableId_fkey" FOREIGN KEY ("stableId") REFERENCES "Stable"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Horse_stableId_idx" ON "Horse"("stableId");

-- Create Bookings Table
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "riderId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "stripePaymentId" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_stableId_fkey" FOREIGN KEY ("stableId") REFERENCES "Stable"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Booking_riderId_idx" ON "Booking"("riderId");
CREATE INDEX "Booking_stableId_idx" ON "Booking"("stableId");
CREATE INDEX "Booking_horseId_idx" ON "Booking"("horseId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- Create Reviews Table
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL UNIQUE,
    "riderId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "stableRating" INTEGER NOT NULL,
    "horseRating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_stableId_fkey" FOREIGN KEY ("stableId") REFERENCES "Stable"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Review_bookingId_idx" ON "Review"("bookingId");
CREATE INDEX "Review_riderId_idx" ON "Review"("riderId");
CREATE INDEX "Review_stableId_idx" ON "Review"("stableId");
CREATE INDEX "Review_horseId_idx" ON "Review"("horseId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_stableRating_check" CHECK ("stableRating" >= 1 AND "stableRating" <= 5);
ALTER TABLE "Review" ADD CONSTRAINT "Review_horseRating_check" CHECK ("horseRating" >= 1 AND "horseRating" <= 5);
```

---

## 💬 **What To Tell Me:**

Once you've:
1. Created Neon account
2. Created project named `pyraride`
3. Ran the SQL
4. Got the connection string

**Just say:**
```
I've created the Neon database.
Here's my connection string:
postgresql://...
```

**And I'll update Vercel immediately and redeploy!**

