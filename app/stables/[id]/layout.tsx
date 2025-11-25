import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface LayoutProps {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const stable = await prisma.stable.findFirst({
      where: {
        id: params.id,
        status: "approved",
      },
      include: {
        reviews: {
          select: {
            stableRating: true,
            horseRating: true,
            comment: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: {
              where: {
                status: "completed",
              },
            },
          },
        },
      },
    });

    if (!stable) {
      return {
        title: "Stable Not Found | PyraRide",
        description: "The stable you're looking for doesn't exist or is no longer available.",
      };
    }

    // Calculate average rating
    const avgRating =
      stable.reviews.length > 0
        ? stable.reviews.reduce((sum, r) => sum + r.stableRating, 0) / stable.reviews.length
        : 0;

    const location = stable.location === "Giza" ? "Giza Plateau" : "Saqqara Desert";
    const title = `${stable.name} - ${location} Horse Riding | PyraRide`;
    const description = `${stable.description.substring(0, 150)}... Book your trusted horse riding experience at ${stable.location} pyramids. ${stable._count.reviews} reviews, ${avgRating.toFixed(1)}⭐ rating.`;

    const ogImage = stable.imageUrl || "https://www.pyrarides.com/og-image.jpg";

    return {
      title,
      description,
      keywords: [
        `horse riding ${stable.location}`,
        `${stable.location} stables`,
        "pyramid horse tours",
        "Egypt horse riding",
        stable.name.toLowerCase(),
        "book horse ride",
        "Giza pyramids horse",
        "Saqqara horse riding",
      ],
      alternates: {
        canonical: `https://www.pyrarides.com/stables/${params.id}`,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://www.pyrarides.com/stables/${params.id}`,
        siteName: "PyraRide",
        locale: "en_US",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${stable.name} - Horse Riding Stable at ${location}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Stable Details | PyraRide",
      description: "View details about this horse riding stable at the pyramids.",
    };
  }
}

export default function StableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

