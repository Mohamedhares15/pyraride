"use client";

import { useEffect } from "react";

export default function OrientationLock() {
  useEffect(() => {
    // Lock orientation to portrait on mobile devices
    const lockOrientation = async () => {
      // Check if running on mobile (screen width <= 768px)
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
        try {
          // Use type assertion to access orientation lock methods
          const screenAny = screen as any;
          
          // Try Screen Orientation API
          if (screenAny.orientation?.lock) {
            await screenAny.orientation.lock("portrait").catch((err: any) => {
              // Some browsers don't support this or require user gesture
              console.log("Orientation lock not supported or requires user interaction");
            });
          }
          // Try legacy API
          else if (screenAny.lockOrientation) {
            screenAny.lockOrientation("portrait");
          }
          // Try webkit prefix
          else if (screenAny.webkitLockOrientation) {
            screenAny.webkitLockOrientation("portrait");
          }
          // Try moz prefix
          else if (screenAny.mozLockOrientation) {
            screenAny.mozLockOrientation("portrait");
          }
          // Try ms prefix
          else if (screenAny.msLockOrientation) {
            screenAny.msLockOrientation("portrait");
          }
        } catch (error) {
          console.log("Orientation lock not available:", error);
        }
      }
    };

    // Lock on mount
    lockOrientation();

    // Lock on resize (when orientation might change)
    if (typeof window !== "undefined") {
      window.addEventListener("resize", lockOrientation);
      window.addEventListener("orientationchange", lockOrientation);

      return () => {
        window.removeEventListener("resize", lockOrientation);
        window.removeEventListener("orientationchange", lockOrientation);
      };
    }
  }, []);

  return null;
}

