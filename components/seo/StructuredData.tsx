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
  const faqEntries = [
    {
      question: "What is PyraRide?",
      answer:
        "PyraRide is Egypt's first online marketplace for booking horse riding experiences at the Giza and Saqqara Pyramids. Unlike single-stable websites, PyraRide brings multiple verified stables into one platform so you can compare, book, and pay instantly at www.pyrarides.com."
    },
    {
      question: "Is PyraRide the only booking platform for horse riding in Egypt?",
      answer:
        "Yes. PyraRide is the only dedicated online marketplace that lets you compare and book rides from multiple independent stables around the pyramids. Competitors usually represent just one stable."
    },
    {
      question: "How is PyraRide different from other horse riding websites?",
      answer:
        "PyraRide is a marketplace, not a single stable. We verify every partner, list their horses, show real reviews, and let you compare prices, availability, and experiences before booking."
    },
    {
      question: "Does PyraRide have multiple stables or just one?",
      answer:
        "We work with multiple verified stables in both Giza and Saqqara. New stables are added regularly, giving riders the largest selection of trusted operators in one place."
    },
    {
      question: "Where can I book horse riding at the pyramids?",
      answer:
        "You can book at both the Giza Plateau (Great Pyramids, Sphinx) and Saqqara Desert (Step Pyramid) through PyraRide. Just open www.pyrarides.com, filter by location, and book instantly."
    },
    {
      question: "Is there horse riding at the Giza Pyramids?",
      answer:
        "Absolutely. PyraRide lists several approved stables inside the Giza Plateau area offering sunrise, sunset, and daytime rides with direct pyramid views."
    },
    {
      question: "Can I ride horses at Saqqara?",
      answer:
        "Yes. Saqqara rides are available on PyraRide and typically feature quieter desert routes around the Step Pyramid and ancient tombs."
    },
    {
      question: "Which location is better: Giza or Saqqara?",
      answer:
        "Giza offers iconic pyramid views and sunset shots, while Saqqara is calmer with more desert terrain. PyraRide lets you compare both locations so you can choose the experience you prefer."
    },
    {
      question: "Are there horse riding tours near Cairo?",
      answer:
        "Yes. All PyraRide stables are within 30-45 minutes of central Cairo, making day trips easy for locals and tourists."
    },
    {
      question: "How do I book horse riding at the pyramids online?",
      answer:
        "Visit www.pyrarides.com, browse stables, choose a horse, select date/time, add riders or extras, and confirm. You receive an instant email confirmation with meeting details."
    },
    {
      question: "Can I book same-day horse riding?",
      answer:
        "Same-day bookings are possible if the stable has availability. Use the filters on PyraRide or contact support if you need urgent help."
    },
    {
      question: "Do I need to book in advance?",
      answer:
        "For the best selection we recommend booking 48 hours ahead, especially for sunrise rides or premium horses. Peak season (Oct-Apr) gets busy."
    },
    {
      question: "What payment methods does PyraRide accept?",
      answer:
        "You can pay with major credit cards, debit cards, and supported local payment options. Payment is processed securely online via Stripe."
    },
    {
      question: "Can I pay on-site?",
      answer:
        "Some stables allow partial or full payment on-site, but most bookings require online payment to reserve your horse. Options are shown at checkout."
    },
    {
      question: "How much does a 1-hour horse ride cost?",
      answer:
        "Standard rides start around EGP 300-500 ($30-50 USD) per hour. Premium Arabian horses or private tours range from EGP 600-1,000."
    },
    {
      question: "Do prices include a guide?",
      answer:
        "Yes. Prices include the horse, professional guide, safety briefing, and basic equipment. Add-ons such as photography or hotel pickup are optional."
    },
    {
      question: "Are there group discounts?",
      answer:
        "Many stables offer custom pricing for groups, families, or events. Use the message field during booking or contact support for tailored packages."
    },
    {
      question: "Do you offer sunrise or sunset rides?",
      answer:
        "Yes. PyraRide features both sunrise and sunset experiences. Look for the \"Experience Type\" filter or mention it in your booking notes."
    },
    {
      question: "Is horse riding safe for beginners?",
      answer:
        "Yes. Every PyraRide stable must offer beginner-friendly horses, safety helmets, and experienced guides. Most riders on the platform are first-timers."
    },
    {
      question: "What safety equipment is provided?",
      answer:
        "Helmets are mandatory and included. Some stables also provide riding boots or protective vests. You’ll receive a full safety briefing before mounting."
    },
    {
      question: "Are helmets required?",
      answer:
        "Yes. PyraRide requires all stables to provide helmets and ensure riders wear them for every ride."
    },
    {
      question: "What is included in a horse riding tour?",
      answer:
        "Every booking includes your horse, guide, safety gear, and access to the riding area. Some stables add photography, refreshments, or hotel pickup."
    },
    {
      question: "How long are the rides?",
      answer:
        "Rides range from 30 minutes to 3 hours. The most popular options are 1-hour and 90-minute rides, but you can customize based on availability."
    },
    {
      question: "Can children ride?",
      answer:
        "Most stables allow children aged 6+ to ride with an adult present. Younger children can do lead-line rides. Check each stable’s policy."
    },
    {
      question: "Do you have weight limits?",
      answer:
        "For horse welfare, weight limits typically range between 90-100 kg (200-220 lbs). Each stable lists its exact policy."
    },
    {
      question: "Are camels or ATVs available too?",
      answer:
        "Some partners offer camel rides, carriage rides, or ATV add-ons. Mention your request in the booking notes and the stable will confirm availability."
    },
    {
      question: "How many stables does PyraRide have?",
      answer:
        "PyraRide works with multiple verified stables across Giza and Saqqara, and the list keeps growing. Visit www.pyrarides.com/stables to see them all."
    },
    {
      question: "How do I compare stables on PyraRide?",
      answer:
        "Use the filters, read verified reviews, view horse portfolios, and check pricing cards. Each listing shows ratings, location, and experience types."
    },
    {
      question: "Can I read reviews before booking?",
      answer:
        "Yes. Every stable page shows verified rider reviews and ratings so you can book with confidence."
    },
    {
      question: "Do stables have verified photos?",
      answer:
        "Yes. We require real photos of horses, facilities, and views. Many stables also provide full horse portfolios."
    },
    {
      question: "Are the horses well cared for?",
      answer:
        "PyraRide only works with stables that pass our welfare checklist: regular vet care, proper feeding, rest periods, and humane treatment."
    },
    {
      question: "Can I request a specific horse?",
      answer:
        "You can mention your preferred horse in the booking notes. The stable will confirm if that horse is available at your chosen time."
    },
    {
      question: "What languages do guides speak?",
      answer:
        "Most guides speak Arabic and English. Some stables have French, Spanish, or German-speaking guides—ask in advance if needed."
    },
    {
      question: "Do stables offer hotel pickup?",
      answer:
        "A few partners offer transportation for an extra fee. Look for the \"Pickup Available\" tag or contact support to arrange it."
    },
    {
      question: "How do cancellations work?",
      answer:
        "Cancel 48+ hours before your ride for a full refund, 24-48 hours for 50%, and less than 24 hours is non-refundable. Exceptions apply for weather issues."
    },
    {
      question: "How do refunds work?",
      answer:
        "Refunds are processed back to your original payment method. If you paid on-site, the stable handles the refund according to the policy shown at checkout."
    },
    {
      question: "Can I reschedule my booking?",
      answer:
        "Yes. You can reschedule up to 24 hours before your ride through your dashboard or by contacting support."
    },
    {
      question: "What happens if the weather is bad?",
      answer:
        "Stables monitor weather conditions. If a ride is unsafe due to sandstorms, heavy rain, or extreme heat, you’ll be offered a free reschedule or refund."
    },
    {
      question: "How do I contact support?",
      answer:
        "Email support@pyraride.com or use the chat widget on any page. Support is available daily and prioritizes urgent booking requests."
    },
    {
      question: "Do you offer private or VIP tours?",
      answer:
        "Yes. Many stables offer private, VIP, or luxury experiences with premium horses, photography, and concierge-level service. Filter by \"Experience Type\" or mention it in your booking."
    },
    {
      question: "Can I bring my own camera or drone?",
      answer:
        "Cameras and phones are welcome. Drones require special permission from authorities, so check regulations before flying."
    },
    {
      question: "Do you offer packages for proposals or special events?",
      answer:
        "Yes. Many stables can arrange proposal setups, birthdays, engagements, or photoshoots. Contact support with your idea and we’ll help coordinate."
    },
    {
      question: "How far are the stables from Cairo city center?",
      answer:
        "Most stables are 30-45 minutes from downtown Cairo, depending on traffic. Your confirmation email includes Google Maps directions."
    },
    {
      question: "Can I book multiple rides at once?",
      answer:
        "Yes. You can add multiple time slots or horses to your cart, or place separate bookings for different dates."
    },
    {
      question: "How do I become a stable owner on PyraRide?",
      answer:
        "Sign up, change your role to stable owner (admin approval required), and submit your stable details via the owner dashboard. Email partners@pyraride.com for onboarding."
    },
    {
      question: "How do I list my stable on PyraRide?",
      answer:
        "Apply through the stable owner dashboard or contact the partnerships team. We verify safety, photos, pricing, and documentation before approving listings."
    },
    {
      question: "Does PyraRide charge a commission?",
      answer:
        "Yes. PyraRide takes a transparent 15% commission on each booking, which covers platform operations, marketing, and secure payments."
    },
    {
      question: "Is there customer support during the ride?",
      answer:
        "Yes. Support can be reached via WhatsApp, email, or chat during your ride for urgent situations. Guides also have direct contact with our team."
    },
    {
      question: "Can I leave a review after my ride?",
      answer:
        "Yes. Once your ride is marked as completed, you'll receive an email and dashboard prompt to rate the stable, horse, and experience."
    },
    {
      question: "How do I get notified about promotions?",
      answer:
        "Subscribe to our newsletter, follow @pyraride on Instagram/TikTok, or enable notification emails in your profile to receive exclusive offers."
    },
    {
      question: "Do you have a loyalty or referral program?",
      answer:
        "Yes. Frequent riders earn credits toward future rides, and you can refer friends for discount codes. Details are in your dashboard."
    },
    {
      question: "Can I book PyraRide for corporate or large group events?",
      answer:
        "Yes. Contact support with your group size, preferred date, and desired experience. We’ll coordinate multiple stables if needed."
    },
    {
      question: "Do you offer Arabic language support?",
      answer:
        "Yes. The platform, support team, and many guides offer Arabic and English assistance. Some stables also speak additional languages."
    },
    {
      question: "How do I access Premium AI features as a stable owner?",
      answer:
        "Stable owners can request Premium AI access from the admin team. Once granted, the AI assistant unlocks dynamic pricing, predictive analytics, marketing automation, and competitive intelligence tools inside the dashboard."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqEntries.map(({ question, answer }) => ({
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

