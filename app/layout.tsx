import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import dynamic from 'next/dynamic';

const LazyAIAgent = dynamic(() =>
  import('@/components/shared/LazyAIAgent').then(mod => mod.LazyAIAgent),
  { ssr: false }
);
const CookieConsent = dynamic(() => import('@/components/shared/CookieConsent'), { ssr: false });
const OrientationLock = dynamic(() => import('@/components/shared/OrientationLock'), { ssr: false });
const ImageProtectionProvider = dynamic(
  () => import('@/components/providers/ImageProtectionProvider'),
  { ssr: false }
);

import Footer from "@/components/shared/Footer";
import { OptimalCinematicWrapper } from "@/components/OptimalCinematicWrapper";
import NotificationProvider from "@/components/providers/NotificationProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { GoogleAnalytics } from '@next/third-parties/google';
import { WebVitals } from "@/components/analytics/WebVitals";
import { LocalBusinessSchema, WebSiteSchema, SpeakableSchema } from "@/components/seo/StructuredData";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Book Horse Riding at Pyramids Egypt | PyraRides - #1 Marketplace",
    template: "%s | PyraRides - Egypt's Horse Riding Booking Platform",
  },
  description: "PyraRides is Egypt's first online marketplace for booking horse riding experiences at the Giza and Saqqara Pyramids. Compare and book from multiple verified stables in one platform. 100% verified, instant booking, best prices guaranteed. ⭐ 4.9/5 rating.",
  keywords: [
    "horse riding Egypt",
    "horse riding pyramids",
    "horse riding Giza",
    "book horse riding Egypt",
    "horse riding booking Egypt",
    "horse riding marketplace Egypt",
    "compare horse riding stables",
    "horse riding platform Egypt",
    "online horse riding booking Egypt",
    "Giza horse riding",
    "Saqqara horse riding",
    "horse riding near pyramids",
    "pyramid horse tours",
    "horse stables Giza",
    "Egypt horse riding",
    "Cairo horse riding",
    "book horse ride Giza",
    "safe horse riding Egypt",
    "Arabian horse riding",
    "sunset horse riding pyramids",
    "horse riding experience Egypt",
    "best horse riding Egypt",
  ],
  authors: [{ name: "PyraRides" }],
  creator: "PyraRides",
  publisher: "PyraRides",
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
    title: "PyraRides - Book Your Trusted Giza Horse Riding Experience",
    description: "The Pyramids, Unforgettable. The Ride, Uncomplicated. Book your trusted, vetted ride at Giza and Saqqara.",
    url: "https://www.pyrarides.com",
    siteName: "PyraRides",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.pyrarides.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PyraRides - Horse Riding at the Pyramids",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PyraRides - Book Your Trusted Giza Horse Riding Experience",
    description: "The Pyramids, Unforgettable. The Ride, Uncomplicated.",
    creator: "@PyraRides",
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
    title: "PyraRides",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
};

import RouteLayoutAdapter from "@/components/shared/RouteLayoutAdapter";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.location.pathname.startsWith('/dashboard/driver')) {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark', 'bg-black');
          }
        `}} />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

        <LocalBusinessSchema />
        <WebSiteSchema />
        <SpeakableSchema />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <NotificationProvider>
            <RouteLayoutAdapter
              driverContent={<main id="main-content">{children}</main>}
              consumerContent={
                <>
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
                </>
              }
            />
          </NotificationProvider>
        </AuthProvider>

        {/* Google Analytics - Strict Lazy Load */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
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

        {/* Plausible Analytics */}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="www.pyrarides.com"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
