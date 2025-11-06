"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function GoogleAnalytics({ trackingId }: { trackingId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (trackingId && typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", trackingId, {
        page_path: pathname,
      });
    }
  }, [pathname, trackingId]);

  if (!trackingId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

export function Plausible({ domain }: { domain?: string }) {
  if (!domain) return null;

  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  );
}

// Web Vitals tracking
export function reportWebVitals(metric: any) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", metric.name, {
      value: Math.round(metric.value),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

