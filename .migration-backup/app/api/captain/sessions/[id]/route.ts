import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/captain/sessions/[id] — Reschedule, complete, or cancel a session
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify captain
    const academy = await prisma.academy.findUnique({
      where: { captainId: session.user.id },
    });

    if (!academy) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { action, newDate, newStartTime, newEndTime, reason } = body;

    // Verify session belongs to captain's academy
    const trainingSession = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      include: {
        enrollment: {
          include: {
            rider: { select: { id: true, fullName: true, email: true } },
            academy: true,
            program: { select: { name: true } },
          },
        },
      },
    });

    if (!trainingSession || trainingSession.enrollment.academyId !== academy.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (action === "reschedule") {
      if (!newDate || !newStartTime || !newEndTime) {
        return NextResponse.json(
          { error: "newDate, newStartTime, and newEndTime are required" },
          { status: 400 }
        );
      }

      const updated = await prisma.trainingSession.update({
        where: { id: params.id },
        data: {
          originalDate: trainingSession.date,
          originalStartTime: trainingSession.startTime,
          date: new Date(newDate),
          startTime: newStartTime,
          endTime: newEndTime,
          status: "rescheduled",
          rescheduledAt: new Date(),
          rescheduleReason: reason || null,
        },
      });

      // Notify rider
      await prisma.notification.create({
        data: {
          userId: trainingSession.enrollment.riderId,
          type: "session_rescheduled",
          title: "Training Session Rescheduled",
          message: `Your session #${trainingSession.sessionNumber} for ${trainingSession.enrollment.program.name} has been moved to ${new Date(newDate).toLocaleDateString()} at ${newStartTime}.${reason ? ` Reason: ${reason}` : ""}`,
          data: {
            sessionId: params.id,
            enrollmentId: trainingSession.enrollmentId,
            oldDate: trainingSession.date.toISOString(),
            newDate,
            newStartTime,
          },
        },
      });

      return NextResponse.json(updated);

    } else if (action === "complete") {
      const updated = await prisma.$transaction(async (tx) => {
        const completedSession = await tx.trainingSession.update({
          where: { id: params.id },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });

        // Increment completed sessions on enrollment
        await tx.trainingEnrollment.update({
          where: { id: trainingSession.enrollmentId },
          data: { completedSessions: { increment: 1 } },
        });

        // Check if all sessions are now completed
        const enrollment = await tx.trainingEnrollment.findUnique({
          where: { id: trainingSession.enrollmentId },
        });

        if (enrollment && enrollment.completedSessions + 1 >= enrollment.totalSessions) {
          await tx.trainingEnrollment.update({
            where: { id: trainingSession.enrollmentId },
            data: { status: "completed" },
          });

          // Notify rider of training completion
          await tx.notification.create({
            data: {
              userId: trainingSession.enrollment.riderId,
              type: "training_completed",
              title: "Training Completed! 🎉",
              message: `Congratulations! You've completed all ${enrollment.totalSessions} sessions of ${trainingSession.enrollment.program.name}. Renew to continue your journey!`,
              data: { enrollmentId: trainingSession.enrollmentId },
            },
          });
        }

        return completedSession;
      });

      return NextResponse.json(updated);

    } else if (action === "cancel") {
      const updated = await prisma.trainingSession.update({
        where: { id: params.id },
        data: {
          status: "cancelled",
          rescheduleReason: reason || "Cancelled by captain",
        },
      });

      // Notify rider
      await prisma.notification.create({
        data: {
          userId: trainingSession.enrollment.riderId,
          type: "session_cancelled",
          title: "Training Session Cancelled",
          message: `Your session #${trainingSession.sessionNumber} for ${trainingSession.enrollment.program.name} on ${trainingSession.date.toLocaleDateString()} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
          data: { sessionId: params.id },
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
