// Google Analytics helper functions

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track booking start
export const trackBookingStart = (stableId: string, stableName: string) => {
  event({
    action: "start_booking",
    category: "Booking",
    label: `${stableName} (${stableId})`,
  });
};

// Track booking complete
export const trackBookingComplete = (bookingId: string, amount: number) => {
  event({
    action: "booking_complete",
    category: "Booking",
    label: bookingId,
    value: amount,
  });
};

// Track search
export const trackSearch = (query: string, results: number) => {
  event({
    action: "search",
    category: "Search",
    label: query,
    value: results,
  });
};

// Track review submission
export const trackReview = (stableId: string, rating: number) => {
  event({
    action: "submit_review",
    category: "Reviews",
    label: stableId,
    value: rating,
  });
};

