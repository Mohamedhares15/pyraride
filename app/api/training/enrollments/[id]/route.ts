import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/training/enrollments/[id] — Renew or cancel enrollment
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: params.id },
      include: {
        program: true,
        academy: { include: { captain: { select: { id: true } } } },
      },
    });

    if (!enrollment || enrollment.riderId !== session.user.id) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (action === "renew") {
      if (enrollment.status !== "completed" && enrollment.status !== "expired") {
        return NextResponse.json(
          { error: "Can only renew completed or expired enrollments" },
          { status: 400 }
        );
      }

      // Mark current enrollment as renewed
      await prisma.trainingEnrollment.update({
        where: { id: params.id },
        data: { isRenewed: true },
      });

      // Create new enrollment
      const start = new Date();
      const expiry = new Date(start);
      expiry.setDate(expiry.getDate() + enrollment.program.validityDays);

      // Generate session slots
      const dayMap: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
      };
      const availableDayNumbers = enrollment.program.availableDays.map((d) => dayMap[d]).filter((n) => n !== undefined);
      const defaultStartTime = enrollment.program.startTime || "10:00";
      const durationHours = enrollment.program.sessionDuration || 1;
      const [startHour, startMin] = defaultStartTime.split(":").map(Number);
      const endHour = startHour + Math.floor(durationHours);
      const endMin = startMin + Math.round((durationHours % 1) * 60);
      const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

      const sessions: { sessionNumber: number; date: Date; startTime: string; endTime: string }[] = [];
      let currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow

      while (sessions.length < enrollment.program.totalSessions) {
        if (availableDayNumbers.includes(currentDate.getDay())) {
          sessions.push({
            sessionNumber: sessions.length + 1,
            date: new Date(currentDate),
            startTime: defaultStartTime,
            endTime,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const newEnrollment = await prisma.$transaction(async (tx) => {
        const created = await tx.trainingEnrollment.create({
          data: {
            riderId: session.user.id,
            academyId: enrollment.academyId,
            programId: enrollment.programId,
            totalSessions: enrollment.program.totalSessions,
            startDate: start,
            expiryDate: expiry,
            totalPrice: enrollment.program.price,
            renewedFromId: enrollment.id,
          },
        });

        await tx.trainingSession.createMany({
          data: sessions.map((s) => ({
            enrollmentId: created.id,
            sessionNumber: s.sessionNumber,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        });

        return created;
      });

      // Notify captain
      await prisma.notification.create({
        data: {
          userId: enrollment.academy.captainId,
          type: "enrollment_renewed",
          title: "Trainee Renewed",
          message: `${session.user.name || "A rider"} renewed their enrollment in ${enrollment.program.name}.`,
          data: { enrollmentId: newEnrollment.id },
        },
      });

      const complete = await prisma.trainingEnrollment.findUnique({
        where: { id: newEnrollment.id },
        include: {
          program: true,
          academy: true,
          sessions: { orderBy: { sessionNumber: "asc" } },
        },
      });

      return NextResponse.json(complete);

    } else if (action === "cancel") {
      if (enrollment.status !== "active") {
        return NextResponse.json({ error: "Can only cancel active enrollments" }, { status: 400 });
      }

      const updated = await prisma.trainingEnrollment.update({
        where: { id: params.id },
        data: { status: "cancelled" },
      });

      // Cancel all scheduled sessions
      await prisma.trainingSession.updateMany({
        where: {
          enrollmentId: params.id,
          status: "scheduled",
        },
        data: { status: "cancelled" },
      });

      // Notify captain
      await prisma.notification.create({
        data: {
          userId: enrollment.academy.captainId,
          type: "enrollment_cancelled",
          title: "Trainee Cancelled",
          message: `${session.user.name || "A rider"} cancelled their enrollment in ${enrollment.program.name}.`,
          data: { enrollmentId: params.id },
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
