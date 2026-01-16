import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StableDetailsClient from "@/components/stables/StableDetailsClient";
import { Metadata } from "next";

// Force static generation for these paths
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const stables = await prisma.stable.findMany({
    where: { status: "approved" },
    select: { id: true },
  });

  return stables.map((stable) => ({
    id: stable.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const stable = await prisma.stable.findUnique({
    where: { id: params.id },
    select: { name: true, description: true, imageUrl: true },
  });

  if (!stable) {
    return {
      title: "Stable Not Found | PyraRide",
    };
  }

  return {
    title: `${stable.name} | PyraRide`,
    description: stable.description,
    openGraph: {
      images: stable.imageUrl ? [stable.imageUrl] : [],
    },
  };
}

async function getStable(id: string) {
  const stable = await prisma.stable.findFirst({
    where: {
      id,
      status: "approved",
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      horses: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrls: true,
          pricePerHour: true,
          age: true,
          skills: true,
          adminTier: true,
          isActive: true,
          media: {
            select: {
              url: true,
              type: true,
              thumbnailUrl: true,
              sortOrder: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
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
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          reviewMedias: {
            select: {
              url: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          bookings: {
            where: {
              status: "completed",
            },
          },
          reviews: true,
        },
      },
    },
  });

  if (!stable) return null;

  // Calculate average ratings
  const avgStableRating =
    stable.reviews.length > 0
      ? stable.reviews.reduce((sum: number, r: any) => sum + r.stableRating, 0) /
      stable.reviews.length
      : 0;

  // Transform data to match the interface expected by Client Component
  // Note: We need to serialize dates/decimals for Client Components if they are not plain objects
  // Prisma decimals are objects, so we need to convert them. Dates are Date objects.
  // Next.js Server Components -> Client Components props must be serializable.

  const horses = stable.horses.map((horse: any) => ({
    ...horse,
    pricePerHour:
      horse.pricePerHour !== null && horse.pricePerHour !== undefined
        ? Number(horse.pricePerHour)
        : null,
    skills: horse.skills ?? [],
    skillLevel: horse.adminTier || "Beginner",
    media: Array.isArray(horse.media) ? horse.media : [],
  }));

  // Serialize the stable object for client component
  return {
    ...stable,
    horses,
    rating: Number(avgStableRating.toFixed(1)),
    totalBookings: stable._count.bookings,
    totalReviews: stable._count.reviews,
    createdAt: stable.createdAt.toISOString(), // Convert Date to string
    reviews: stable.reviews.map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(), // Convert Date to string
    })),
  };
}

export default async function StablePage({ params }: { params: { id: string } }) {
  const stable = await getStable(params.id);

  if (!stable) {
    notFound();
  }

  return <StableDetailsClient initialStable={stable as any} />;
}
