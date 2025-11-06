-- PyraRide Database Schema for Neon PostgreSQL
-- Run this in Neon SQL Editor or via psql

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

-- Create Indexes for Users
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

-- Create Indexes for Horses
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

-- Create Indexes for Bookings
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

-- Create Indexes for Reviews
CREATE INDEX "Review_bookingId_idx" ON "Review"("bookingId");
CREATE INDEX "Review_riderId_idx" ON "Review"("riderId");
CREATE INDEX "Review_stableId_idx" ON "Review"("stableId");
CREATE INDEX "Review_horseId_idx" ON "Review"("horseId");

-- Add CHECK constraints for ratings
ALTER TABLE "Review" ADD CONSTRAINT "Review_stableRating_check" CHECK ("stableRating" >= 1 AND "stableRating" <= 5);
ALTER TABLE "Review" ADD CONSTRAINT "Review_horseRating_check" CHECK ("horseRating" >= 1 AND "horseRating" <= 5);

-- Verify tables created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

