import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import ImageProtectionProvider from "@/components/providers/ImageProtectionProvider";
import AIAgent from "@/components/shared/AIAgent";
import CookieConsent from "@/components/shared/CookieConsent";
import MobileFooter from "@/components/shared/MobileFooter";
import { GoogleAnalytics, Plausible } from "@/components/shared/Analytics";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "PyraRide - Book Your Trusted Giza Horse Riding Experience",
    template: "%s | PyraRide",
  },
  description: "Book your trusted, vetted ride at the Giza and Saqqara Pyramids. Professional horse stables with verified reviews and safety certifications.",
  keywords: ["horse riding", "Giza", "Saqqara", "Egypt", "tourism", "pyramids", "horses", "ancient egypt"],
  authors: [{ name: "PyraRide" }],
  creator: "PyraRide",
  publisher: "PyraRide",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pyraride.vercel.app"),
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
    url: "https://pyraride.vercel.app",
    siteName: "PyraRide",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://pyraride.vercel.app/og-image.jpg",
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
    images: ["https://pyraride.vercel.app/og-image.jpg"],
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
        
        {/* Preload critical resources */}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PyraRide",
              "url": "https://pyraride.vercel.app",
              "logo": "https://pyraride.vercel.app/logo.png",
              "description": "Book your trusted, vetted ride at the Giza and Saqqara Pyramids",
              "sameAs": [
                "https://facebook.com/pyraride",
                "https://instagram.com/pyraride",
                "https://twitter.com/pyraride",
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
              "url": "https://pyraride.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://pyraride.vercel.app/stables?search={search_term_string}",
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
              "image": "https://pyraride.vercel.app/logo.png",
              "description": "Egypt's #1 trusted platform for booking horse riding experiences at the Giza and Saqqara Pyramids",
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
              "url": "https://pyraride.vercel.app",
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
                "https://facebook.com/pyraride",
                "https://instagram.com/pyraride",
                "https://twitter.com/pyraride",
                "https://youtube.com/@pyraride"
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
              "url": "https://pyraride.vercel.app",
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
          <ImageProtectionProvider />
          <main id="main-content" className="pb-0 md:pb-0">{children}</main>
          <AIAgent />
          <CookieConsent />
          {/* MobileFooter removed - using off-canvas menu instead */}
          <GoogleAnalytics trackingId={process.env.NEXT_PUBLIC_GA_ID} />
          <Plausible domain="pyraride.vercel.app" />
        </AuthProvider>
      </body>
    </html>
  );
}
