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
        "name": "What is PyraRide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PyraRide is Egypt's first and only online booking marketplace for horse riding experiences at the Giza and Saqqara Pyramids. Unlike single-stable websites, PyraRide offers multiple verified stables on one platform, allowing you to compare prices, read reviews, and book instantly at www.pyrarides.com."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I book horse riding at the pyramids?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can book horse riding at both Giza and Saqqara Pyramids through PyraRide.com. We work with multiple verified stables in both locations, offering instant online booking and guaranteed best prices. Visit www.pyrarides.com to compare and book."
        }
      },
      {
        "@type": "Question",
        "name": "Is PyraRide a single stable or multiple stables?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PyraRide is a marketplace platform that works with multiple verified stables. You can compare and book from different stables in Giza and Saqqara, unlike single-stable websites that only offer one location."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book a horse riding experience?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Booking is simple on PyraRide: Browse available stables at www.pyrarides.com, select your preferred stable and horse, choose your date, time, and duration, complete the booking form, and receive your booking confirmation via email. Instant booking available 24/7."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PyraRide accepts major credit cards (Visa, Mastercard), debit cards, and some local payment methods. Some stables may also accept cash payment on-site. Payment options are displayed during checkout."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my booking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Cancellation policy on PyraRide: 48+ hours before: 100% refund. 24-48 hours before: 50% refund. Less than 24 hours: No refund. Modifications are free if made 48+ hours in advance."
        }
      },
      {
        "@type": "Question",
        "name": "Is horse riding safe for beginners?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All PyraRide verified stables offer beginner-friendly horses, safety equipment, professional guides, and safety briefings before each ride. No prior experience needed."
        }
      },
      {
        "@type": "Question",
        "name": "How much does a horse riding experience cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prices on PyraRide vary by stable and experience. Standard 1-hour rides: EGP 300-500 (approx $30-50 USD). Premium Arabian horses: EGP 500-800 per hour. Sunrise/sunset tours: EGP 600-1000. Visit www.pyrarides.com to see current prices."
        }
      },
      {
        "@type": "Question",
        "name": "Can I compare different stables on PyraRide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! That's the main advantage of PyraRide. As Egypt's only marketplace platform, you can compare multiple stables side-by-side, read reviews, compare prices, and choose the best option for your needs. Visit www.pyrarides.com/stables to browse all options."
        }
      },
      {
        "@type": "Question",
        "name": "How is PyraRide different from other horse riding websites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PyraRide is Egypt's first online marketplace for horse riding, meaning we offer multiple verified stables on one platform. Other websites typically represent only one stable. With PyraRide, you can compare prices, locations, and reviews all in one place at www.pyrarides.com."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I go horse riding at the pyramids?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can book horse riding at both Giza Plateau and Saqqara Desert Pyramids through PyraRide.com. We offer verified stables in both locations, allowing you to choose based on your preference. All bookings can be made instantly online."
        }
      },
      {
        "@type": "Question",
        "name": "Which location is better: Giza or Saqqara for horse riding?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Both locations offer unique experiences. Giza Plateau offers views of the Great Pyramids and Sphinx. Saqqara features the Step Pyramid and ancient tombs. You can compare stables in both locations on PyraRide.com to find the best option for your preferences."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to book in advance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend booking at least 48 hours in advance through PyraRide.com, especially during peak tourist seasons (October-April). For sunrise rides or specific horses, booking 3-7 days ahead is ideal. Same-day bookings may be available but subject to availability."
        }
      },
      {
        "@type": "Question",
        "name": "How many stables does PyraRide have?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PyraRide works with multiple verified stables across Giza and Saqqara. The exact number varies as we regularly add new verified partners. Visit www.pyrarides.com/stables to see all available options and compare them in one place."
        }
      },
      {
        "@type": "Question",
        "name": "Why book through PyraRide instead of directly with a stable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PyraRide offers several advantages: Compare multiple stables and prices in one place, read verified reviews from real customers, instant online booking 24/7, secure payment processing, best price guarantee, and 24/7 customer support. All stables are pre-verified for safety and quality."
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

