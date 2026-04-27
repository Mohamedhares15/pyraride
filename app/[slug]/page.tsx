import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StableDetailsClient from "@/components/stables/StableDetailsClient";

export const dynamic = "force-dynamic";

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

interface StablePageProps {
  params: { slug: string };
}

async function fetchStableBySlugOrName(slug: string) {
  // 1. Try exact slug match
  let stable = await prisma.stable.findFirst({
    where: { slug, status: "approved", isHidden: false },
    include: stableInclude,
  });

  if (stable) return stable;

  // 2. Fall back: derive slug from all stable names
  const stables = await prisma.stable.findMany({
    where: { status: "approved", isHidden: false },
    select: { id: true, name: true, slug: true },
  });
  const matched = stables.find((s) => (s.slug || toSlug(s.name)) === slug);
  if (!matched) return null;

  // Auto-save the slug
  await prisma.stable.update({ where: { id: matched.id }, data: { slug } });

  // Refetch full data
  return prisma.stable.findFirst({ where: { id: matched.id }, include: stableInclude });
}

const stableInclude = {
  owner: { select: { id: true, fullName: true, email: true } },
  horses: {
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      discountPercent: true,
      imageUrls: true,
      pricePerHour: true,
      age: true,
      skills: true,
      adminTier: true,
      isActive: true,
      color: true,
      skillLevel: true,
      media: {
        select: { url: true, type: true, thumbnailUrl: true, sortOrder: true },
        orderBy: { sortOrder: "asc" as const },
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
      rider: { select: { id: true, fullName: true, email: true } },
      reviewMedias: { select: { url: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 20,
  },
  _count: { select: { bookings: true, reviews: true } },
} as const;

export default async function StableBySlugPage({ params }: StablePageProps) {
  const stable = await fetchStableBySlugOrName(params.slug);
  if (!stable) return notFound();

  const avgRating =
    stable.reviews.length > 0
      ? stable.reviews.reduce((sum, r) => sum + r.stableRating, 0) / stable.reviews.length
      : 0;

  const initialStable = {
    id: stable.id,
    name: stable.name,
    description: stable.description,
    location: stable.location,
    address: stable.address,
    imageUrl: stable.imageUrl,
    rating: Math.round(avgRating * 10) / 10,
    totalBookings: stable._count.bookings,
    totalReviews: stable._count.reviews,
    minLeadTimeHours: stable.minLeadTimeHours,
    createdAt: stable.createdAt.toISOString(),
    owner: stable.owner,
    horses: stable.horses.map((h) => ({
      ...h,
      pricePerHour: h.pricePerHour ? Number(h.pricePerHour) : null,
    })),
    reviews: stable.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return <StableDetailsClient initialStable={initialStable} isIsolated={true} />;
}
