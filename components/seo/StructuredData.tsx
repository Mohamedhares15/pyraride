// Structured Data Components for Enhanced SEO

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.pyrarides.com/#organization",
    "name": "PyraRide",
    "description": "Trusted horse riding experiences at the Giza and Saqqara Pyramids",
    "url": "https://www.pyrarides.com",
    "telephone": "+20-123-456-7890",
    "email": "support@pyraride.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Giza District",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "29.9792",
      "longitude": "31.1342"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$",
    "servesCuisine": "N/A",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "100",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I book a horse riding experience?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Booking is simple: Browse available stables on our platform, select your preferred stable and horse, choose your date, time, and duration, complete the booking form, and receive your booking confirmation via email."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept major credit cards (Visa, Mastercard), debit cards, and some local payment methods. Some stables may also accept cash payment on-site."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my booking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! 48+ hours before: 100% refund. 24-48 hours before: 50% refund. Less than 24 hours: No refund. Modifications are free if made 48+ hours in advance."
        }
      },
      {
        "@type": "Question",
        "name": "Is horse riding safe for beginners?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All our verified stables offer beginner-friendly horses, safety equipment, professional guides, and safety briefings before each ride."
        }
      },
      {
        "@type": "Question",
        "name": "How much does a horse riding experience cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prices vary by stable and experience. Standard 1-hour rides: $30-50 USD. Premium Arabian horses: $50-80 USD per hour. Sunrise/sunset tours: $60-100 USD."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Horse Riding Tours",
    "provider": {
      "@type": "Organization",
      "name": "PyraRide",
      "url": "https://www.pyrarides.com"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Giza and Saqqara, Egypt"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Horse Riding Experiences",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Standard Horse Riding Experience",
            "description": "1-hour guided horse ride with pyramid views"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Premium Arabian Horse Ride",
            "description": "Premium experience with purebred Arabian horses"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "VIP Private Tour",
            "description": "Exclusive private guided tour with luxury amenities"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

