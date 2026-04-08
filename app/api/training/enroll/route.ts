import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAcademyEnrollmentEmail, sendCaptainNewTraineeEmail } from "@/lib/email";

// POST /api/training/enroll — Enroll a rider in a training program
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programId, startDate } = body;

    if (!programId || !startDate) {
      return NextResponse.json(
        { error: "programId and startDate are required" },
        { status: 400 }
      );
    }

    // Fetch program with academy
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: {
        academy: {
          include: {
            captain: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!program || !program.isActive) {
      return NextResponse.json(
        { error: "Training program not found or inactive" },
        { status: 404 }
      );
    }

    // Check if rider already has active enrollment at this academy
    const existingEnrollment = await prisma.trainingEnrollment.findFirst({
      where: {
        riderId: session.user.id,
        academyId: program.academyId,
        status: "active",
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "You already have an active enrollment at this academy" },
        { status: 409 }
      );
    }

    // Calculate dates
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + program.validityDays);

    // Generate session slots based on available days
    const sessions: {
      sessionNumber: number;
      date: Date;
      startTime: string;
      endTime: string;
    }[] = [];

    const dayMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    };

    const availableDayNumbers = program.availableDays.map((d) => dayMap[d]).filter((n) => n !== undefined);
    const defaultStartTime = program.startTime || "10:00";
    const durationHours = program.sessionDuration || 1;
    const [startHour, startMin] = defaultStartTime.split(":").map(Number);
    const endHour = startHour + Math.floor(durationHours);
    const endMin = startMin + Math.round((durationHours % 1) * 60);
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    let currentDate = new Date(start);
    let sessionCount = 0;

    while (sessionCount < program.totalSessions && currentDate <= expiry) {
      if (availableDayNumbers.includes(currentDate.getDay())) {
        sessionCount++;
        sessions.push({
          sessionNumber: sessionCount,
          date: new Date(currentDate),
          startTime: defaultStartTime,
          endTime: endTime,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (sessions.length < program.totalSessions) {
      // Extend beyond validity if needed to fit all sessions
      while (sessions.length < program.totalSessions) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (availableDayNumbers.includes(currentDate.getDay())) {
          sessions.push({
            sessionNumber: sessions.length + 1,
            date: new Date(currentDate),
            startTime: defaultStartTime,
            endTime: endTime,
          });
        }
      }
    }

    // Create enrollment + sessions in a transaction
    const enrollment = await prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.trainingEnrollment.create({
        data: {
          riderId: session.user.id,
          academyId: program.academyId,
          programId: program.id,
          totalSessions: program.totalSessions,
          startDate: start,
          expiryDate: expiry,
          totalPrice: program.price,
        },
      });

      // Create all session slots
      await tx.trainingSession.createMany({
        data: sessions.map((s) => ({
          enrollmentId: newEnrollment.id,
          sessionNumber: s.sessionNumber,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      });

      return newEnrollment;
    });

    // Create notification for rider
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "training_enrolled",
        title: "Training Enrollment Confirmed",
        message: `You've enrolled in ${program.name} at ${program.academy.name}. ${program.totalSessions} sessions scheduled starting ${start.toLocaleDateString()}.`,
        data: {
          enrollmentId: enrollment.id,
          academyId: program.academyId,
          programName: program.name,
        },
      },
    });

    // Create notification for captain
    await prisma.notification.create({
      data: {
        userId: program.academy.captainId,
        type: "new_trainee",
        title: "New Trainee Enrolled",
        message: `${session.user.name || "A rider"} has enrolled in ${program.name}. ${program.totalSessions} sessions scheduled.`,
        data: {
          enrollmentId: enrollment.id,
          riderName: session.user.name,
        },
      },
    });

    // Fire emails asynchronously
    if (session.user.email) {
      sendAcademyEnrollmentEmail({
        riderName: session.user.name || "Rider",
        riderEmail: session.user.email,
        academyName: program.academy.name,
        programName: program.name,
        totalSessions: program.totalSessions,
        googleMapsUrl: program.academy.googleMapsUrl || null,
      }).catch(e => console.error(e));
    }

    if (program.academy.captain.email) {
      sendCaptainNewTraineeEmail({
        captainName: program.academy.captain.fullName || "Captain",
        captainEmail: program.academy.captain.email,
        riderName: session.user.name || "A new rider",
        programName: program.name,
      }).catch(e => console.error(e));
    }

    // Fetch the complete enrollment to return
    const completeEnrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: enrollment.id },
      include: {
        program: true,
        academy: true,
        sessions: { orderBy: { sessionNumber: "asc" } },
      },
    });

    return NextResponse.json(completeEnrollment, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in training:", error);
    return NextResponse.json(
      { error: "Failed to enroll" },
      { status: 500 }
    );
  }
}
