import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/captain/sessions/[id]/review — Captain reviews a completed session
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const academy = await prisma.academy.findUnique({
      where: { captainId: session.user.id },
    });

    if (!academy) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { performanceRating, techniqueRating, attitudeRating, comment, improvements } = body;

    if (!performanceRating || !techniqueRating || !attitudeRating) {
      return NextResponse.json(
        { error: "All ratings are required" },
        { status: 400 }
      );
    }

    // Verify session belongs to captain's academy and is completed
    const trainingSession = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      include: {
        enrollment: {
          include: {
            rider: { select: { id: true, fullName: true } },
            program: { select: { name: true } },
          },
        },
        review: true,
      },
    });

    if (!trainingSession || trainingSession.enrollment.academyId !== academy.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (trainingSession.review) {
      return NextResponse.json({ error: "Session already reviewed" }, { status: 409 });
    }

    const review = await prisma.sessionReview.create({
      data: {
        sessionId: params.id,
        captainId: session.user.id,
        performanceRating: Math.min(10, Math.max(1, performanceRating)),
        techniqueRating: Math.min(10, Math.max(1, techniqueRating)),
        attitudeRating: Math.min(5, Math.max(1, attitudeRating)),
        comment: comment || null,
        improvements: improvements || null,
      },
    });

    // Notify rider
    const avgRating = Math.round((performanceRating + techniqueRating) / 2);
    await prisma.notification.create({
      data: {
        userId: trainingSession.enrollment.riderId,
        type: "session_reviewed",
        title: "Session Review Posted ⭐",
        message: `Your captain reviewed session #${trainingSession.sessionNumber} of ${trainingSession.enrollment.program.name}. Performance: ${performanceRating}/10, Technique: ${techniqueRating}/10.`,
        data: {
          sessionId: params.id,
          reviewId: review.id,
          performanceRating,
          techniqueRating,
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error posting session review:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}
