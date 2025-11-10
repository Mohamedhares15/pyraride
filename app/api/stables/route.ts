import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAuthSchema } from "@/lib/ensure-auth-schema";

const POSITIVE_KEYWORDS = [
  "amazing",
  "awesome",
  "beautiful",
  "calm",
  "clean",
  "comfortable",
  "excellent",
  "fantastic",
  "friendly",
  "fun",
  "great",
  "helpful",
  "love",
  "perfect",
  "professional",
  "recommend",
  "smooth",
  "wonderful",
];

const NEGATIVE_KEYWORDS = [
  "bad",
  "dirty",
  "disappointing",
  "disorganized",
  "hard",
  "poor",
  "problem",
  "rough",
  "rude",
  "slow",
  "terrible",
  "uncomfortable",
  "unfriendly",
  "unsafe",
  "waste",
  "worst",
];

function analyzeReviewComment(comment?: string | null): number {
  if (!comment) return 0;
  const normalized = comment.toLowerCase();
  const positiveMatches = POSITIVE_KEYWORDS.reduce(
    (count, keyword) => (normalized.includes(keyword) ? count + 1 : count),
    0
  );
  const negativeMatches = NEGATIVE_KEYWORDS.reduce(
    (count, keyword) => (normalized.includes(keyword) ? count + 1 : count),
    0
  );

  if (positiveMatches === 0 && negativeMatches === 0) {
    return 0;
  }

  const rawScore =
    (positiveMatches - negativeMatches) / (positiveMatches + negativeMatches);

  // Clamp the adjustment so a single comment nudges the rating slightly (max ±0.5)
  return Math.max(-0.5, Math.min(0.5, rawScore * 0.5));
}

function computeAdjustedRating<T extends { [key: string]: any }>(
  reviews: T[] | undefined,
  ratingKey: "stableRating" | "horseRating"
): { rating: number; reviewCount: number } {
  if (!reviews || reviews.length === 0) {
    return { rating: 0, reviewCount: 0 };
  }

  const reviewCount = reviews.length;
  const baseAverage =
    reviews.reduce(
      (sum, review) => sum + Number(review?.[ratingKey] ?? 0),
      0
    ) / reviewCount;

  const sentimentAdjustment =
    reviews.reduce(
      (sum, review) => sum + analyzeReviewComment(review?.comment),
      0
    ) / reviewCount;

  const adjusted = Math.max(0, Math.min(5, baseAverage + sentimentAdjustment));
  return { rating: Number(adjusted.toFixed(2)), reviewCount };
}

export async function GET(req: NextRequest) {
  try {
    await ensureAuthSchema();

    const session = await getServerSession();
    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const minRating = searchParams.get("minRating");
    const ownerOnly = searchParams.get("ownerOnly") === "true"; // Get only owner's stable
    const sort = searchParams.get("sort") || "recommended";

    // Build where clause
    const where: any = {
      status: "approved",
    };

    // If ownerOnly is true and user is logged in as stable owner, return only their stable
    if (ownerOnly && session?.user?.role === "stable_owner") {
      where.ownerId = session.user.id;
    }

    // Filter by location
    if (location && location !== "all") {
      where.location = {
        equals: location,
        mode: "insensitive",
      };
    }

    // Filter by search term (name or description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get stables with their reviews for rating calculation
    const stables = await prisma.stable.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviews: {
          select: {
            stableRating: true,
            horseRating: true,
            comment: true,
          },
        },
        horses: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            imageUrls: true,
            pricePerHour: true,
            age: true,
            skills: true,
            stable: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
            reviews: {
              select: {
                id: true,
                horseRating: true,
                comment: true,
              },
            },
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
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
        _count: {
          select: {
            bookings: {
              where: {
                status: "completed",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average ratings and add horse count + image
    const distanceLookup: Record<string, number> = {
      giza: 0,
      saqqara: 25,
    };

    const stablesWithRating = stables.map((stable: any) => {
      const { rating: stableRating, reviewCount: stableReviewCount } =
        computeAdjustedRating(stable.reviews, "stableRating");

      // Get image from first horse if available
      const firstHorseMedia =
        stable.horses.flatMap((horse: any) => horse.media ?? []).find(
          (media: any) => media.type === "image"
        );
      const imageUrl =
        firstHorseMedia?.url ||
        (stable.horses.length > 0 && stable.horses[0].imageUrls?.length > 0
          ? stable.horses[0].imageUrls[0]
          : "/hero-bg.webp");

      const distanceKey = typeof stable.location === "string" ? stable.location.toLowerCase() : "";
      const distanceKm =
        distanceKey in distanceLookup ? distanceLookup[distanceKey] : 40;

      const horses = stable.horses.map((horse: any) => {
        const primaryMedia = horse.media?.find((m: any) => m.type === "image");
        const fallbackImage =
          horse.imageUrls && horse.imageUrls.length > 0 ? horse.imageUrls[0] : imageUrl;
        const { rating: horseRating, reviewCount: horseReviewCount } =
          computeAdjustedRating(horse.reviews, "horseRating");

        return {
          id: horse.id,
          name: horse.name,
          imageUrl: primaryMedia?.url ?? fallbackImage,
          pricePerHour:
            horse.pricePerHour !== null && horse.pricePerHour !== undefined
              ? Number(horse.pricePerHour)
              : null,
          stableId: horse.stable?.id ?? stable.id,
          stableName: horse.stable?.name ?? stable.name,
          stableLocation: horse.stable?.location ?? stable.location,
          rating:
            horseReviewCount > 0
              ? horseRating
              : stableRating,
          reviewCount: horseReviewCount,
          totalBookings:
            typeof horse._count?.bookings === "number"
              ? horse._count.bookings
              : stable._count.bookings,
          distanceKm,
          stableRating,
        };
      });

      return {
        id: stable.id,
        name: stable.name,
        description: stable.description,
        location: stable.location,
        address: stable.address,
        owner: stable.owner,
        rating: stableRating,
        totalBookings: stable._count.bookings,
        totalReviews: stableReviewCount,
        horseCount: stable.horses.length,
        imageUrl: imageUrl,
        createdAt: stable.createdAt,
        distanceKm,
        horses,
      };
    });

    // Filter by minimum rating if provided
    const minRatingValue = minRating ? Number(minRating) : null;
    const filteredStables =
      minRatingValue !== null
        ? stablesWithRating.filter((s: any) => s.rating >= minRatingValue)
        : stablesWithRating;

    const sortByHorsePrice = sort === "price-asc" || sort === "price-desc";

    if (sortByHorsePrice) {
      const horseEntries = stablesWithRating
        .flatMap((stable: any) =>
          stable.horses
            .filter(
              (horse: any) =>
                horse.pricePerHour !== null && horse.pricePerHour !== undefined
            )
            .filter((horse: any) => {
              if (minRatingValue === null) return true;
              if (typeof horse.rating === "number") {
                return horse.rating >= minRatingValue;
              }
              return stable.rating >= minRatingValue;
            })
            .map((horse: any) => ({
              type: "horse",
              stableId: horse.stableId,
              stableName: horse.stableName,
              stableLocation: horse.stableLocation,
              distanceKm: horse.distanceKm,
              id: horse.id,
              name: horse.name,
              imageUrl: horse.imageUrl,
              pricePerHour: Number(horse.pricePerHour),
              rating: horse.rating ?? stable.rating,
              totalBookings: horse.totalBookings ?? stable.totalBookings,
              reviewCount: horse.reviewCount ?? 0,
            }))
        )
        .filter((entry: any) => Number.isFinite(entry.pricePerHour));

      horseEntries.sort((a: any, b: any) =>
        sort === "price-asc"
          ? a.pricePerHour - b.pricePerHour
          : b.pricePerHour - a.pricePerHour
      );

      return NextResponse.json({
        stables: horseEntries,
        mode: "horse",
      });
    }

    let sortedStables = [...filteredStables];
    switch (sort) {
      case "location":
        sortedStables.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case "rating":
        sortedStables.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        sortedStables.sort(
          (a, b) =>
            (a.distanceKm ?? Number.POSITIVE_INFINITY) -
            (b.distanceKm ?? Number.POSITIVE_INFINITY)
        );
        break;
      default:
        sortedStables.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return NextResponse.json({
      stables: sortedStables,
      mode: "stable",
    });
  } catch (error) {
    console.error("Error fetching stables:", error);
    return NextResponse.json(
      { error: "Failed to fetch stables" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== "stable_owner") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, location, address } = body;

    // Check if user already has a stable
    const existingStable = await prisma.stable.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existingStable) {
      return NextResponse.json(
        { error: "You already have a stable registered" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !description || !location || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create stable
    const stable = await prisma.stable.create({
      data: {
        name,
        description,
        location,
        address,
        ownerId: session.user.id,
        status: "pending_approval",
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ stable }, { status: 201 });
  } catch (error) {
    console.error("Error creating stable:", error);
    return NextResponse.json(
      { error: "Failed to create stable" },
      { status: 500 }
    );
  }
}

