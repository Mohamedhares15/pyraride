// Structured Data Components for Enhanced SEO

interface FAQItem {
  question: string;
  answer: string;
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.pyrarides.com/#organization",
    "name": "PyraRide",
    "description": "Egypt's first online marketplace for booking horse riding experiences at the Giza and Saqqara Pyramids. Compare and book from multiple verified stables.",
    "url": "https://www.pyrarides.com",
    "logo": "https://www.pyrarides.com/logo.png",
    "image": "https://www.pyrarides.com/og-image.jpg",
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
    "sameAs": [
      "https://facebook.com/pyrarides",
      "https://instagram.com/pyrarides",
      "https://twitter.com/pyrarides",
      "https://tiktok.com/@pyrarides",
      "https://youtube.com/@pyrarides"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQPageSchema({ items }: { items: FAQItem[] }) {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(({ question, answer }) => ({
      "@type": "Question",
      "name": question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer
      }
    }))
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
      "@type": "LocalBusiness",
      "name": "PyraRide",
      "url": "https://www.pyrarides.com",
      "@id": "https://www.pyrarides.com/#organization"
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

export function SpeakableSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", "h2", ".speakable-content"]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PyraRide",
    "url": "https://www.pyrarides.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.pyrarides.com/stables?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

