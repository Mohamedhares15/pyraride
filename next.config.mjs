import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    // Remove React properties in production for smaller bundle
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Security Headers
  async headers() {
    return [
      // Immutable cache for Next.js static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Explicit cache rule for icon.png
      {
        source: '/icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache public static files (images, fonts)
      {
        source: '/(.*)\\.(webp|png|jpg|jpeg|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // Sitemap - NO CACHING
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // Content-Security-Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io https://www.gstatic.com https://upload-widget.cloudinary.com https://widget.cloudinary.com",
              "worker-src 'self' blob: https://www.gstatic.com",
              "child-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob: images.unsplash.com images.pexels.com lh3.googleusercontent.com https://res.cloudinary.com",
              "connect-src 'self' https://api.paymob.com https://www.google-analytics.com https://*.vercel.app https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com https://raw.githubusercontent.com https://*.googleusercontent.com https://plausible.io https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://api.cloudinary.com https://*.cloudinary.com",
              "frame-src 'self' https://accept.paymob.com https://www.google.com https://upload-widget.cloudinary.com",
              "media-src 'self' https://videos.pexels.com data: https://res.cloudinary.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  // Compression
  compress: true,
  // SWC minification (faster than Terser)
  swcMinify: true,
  // SEO Redirects: Force www and HTTPS
  async redirects() {
    return [
      // ...
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'pyrarides.com' }],
        destination: 'https://www.pyrarides.com/:path*',
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion', '@radix-ui/react-icons', '@radix-ui/react-popover'],
    optimizeCss: true,
  },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Fonts — CacheFirst, never change
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      // Static font files
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-fonts",
          expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // Images
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-images",
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // JS and CSS
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        },
      },

      // ===== API ROUTES — SPLIT BY SAFETY =====

      // Slots — ALWAYS real-time, never cache
      {
        urlPattern: /\/api\/stables\/[^/]+\/slots/,
        handler: "NetworkOnly",
      },
      // Bookings — ALWAYS real-time, never cache
      {
        urlPattern: /\/api\/bookings/,
        handler: "NetworkOnly",
      },
      // Checkout — ALWAYS real-time
      {
        urlPattern: /\/api\/checkout/,
        handler: "NetworkOnly",
      },
      // Auth — ALWAYS real-time
      {
        urlPattern: /\/api\/auth/,
        handler: "NetworkOnly",
      },
      // Push token — ALWAYS real-time
      {
        urlPattern: /\/api\/user\/push-token/,
        handler: "NetworkOnly",
      },

      // Stables list — safe to serve stale for 5 minutes
      {
        urlPattern: /\/api\/stables(\?|$)/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "stables-list",
          expiration: { maxEntries: 5, maxAgeSeconds: 300 },
        },
      },
      // Individual stable detail — safe to serve stale for 1 hour
      {
        urlPattern: /\/api\/stables\/[^/]+(\?|$)/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "stable-detail",
          expiration: { maxEntries: 30, maxAgeSeconds: 3600 },
        },
      },
      // Packages — rarely change, 2 hour cache
      {
        urlPattern: /\/api\/packages/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "packages",
          expiration: { maxEntries: 10, maxAgeSeconds: 7200 },
        },
      },
      // Notifications — 30 second stale acceptable
      {
        urlPattern: /\/api\/notifications/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "notifications",
          expiration: { maxEntries: 2, maxAgeSeconds: 30 },
        },
      },
      // Leaderboard — 10 minute cache
      {
        urlPattern: /\/api\/leaderboard/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "leaderboard",
          expiration: { maxEntries: 5, maxAgeSeconds: 600 },
        },
      },
      // Transport zones — almost never change
      {
        urlPattern: /\/api\/transport-zones/,
        handler: "CacheFirst",
        options: {
          cacheName: "transport-zones",
          expiration: { maxEntries: 5, maxAgeSeconds: 86400 },
        },
      },
      // Locations — almost never change
      {
        urlPattern: /\/api\/locations/,
        handler: "CacheFirst",
        options: {
          cacheName: "locations",
          expiration: { maxEntries: 5, maxAgeSeconds: 86400 },
        },
      },

      // Everything else — NetworkFirst with short timeout
      {
        urlPattern: /\/api\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-fallback",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 16, maxAgeSeconds: 60 },
        },
      },
    ]
  },
});

export default withPWA(nextConfig);
