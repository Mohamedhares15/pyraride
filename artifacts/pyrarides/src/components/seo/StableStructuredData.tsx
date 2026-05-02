"use client";

interface StableStructuredDataProps {
  stable: {
    id: string;
    name: string;
    description: string;
    location: string;
    address: string;
    imageUrl?: string | null;
    rating: number;
    totalReviews: number;
  };
  reviews?: Array<{
    id: string;
    stableRating: number;
    comment: string;
    createdAt: string;
    rider: {
      fullName: string | null;
      email: string;
    };
  }>;
}

export function StableStructuredData({ stable, reviews = [] }: StableStructuredDataProps) {
  const baseUrl = "https://www.pyrarides.com";
  const stableUrl = `${baseUrl}/stables/${stable.id}`;
  
  // Calculate aggregate rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.stableRating, 0) / reviews.length
    : stable.rating || 0;

  // LocalBusiness Schema for the stable
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${stableUrl}#localbusiness`,
    "name": stable.name,
    "description": stable.description,
    "url": stableUrl,
    "image": stable.imageUrl || `${baseUrl}/og-image.jpg`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": stable.address,
      "addressLocality": stable.location,
      "addressRegion": "Giza",
      "addressCountry": "EG",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": stable.location === "Giza" ? "29.9792" : "29.8711",
      "longitude": stable.location === "Giza" ? "31.1342" : "31.2167",
    },
    "aggregateRating": stable.totalReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": stable.totalReviews,
      "bestRating": "5",
      "worstRating": "1",
    } : undefined,
    "priceRange": "$$",
    "serviceArea": {
      "@type": "City",
      "name": stable.location,
    },
    "areaServed": {
      "@type": "City",
      "name": stable.location === "Giza" ? "Giza Plateau" : "Saqqara Desert",
    },
  };

  // Remove undefined fields
  if (!localBusinessSchema.aggregateRating) {
    delete (localBusinessSchema as any).aggregateRating;
  }

  // Review schemas
  const reviewSchemas = reviews.slice(0, 10).map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "LocalBusiness",
      "name": stable.name,
      "@id": `${stableUrl}#localbusiness`,
    },
    "author": {
      "@type": "Person",
      "name": review.rider.fullName || review.rider.email.split("@")[0],
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.stableRating,
      "bestRating": "5",
      "worstRating": "1",
    },
    "reviewBody": review.comment,
    "datePublished": review.createdAt,
  }));

  // Service/Product Schema for horse riding services
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Horse Riding Tours",
    "provider": {
      "@type": "LocalBusiness",
      "name": stable.name,
      "@id": `${stableUrl}#localbusiness`,
    },
    "areaServed": {
      "@type": "Place",
      "name": stable.location === "Giza" ? "Giza Plateau" : "Saqqara Desert",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": stable.location,
        "addressCountry": "EG",
      },
    },
    "description": `Professional horse riding experiences at ${stable.location} pyramids. ${stable.name} offers safe, guided tours with verified horses and professional guides.`,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "USD",
      "priceRange": "$$",
      "category": "Horse Riding Tours",
    },
  };

  return (
    <>
      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      
      {/* Review Schemas */}
      {reviewSchemas.map((review, index) => (
        <script
          key={`review-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
        />
      ))}
    </>
  );
}

