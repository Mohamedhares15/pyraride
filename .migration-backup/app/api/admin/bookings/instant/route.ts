import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Admin-only endpoint to create instant bookings for walk-in customers
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins can use this feature
        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Only admins can create instant bookings" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            riderEmail,
            horseId,
            stableId,
            date,
            startTime,
            endTime,
        } = body;

        // Validate required fields
        if (!riderEmail || !horseId || !stableId || !date || !startTime || !endTime) {
            return NextResponse.json(
                { error: "Missing required fields: riderEmail, horseId, stableId, date, startTime, endTime" },
                { status: 400 }
            );
        }

        // Find rider by email
        const rider = await prisma.user.findUnique({
            where: { email: riderEmail },
        });

        if (!rider) {
            return NextResponse.json(
                { error: `User with email ${riderEmail} not found. Please ask the rider to create an account first.` },
                { status: 404 }
            );
        }

        // Verify horse exists and belongs to stable
        const horse = await prisma.horse.findUnique({
            where: { id: horseId },
            include: { stable: true },
        });

        if (!horse) {
            return NextResponse.json({ error: "Horse not found" }, { status: 404 });
        }

        if (horse.stableId !== stableId) {
            return NextResponse.json(
                { error: "Horse does not belong to the specified stable" },
                { status: 400 }
            );
        }

        // Parse date and times
        const bookingDate = new Date(date);
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        const bookingStart = new Date(bookingDate);
        bookingStart.setHours(startHour, startMin, 0, 0);

        const bookingEnd = new Date(bookingDate);
        bookingEnd.setHours(endHour, endMin, 0, 0);

        // Calculate price
        const hours = (bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60);
        const pricePerHour = Number(horse.pricePerHour ?? 50);
        const totalPrice = hours * pricePerHour;
        const commissionRate = horse.stable.commissionRate
            ? Number(horse.stable.commissionRate)
            : 0.15;
        const commission = totalPrice * commissionRate;

        // Check for duplicate booking (same horse, rider, and overlapping time)
        const existingBooking = await prisma.booking.findFirst({
            where: {
                horseId,
                riderId: rider.id,
                AND: [
                    { startTime: { lte: bookingEnd } },
                    { endTime: { gte: bookingStart } },
                ],
            },
        });

        if (existingBooking) {
            return NextResponse.json(
                { error: `A booking already exists for this rider on horse "${horse.name}" at this time.` },
                { status: 409 }
            );
        }

        // Create the instant booking with "completed" status
        const booking = await prisma.booking.create({
            data: {
                riderId: rider.id,
                stableId,
                horseId,
                startTime: bookingStart,
                endTime: bookingEnd,
                totalPrice,
                commission,
                status: "completed", // Mark as completed since ride already happened
            },
        });

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                horse: horse.name,
                stable: horse.stable.name,
                rider: rider.fullName || rider.email,
                date: bookingStart.toISOString(),
                startTime: bookingStart.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                endTime: bookingEnd.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                totalPrice,
                status: "completed",
            },
            message: "Instant booking created successfully. The rider can now leave a review.",
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating instant booking:", error);
        return NextResponse.json(
            { error: "Failed to create instant booking" },
            { status: 500 }
        );
    }
}

// Get all instant bookings (for admin dashboard)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get recent completed bookings created by admin actions
        const instantBookings = await prisma.booking.findMany({
            where: {
                status: "completed",
            },
            include: {
                horse: { select: { name: true } },
                stable: { select: { name: true } },
                rider: { select: { fullName: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json(instantBookings);

    } catch (error) {
        console.error("Error fetching instant bookings:", error);
        return NextResponse.json(
            { error: "Failed to fetch instant bookings" },
            { status: 500 }
        );
    }
}
