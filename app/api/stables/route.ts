import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// In-memory cache — Fly.io has no CDN, so we cache in the Node process
// Stables list rarely changes, 1 hour TTL is safe
const stablesListCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour


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
  ratingKey: "stableRating" | "horseRating",
  fallbackRating = 0
): { rating: number; reviewCount: number } {
  if (!reviews || reviews.length === 0) {
    return { rating: Number(fallbackRating.toFixed(2)), reviewCount: 0 };
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
    // Build cache key from query params (ownerOnly requests bypass cache)
    const searchParams = req.nextUrl.searchParams;
    const ownerOnly = searchParams.get("ownerOnly") === "true";
    const cacheKey = req.nextUrl.search || "?";

    const session = await getServerSession();
    const isAdmin = session?.user?.role === "admin";

    // Serve from memory cache if valid (skip cache for owner-specific requests and admins)
    if (!ownerOnly && !isAdmin) {
      const cached = stablesListCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return NextResponse.json(cached.data, {
          headers: { 'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate', 'X-Cache': 'HIT' },
        });
      }
    }


    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const minRating = searchParams.get("minRating");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const color = searchParams.get("color");
    const skillsParam = searchParams.get("skills");
    const skills = skillsParam ? skillsParam.split(",") : null;
    const sort = searchParams.get("sort") || "recommended";

    const isStableOwner = session?.user?.role === "stable_owner";

    // Build where clause
    const where: any = {
      status: "approved",
    };

    // Set up security filters
    if (isAdmin) {
      // Admins can see everything, no hidden filter needed
    } else if (ownerOnly && isStableOwner) {
      // Stable owner viewing their own dashboard
      where.ownerId = session.user.id;
      // They can see their own hidden stables, so no isHidden = false filter needed
    } else {
      // Public users (or unauthorized ownerOnly requests) cannot see hidden stables
      where.isHidden = false;
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
        owners: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviews: {
          select: {
            stableId: true,
            horseId: true,
            stableRating: true,
            horseRating: true,
            comment: true,
          },
        },
        horses: {
          where: {
            isActive: true,
            ...(color && color !== "all" ? { color } : {}),
            ...(skills && skills.length > 0 ? { skills: { hasSome: skills } } : {}),
          },
          select: {
            id: true,
            name: true,
            discountPercent: true,
            imageUrls: true,
            pricePerHour: true,
            color: true,
            skills: true,
            skillLevel: true,
            adminTier: true,

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

    const stableReviewsMap = new Map<
      string,
      { stableRating: number; comment?: string | null }[]
    >();
    const horseReviewsMap = new Map<
      string,
      { horseRating: number; comment?: string | null }[]
    >();

    for (const stable of stables) {
      for (const review of stable.reviews) {
        if (review.stableId && typeof review.stableRating === "number") {
          const existing = stableReviewsMap.get(review.stableId) ?? [];
          existing.push({
            stableRating: review.stableRating,
            comment: review.comment,
          });
          stableReviewsMap.set(review.stableId, existing);
        }

        if (review.horseId && typeof review.horseRating === "number") {
          const existing = horseReviewsMap.get(review.horseId) ?? [];
          existing.push({
            horseRating: review.horseRating,
            comment: review.comment,
          });
          horseReviewsMap.set(review.horseId, existing);
        }
      }
    }

    // Calculate average ratings and add horse count + image
    const distanceLookup: Record<string, number> = {
      giza: 0,
      saqqara: 25,
    };

    const stablesWithRating = (stables || []).map((stable: any) => {
      const stableReviewEntries = stableReviewsMap.get(stable.id) ?? [];
      const { rating: stableRating, reviewCount: stableReviewCount } =
        computeAdjustedRating(stableReviewEntries, "stableRating", 0);

      // Use stable's own image first, then fallback to first horse if available
      let imageUrl = stable.imageUrl || null;

      // If no stable image, get image from first horse
      if (!imageUrl) {
        const firstHorseMedia =
          stable.horses.flatMap((horse: any) => horse.media ?? []).find(
            (media: any) => media.type === "image"
          );
        imageUrl =
          firstHorseMedia?.url ||
          (stable.horses.length > 0 && stable.horses[0].imageUrls?.length > 0
            ? stable.horses[0].imageUrls[0]
            : "/hero-bg.webp");
      }

      const distanceKey = typeof stable.location === "string" ? stable.location.toLowerCase() : "";
      const distanceKm =
        distanceKey in distanceLookup ? distanceLookup[distanceKey] : 40;

      const horses = (stable.horses || []).map((horse: any) => {
        const primaryMedia = horse.media?.find((m: any) => m.type === "image");
        const horseReviewEntries = horseReviewsMap.get(horse.id) ?? [];
        const { rating: horseRating, reviewCount: horseReviewCount } =
          computeAdjustedRating(
            horseReviewEntries,
            "horseRating",
            stableRating > 0 ? stableRating : 0
          );

        // Determine horse image URL with proper fallback chain
        let horseImageUrl = "/hero-bg.webp"; // Default fallback
        if (primaryMedia?.url) {
          horseImageUrl = primaryMedia.url;
        } else if (horse.imageUrls && Array.isArray(horse.imageUrls) && horse.imageUrls.length > 0 && horse.imageUrls[0]) {
          horseImageUrl = horse.imageUrls[0];
        } else if (imageUrl) {
          horseImageUrl = imageUrl; // Use stable's image as fallback
        }

        return {
          id: horse.id,
          name: horse.name,
          imageUrl: horseImageUrl,
          imageUrls: Array.isArray(horse.imageUrls) ? horse.imageUrls : [],
          media: Array.isArray(horse.media) ? horse.media : [],
          pricePerHour:
            horse.pricePerHour !== null && horse.pricePerHour !== undefined
              ? Number(horse.pricePerHour)
              : null,
          stableId: stable.id,
          stableName: stable.name,
          stableLocation: stable.location,
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
          color: horse.color,
          skills: horse.skills,
          skillLevel: horse.skillLevel,
          adminTier: horse.adminTier,
          discountPercent: horse.discountPercent,
        };
      });

      return {
        id: stable.id,
        name: stable.name,
        description: stable.description,
        location: stable.location,
        address: stable.address,
        owners: stable.owners,
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
    let filteredStables =
      minRatingValue !== null
        ? stablesWithRating.filter((s: any) => s.rating >= minRatingValue)
        : stablesWithRating;

    // Filter by price range if provided
    const minPriceValue = minPrice ? Number(minPrice) : null;
    const maxPriceValue = maxPrice ? Number(maxPrice) : null;

    if (minPriceValue !== null || maxPriceValue !== null) {
      filteredStables = filteredStables.filter((s: any) => {
        return s.horses.some((h: any) => {
          const price = h.pricePerHour;
          if (price === null || price === undefined) return false;
          if (minPriceValue !== null && price < minPriceValue) return false;
          if (maxPriceValue !== null && price > maxPriceValue) return false;
          return true;
        });
      });
    }

    const sortByHorsePrice = sort === "price-asc" || sort === "price-desc" || minPrice || maxPrice || (color && color !== "all") || (skills && skills.length > 0);

    if (sortByHorsePrice) {
      const horseEntries = stablesWithRating
        .flatMap((stable: any) =>
          stable.horses
            .filter(
              (horse: any) =>
                horse.pricePerHour !== null && horse.pricePerHour !== undefined
            )
            .filter((horse: any) => {
              // Filter by rating
              if (minRatingValue !== null) {
                const rating = typeof horse.rating === "number" ? horse.rating : stable.rating;
                if (rating < minRatingValue) return false;
              }

              // Filter by price
              const price = horse.pricePerHour;
              if (minPriceValue !== null && price < minPriceValue) return false;
              if (maxPriceValue !== null && price > maxPriceValue) return false;

              return true;
            })
            .map((horse: any) => {
              return {
                type: "horse",
                stableId: stable.id,
                stableName: stable.name,
                stableLocation: stable.location,
                distanceKm: horse.distanceKm || stable.distanceKm,
                id: horse.id,
                name: horse.name,
                imageUrl: horse.imageUrl || stable.imageUrl || "/hero-bg.webp",
                imageUrls: Array.isArray(horse.imageUrls) ? horse.imageUrls : [],
                media: Array.isArray(horse.media) ? horse.media : [],
                pricePerHour: Number(horse.pricePerHour),
                rating: horse.rating ?? stable.rating,
                totalBookings: horse.totalBookings ?? stable.totalBookings,
                reviewCount: horse.reviewCount ?? 0,
                discountPercent: horse.discountPercent,
                skills: horse.skills,
                skillLevel: horse.skillLevel,
                adminTier: horse.adminTier,
                color: horse.color,
              };
            })
        )
        .filter((entry: any) => Number.isFinite(entry.pricePerHour));

      horseEntries.sort((a: any, b: any) =>
        sort === "price-asc"
          ? a.pricePerHour - b.pricePerHour
          : b.pricePerHour - a.pricePerHour
      );

      const horseResult = { stables: horseEntries, mode: "horse" };

      // Store in cache (skip for owner-only requests and admins)
      if (!ownerOnly && !isAdmin) {
        stablesListCache.set(cacheKey, { data: horseResult, expiresAt: Date.now() + CACHE_TTL_MS });
      }

      return NextResponse.json(horseResult, {
        headers: { 'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate', 'X-Cache': 'MISS' },
      });
    }

    let sortedStables = [...filteredStables];
    switch (sort) {
      case "location":
        sortedStables.sort((a, b) => {
          const locationCompare = a.location.localeCompare(b.location);
          if (locationCompare !== 0) return locationCompare;
          // If locations are the same, sort by name
          return a.name.localeCompare(b.name);
        });
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

    const stableResult = { stables: sortedStables, mode: "stable" };

    // Store in cache (skip for owner-only requests and admins)
    if (!ownerOnly && !isAdmin) {
      stablesListCache.set(cacheKey, { data: stableResult, expiresAt: Date.now() + CACHE_TTL_MS });
    }

    return NextResponse.json(stableResult, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate', 'X-Cache': 'MISS' },
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
    // Fetch user to get stableId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stableId: true },
    });
    const existingStable = user?.stableId ? await prisma.stable.findUnique({
      where: { id: user.stableId },
    }) : null;

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
        owners: {
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

