"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
    useReportWebVitals((metric) => {
        // Log to console in development
        if (process.env.NODE_ENV === "development") {
            console.log(metric);
        }

        // You can send metrics to your analytics service here
        // const body = JSON.stringify(metric);
        // const url = 'https://example.com/analytics';
        // if (navigator.sendBeacon) {
        //   navigator.sendBeacon(url, body);
        // } else {
        //   fetch(url, { body, method: 'POST', keepalive: true });
        // }
    });

    return null;
}
