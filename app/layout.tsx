import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import ImageProtectionProvider from "@/components/providers/ImageProtectionProvider";
import { LazyAIAgent } from "@/components/shared/LazyAIAgent";
import CookieConsent from "@/components/shared/CookieConsent";
import Footer from "@/components/shared/Footer";
import OrientationLock from "@/components/shared/OrientationLock";
import { OptimalCinematicWrapper } from "@/components/OptimalCinematicWrapper";
import NotificationProvider from "@/components/providers/NotificationProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "optional", // Changed from swap to optional for better CLS
  preload: true,
  adjustFontFallback: true, // Adjust fallback font to match Poppins metrics
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#121212" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Book Horse Riding at Pyramids Egypt | PyraRide - #1 Marketplace",
    template: "%s | PyraRide - Egypt's Horse Riding Booking Platform",
  },
  description: "PyraRide is Egypt's first online marketplace for booking horse riding experiences at the Giza and Saqqara Pyramids. Compare and book from multiple verified stables in one platform. 100% verified, instant booking, best prices guaranteed. ⭐ 4.9/5 rating.",
  keywords: [
    // Primary keywords
    "horse riding Egypt",
    "horse riding pyramids",
    "horse riding Giza",
    "book horse riding Egypt",
    "horse riding booking Egypt",
    "horse riding marketplace Egypt",
    "compare horse riding stables",
    "horse riding platform Egypt",
    "online horse riding booking Egypt",
    // Location keywords
    "Giza horse riding",
    "Saqqara horse riding",
    "horse riding near pyramids",
    "pyramid horse tours",
    "horse stables Giza",
    "Egypt horse riding",
    "Cairo horse riding",
    "book horse ride Giza",
    // Experience keywords
    "safe horse riding Egypt",
    "Arabian horse riding",
    "sunset horse riding pyramids",
    "horse riding experience Egypt",
    "best horse riding Egypt",
  ],
  authors: [{ name: "PyraRide" }],
  creator: "PyraRide",
  publisher: "PyraRide",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.pyrarides.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/en",
      "ar": "/ar",
    },
  },
  openGraph: {
    title: "PyraRide - Book Your Trusted Giza Horse Riding Experience",
    description: "The Pyramids, Unforgettable. The Ride, Uncomplicated. Book your trusted, vetted ride at Giza and Saqqara.",
    url: "https://www.pyrarides.com",
    siteName: "PyraRide",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.pyrarides.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PyraRide - Horse Riding at the Pyramids",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PyraRide - Book Your Trusted Giza Horse Riding Experience",
    description: "The Pyramids, Unforgettable. The Ride, Uncomplicated.",
    creator: "@PyraRide",
    images: ["https://www.pyrarides.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        {/* DNS Prefetch for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Favicon and Icons for Search Engines */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PyraRide" />
        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        {/* Apple Touch Icons for different devices */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />
      </head>

      <body className={`${poppins.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PyraRide",
              "alternateName": "PyraRide - Horse Riding Booking Platform",
              "url": "https://www.pyrarides.com",
              "logo": "https://www.pyrarides.com/logo.png",
              "description": "PyraRide is Egypt's first and only online booking marketplace for horse riding experiences at the Giza and Saqqara Pyramids. Unlike single-stable websites, PyraRide offers multiple verified stables in one platform, allowing riders to compare prices, read reviews, and book instantly. Book from multiple verified stables in one platform.",
              "knowsAbout": [
                "Horse Riding Tours",
                "Horse Riding at Pyramids",
                "Giza Pyramids",
                "Saqqara Pyramids",
                "Egypt Tourism",
                "Adventure Travel",
                "Online Booking Platform",
                "Travel Marketplace",
                "Horse Riding Marketplace",
                "Book Horse Riding Egypt",
                "Pyramid Horse Tours",
                "Cairo Horse Riding",
                "Egypt First Marketplace",
                "Online Horse Riding Booking",
                "Compare Horse Riding Stables",
                "Verified Horse Stables",
                "Pyramid Tours Egypt",
                "Giza Plateau Horse Riding",
                "Saqqara Desert Tours"
              ],
              "makesOffer": {
                "@type": "AggregateOffer",
                "offerCount": "20+",
                "lowPrice": "300",
                "highPrice": "1000",
                "priceCurrency": "EGP",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Online Horse Riding Booking Platform",
                  "description": "PyraRide is Egypt's first marketplace for booking horse riding at the pyramids. Book from multiple verified horse stables at Giza and Saqqara Pyramids. Compare prices, read reviews, and book instantly.",
                  "serviceType": "Horse Riding Tours",
                  "provider": {
                    "@type": "Organization",
                    "name": "PyraRide"
                  },
                  "areaServed": {
                    "@type": "City",
                    "name": "Cairo"
                  }
                }
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "2500",
                "bestRating": "5",
                "worstRating": "1"
              },
              "sameAs": [
                "https://facebook.com/pyrarides",
                "https://instagram.com/pyrarides",
                "https://twitter.com/pyrarides",
                "https://tiktok.com/@pyrarides",
                "https://youtube.com/@pyrarides"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+20-123-456-7890",
                "contactType": "Customer Service",
                "areaServed": "EG",
                "availableLanguage": ["en", "ar"],
              },
            }),
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "PyraRide",
              "url": "https://www.pyrarides.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.pyrarides.com/stables?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Structured Data - Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "PyraRide",
              "image": "https://www.pyrarides.com/logo.png",
              "description": "Egypt's first online marketplace for booking horse riding experiences at the Giza and Saqqara Pyramids. Compare and book from multiple verified stables in one platform. Unlike single-stable websites, PyraRide offers the largest selection of verified stables.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Giza District",
                "addressLocality": "Cairo",
                "addressCountry": "EG"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 29.9773,
                "longitude": 31.1325
              },
              "url": "https://www.pyrarides.com",
              "telephone": "+20-123-456-7890",
              "email": "support@pyraride.com",
              "priceRange": "$$",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                  ],
                  "opens": "09:00",
                  "closes": "18:00"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "2500",
                "bestRating": "5",
                "worstRating": "1"
              },
              "sameAs": [
                "https://facebook.com/pyrarides",
                "https://instagram.com/pyrarides",
                "https://twitter.com/pyrarides",
                "https://tiktok.com/@pyrarides",
                "https://youtube.com/@pyrarides"
              ]
            }),
          }}
        />

        {/* Structured Data - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "PyraRide",
              "description": "Trusted horse riding experiences at Giza and Saqqara Pyramids",
              "url": "https://www.pyrarides.com",
              "telephone": "+20-123-456-7890",
              "email": "support@pyraride.com",
              "address": {
                "@type": "PostalAddress",
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
              "priceRange": "$$"
            }),
          }}
        />

        {/* Structured Data - FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is PyraRide?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "PyraRide is Egypt's first online marketplace for booking horse riding at the Giza and Saqqara Pyramids. Compare multiple verified stables, read reviews, and book instantly at www.pyrarides.com."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I book a ride?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Browse stables, choose your preferred horse, select date and time, add any extras, and confirm. You receive an instant email with meeting instructions and Google Maps directions."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Where can I ride?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can ride inside the Giza Plateau (Great Pyramids, Sphinx) or Saqqara Desert (Step Pyramid). Use the location filter to explore both experiences."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much does it cost?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Standard 1-hour rides start around EGP 300-500 ($30-50 USD). Premium Arabian horses or private tours range from EGP 600-1,000. Pricing is shown for every stable."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is horse riding safe for beginners?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Every PyraRide partner provides beginner-friendly horses, helmets, professional guides, and safety briefings. Most riders on PyraRide are first-timers."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Why use PyraRide instead of booking directly?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "PyraRide lets you compare multiple stables, see verified reviews, pay securely, and get 24/7 support. All partners are pre-vetted for safety, horse welfare, and quality."
                  }
                }
              ]
            }),
          }}
        />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <NotificationProvider>
            <OptimalCinematicWrapper>
              <ImageProtectionProvider />
              <OrientationLock />
              <main id="main-content" className="pb-0">{children}</main>
              <Footer />
              <LazyAIAgent />
              <CookieConsent />
              <SpeedInsights />
            </OptimalCinematicWrapper>
          </NotificationProvider>
        </AuthProvider>

        {/* Google Analytics - Load after page is interactive */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Plausible Analytics - Load on idle */}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="www.pyrarides.com"
          strategy="lazyOnload"
          defer
        />
      </body>
    </html >
  );
}
