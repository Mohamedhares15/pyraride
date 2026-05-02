import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import StableShareClient from "@/components/stables/StableShareClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { stableId: string };
}): Promise<Metadata> {
  const stable = await prisma.stable.findFirst({
    where: { id: params.stableId, status: "approved", isHidden: false },
    select: { name: true, description: true, imageUrl: true, location: true },
  });

  if (!stable) {
    return { title: "Stable | PyraRides" };
  }

  return {
    title: `${stable.name} | Book Horse Riding`,
    description: `Book a horse riding experience with ${stable.name} near the Pyramids. Powered by PyraRides.`,
    openGraph: {
      title: `${stable.name} — Book Horse Riding at the Pyramids`,
      description: `Ride with ${stable.name} in ${stable.location}. Instant booking, verified stable.`,
      images: stable.imageUrl ? [stable.imageUrl] : [],
    },
  };
}

async function getStable(stableId: string) {
  const stable = await prisma.stable.findFirst({
    where: {
      id: stableId,
      status: "approved",
      isHidden: false,
    },
    include: {
      owner: {
        select: { id: true, fullName: true, email: true },
      },
      horses: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          imageUrls: true,
          pricePerHour: true,
          discountPercent: true,
          color: true,
          age: true,
          skills: true,
          adminTier: true,
          isActive: true,
          media: {
            select: { url: true, type: true, thumbnailUrl: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      reviews: {
        select: {
          id: true,
          stableRating: true,
          horseRating: true,
          comment: true,
          createdAt: true,
          rider: {
            select: { id: true, fullName: true, email: true },
          },
          reviewMedias: { select: { url: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          bookings: { where: { status: "completed" } },
          reviews: true,
        },
      },
    },
  });

  if (!stable) return null;

  const avgStableRating =
    stable.reviews.length > 0
      ? stable.reviews.reduce((sum: number, r: any) => sum + r.stableRating, 0) /
        stable.reviews.length
      : 0;

  const horses = stable.horses.map((horse: any) => ({
    ...horse,
    pricePerHour:
      horse.pricePerHour !== null && horse.pricePerHour !== undefined
        ? Number(horse.pricePerHour)
        : null,
    discountPercent: horse.discountPercent ?? null,
    color: horse.color ?? null,
    skills: horse.skills ?? [],
    skillLevel: horse.adminTier || "Beginner",
    media: Array.isArray(horse.media) ? horse.media : [],
  }));

  return {
    ...stable,
    horses,
    rating: Number(avgStableRating.toFixed(1)),
    totalBookings: stable._count.bookings,
    totalReviews: stable._count.reviews,
    createdAt: stable.createdAt.toISOString(),
    reviews: stable.reviews.map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export default async function StableSharePage({
  params,
}: {
  params: { stableId: string };
}) {
  const stable = await getStable(params.stableId);

  if (!stable) {
    notFound();
  }

  return <StableShareClient initialStable={stable as any} />;
}
