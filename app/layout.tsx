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
import { WebVitals } from "@/components/analytics/WebVitals";
import { LocalBusinessSchema, WebSiteSchema, SpeakableSchema } from "@/components/seo/StructuredData";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "optional", // Changed from swap to optional for better CLS
  preload: true,
  adjustFontFallback: true, // Adjust fallback font to match Poppins metrics
});

// Viewport export removed in favor of manual meta tags for better compatibility with Instagram browser

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
    // Marketplace keywords
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PyraRide",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="light">
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

        {/* Apple Touch Icons for different devices */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

        {/* Structured Data */}
        <LocalBusinessSchema />
        <WebSiteSchema />
        <SpeakableSchema />
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
              <SpeedInsights />
              <WebVitals />
            </OptimalCinematicWrapper>
            <LazyAIAgent />
            <CookieConsent />
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
    </html>
  );
}
