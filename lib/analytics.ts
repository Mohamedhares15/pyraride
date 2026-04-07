// lib/analytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

type GtagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

// Log specific events
export const logEvent = ({ action, category, label, value, ...rest }: GtagEvent) => {
  if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest,
    });
  } else {
    // If running in development without GA, safely log to console instead
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA Event Simulation] ${action}`, { category, label, value, ...rest });
    }
  }
};
